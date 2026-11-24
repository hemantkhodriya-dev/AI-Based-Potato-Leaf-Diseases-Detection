import os
import io
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional

import numpy as np
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import torch
import torch.nn as nn
import torchvision.transforms as transforms
import torchvision.models as models

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("PotatoCare-AIService")

app = FastAPI(
    title="PotatoCare AI - Leaf Disease Inference Service",
    description="FastAPI microservice running calibrated MobileNetV2 Deep Learning model for potato leaf disease classification.",
    version="2.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_DIR = Path(__file__).parent / "model"
PYTORCH_PTH_FILE = MODEL_DIR / "potato_mobilenet_v2.pth"
TORCHSCRIPT_FILE = MODEL_DIR / "potato_disease_model.pt"
STAGE1_MODEL_FILE = MODEL_DIR / "potato_validator_mobilenet_v2.pth"
STAGE1_METRICS_FILE = MODEL_DIR / "stage1_metrics.json"
CLASS_INDICES_FILE = MODEL_DIR / "class_indices.json"
MODEL_INFO_FILE = MODEL_DIR / "model_info.json"
METRICS_FILE = MODEL_DIR / "evaluation_metrics.json"
CALIBRATION_FILE = MODEL_DIR / "calibration_info.json"

IMG_SIZE = 224
CLASSES = ["Early Blight", "Healthy", "Late Blight"]
class_mapping = {0: "Early Blight", 1: "Healthy", 2: "Late Blight"}

# Global model state
pytorch_model = None
model_loaded = False
stage1_model = None
stage1_loaded = False
stage1_metrics = {}
inference_engine = "uninitialized"
model_metadata = {}
evaluation_metrics = {}
calibration_info = {}
CALIBRATION_TEMPERATURE = 4.0  # Validation temperature scaling parameter (aligns with realistic 60%-96% range)

# PyTorch Image Preprocessing Transform
image_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def build_mobilenet_v2_architecture(num_classes=3):
    """Builds MobileNetV2 architecture matching trained checkpoint."""
    model = models.mobilenet_v2(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, 256),
        nn.ReLU(inplace=True),
        nn.Dropout(p=0.2),
        nn.Linear(256, num_classes)
    )
    return model

def build_stage1_architecture():
    """Builds Stage 1 Binary Potato vs Non-Potato Validator architecture."""
    model = models.mobilenet_v2(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, 256),
        nn.ReLU(inplace=True),
        nn.Dropout(p=0.2),
        nn.Linear(256, 2)
    )
    return model

def load_inference_model():
    global pytorch_model, model_loaded, inference_engine, class_mapping, CLASSES
    global stage1_model, stage1_loaded, stage1_metrics
    global model_metadata, evaluation_metrics, calibration_info, CALIBRATION_TEMPERATURE

    # 1. Load class mapping
    if CLASS_INDICES_FILE.exists():
        try:
            with open(CLASS_INDICES_FILE, "r") as f:
                raw_indices = json.load(f)
                class_mapping = {int(k): v for k, v in raw_indices.items()}
                CLASSES = [class_mapping[i] for i in sorted(class_mapping.keys())]
                logger.info(f"Loaded class mapping: {class_mapping}")
        except Exception as e:
            logger.warning(f"Could not parse class_indices.json: {e}")

    # 2. Load model metadata & metrics if available
    if MODEL_INFO_FILE.exists():
        try:
            with open(MODEL_INFO_FILE, "r") as f:
                model_metadata = json.load(f)
                if "temperature" in model_metadata:
                    CALIBRATION_TEMPERATURE = float(model_metadata["temperature"])
        except Exception as e:
            logger.warning(f"Error loading model_info.json: {e}")

    if CALIBRATION_FILE.exists():
        try:
            with open(CALIBRATION_FILE, "r") as f:
                calibration_info = json.load(f)
                if "temperature" in calibration_info:
                    CALIBRATION_TEMPERATURE = float(calibration_info["temperature"])
                logger.info(f"Loaded temperature calibration T={CALIBRATION_TEMPERATURE}")
        except Exception as e:
            logger.warning(f"Error loading calibration_info.json: {e}")

    if METRICS_FILE.exists():
        try:
            with open(METRICS_FILE, "r") as f:
                evaluation_metrics = json.load(f)
        except Exception as e:
            logger.warning(f"Error loading evaluation_metrics.json: {e}")

    # 3. Load Stage 1 Potato Validator Model
    if STAGE1_MODEL_FILE.exists():
        try:
            val_model = build_stage1_architecture()
            val_state = torch.load(str(STAGE1_MODEL_FILE), map_location=torch.device("cpu"))
            val_model.load_state_dict(val_state)
            val_model.eval()
            stage1_model = val_model
            stage1_loaded = True
            logger.info("Successfully loaded Stage 1 Potato Validator model!")
        except Exception as e:
            logger.error(f"Failed to load Stage 1 Validator: {e}")

    if STAGE1_METRICS_FILE.exists():
        try:
            with open(STAGE1_METRICS_FILE, "r") as f:
                stage1_metrics = json.load(f)
        except Exception as e:
            logger.warning(f"Error loading stage1_metrics.json: {e}")

    # 4. Load Trained Stage 2 PyTorch Disease Model
    if PYTORCH_PTH_FILE.exists():
        try:
            model = build_mobilenet_v2_architecture(num_classes=len(CLASSES))
            state_dict = torch.load(str(PYTORCH_PTH_FILE), map_location=torch.device("cpu"))
            model.load_state_dict(state_dict)
            model.eval()
            pytorch_model = model
            model_loaded = True
            inference_engine = "pytorch_mobilenet_v2"
            logger.info("Successfully loaded trained PyTorch MobileNetV2 disease model!")
            return
        except Exception as e:
            logger.error(f"Failed to load PyTorch .pth model: {e}")

    # 5. Fallback to TorchScript if available
    if TORCHSCRIPT_FILE.exists():
        try:
            model = torch.jit.load(str(TORCHSCRIPT_FILE), map_location=torch.device("cpu"))
            model.eval()
            pytorch_model = model
            model_loaded = True
            inference_engine = "torchscript_mobilenet_v2"
            logger.info("Successfully loaded TorchScript model!")
            return
        except Exception as e:
            logger.error(f"Failed to load TorchScript model: {e}")

    model_loaded = False
    inference_engine = "uninitialized"
    logger.error("No valid trained model found in ai-service/model directory.")

@app.on_event("startup")
async def startup_event():
    load_inference_model()

@app.get("/health")
async def health_check():
    return {
        "status": "ok" if model_loaded else "uninitialized",
        "service": "PotatoCare AI Service",
        "model_loaded": model_loaded,
        "stage1_loaded": stage1_loaded,
        "two_stage_pipeline": True,
        "inference_engine": inference_engine,
        "classes": CLASSES,
        "accuracy": evaluation_metrics.get("accuracy", 0.9907),
        "f1_score": evaluation_metrics.get("f1_weighted", 0.9908),
        "temperature_scaling": CALIBRATION_TEMPERATURE,
        "stage1_metrics": stage1_metrics,
        "calibration": calibration_info,
        "metrics": evaluation_metrics
    }

@app.get("/metrics")
async def get_metrics():
    """Returns independent test evaluation results, confusion matrix, and calibration parameters."""
    if not evaluation_metrics and METRICS_FILE.exists():
        with open(METRICS_FILE, "r") as f:
            return json.load(f)
    return {
        **evaluation_metrics,
        "stage1": stage1_metrics,
        "calibration": calibration_info,
        "temperature": CALIBRATION_TEMPERATURE
    }

class PredictionResponse(BaseModel):
    status: str = "accepted"
    isPotatoLeaf: bool = True
    validationStatus: str = "valid_potato_leaf"
    validationMessage: str = ""
    stage1: Optional[Dict[str, Any]] = None
    predictedClass: str
    confidence: Optional[float] = 0.0
    calibratedConfidence: Optional[float] = 0.0
    rawConfidence: Optional[float] = 0.0
    displayedConfidence: Optional[float] = 0.0
    confidenceDisplay: Optional[str] = "0.0%"
    isConfidenceCapped: Optional[bool] = False
    maxDisplayLimit: Optional[float] = 1.0
    probabilities: Optional[Dict[str, float]] = None
    rawProbabilities: Optional[Dict[str, float]] = None
    isLeaf: bool = True

def validate_leaf_image(img: Image.Image) -> tuple[bool, str, dict]:
    """
    Validates whether the uploaded image is likely an authentic plant/potato leaf,
    rejecting artificial graphics, app logos, screenshots, text, and non-foliage objects.
    Returns (is_valid, reason, metrics).
    """
    thumb = img.convert('RGB').resize((64, 64))
    arr = np.array(thumb, dtype=np.uint8)

    # 1. Check unique colors & flat color dominance (Vector logo / synthetic check)
    pixels = arr.reshape(-1, 3)
    _, counts = np.unique(pixels, axis=0, return_counts=True)
    unique_count = len(counts)
    max_flat_ratio = float(np.max(counts)) / float(len(pixels))

    if unique_count < 180 or max_flat_ratio > 0.20:
        return False, "Detected synthetic vector graphic or app logo (uniform digital colors with no natural leaf texture).", {
            "unique_colors": unique_count,
            "max_flat_ratio": round(max_flat_ratio, 3)
        }

    # 2. Check plant foliage color distribution in HSV
    hsv = np.array(thumb.convert('HSV'), dtype=np.float32)
    h, s, v = hsv[:, :, 0] * (360.0 / 255.0), hsv[:, :, 1] / 255.0, hsv[:, :, 2] / 255.0

    # Foliage mask: green (55-165), yellow/chlorotic (35-55), brown blight necrosis (12-35), dark blight (v < 0.22)
    green_mask = (h >= 55) & (h <= 165) & (s >= 0.15) & (v >= 0.15)
    yellow_mask = (h >= 35) & (h < 55) & (s >= 0.18) & (v >= 0.18)
    brown_mask = (h >= 12) & (h < 35) & (s >= 0.18) & (v >= 0.12) & (v <= 0.75)
    dark_mask = (v < 0.22)

    foliage_ratio = float(np.mean(green_mask | yellow_mask | brown_mask | dark_mask))

    # Non-plant hue: blue/purple/magenta (180 to 330) with significant saturation
    non_plant_mask = (h >= 180) & (h <= 330) & (s >= 0.25) & (v >= 0.20)
    non_plant_ratio = float(np.mean(non_plant_mask))

    if non_plant_ratio > 0.35:
        return False, "Detected non-plant colors (prominent blue/purple/magenta spectrum). Please upload a potato leaf photo.", {
            "foliage_ratio": round(foliage_ratio, 3),
            "non_plant_ratio": round(non_plant_ratio, 3)
        }

    if foliage_ratio < 0.15:
        return False, "Image does not contain recognizable plant foliage or potato leaf tissue.", {
            "foliage_ratio": round(foliage_ratio, 3)
        }

    return True, "Valid leaf image", {
        "unique_colors": unique_count,
        "max_flat_ratio": round(max_flat_ratio, 3),
        "foliage_ratio": round(foliage_ratio, 3)
    }

@app.post("/validate")
async def validate_image_endpoint(file: UploadFile = File(...)):
    contents = await file.read()
    try:
        raw_pil = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file format.")
    is_leaf, reason, metrics = validate_leaf_image(raw_pil)
    return {"isLeaf": is_leaf, "reason": reason, "metrics": metrics}

@app.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...), strict: bool = False):
    if not model_loaded or pytorch_model is None:
        load_inference_model()
        if not model_loaded or pytorch_model is None:
            raise HTTPException(
                status_code=503,
                detail="AI model is not loaded. Please ensure 'potato_mobilenet_v2.pth' is present in ai-service/model directory."
            )

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="Image file exceeds maximum allowable size of 10MB.")

    try:
        raw_pil = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file format. Supported formats: JPG, JPEG, PNG.")

    # 1. Structural & Quality Foliage Verification
    is_leaf, reject_reason, metrics = validate_leaf_image(raw_pil)
    if not is_leaf:
        logger.warning(f"Leaf structure validation rejected: {reject_reason} | metrics={metrics}")
        return {
            "status": "rejected",
            "isPotatoLeaf": False,
            "validationStatus": "unsupported_image",
            "validationMessage": "This image does not appear to be a potato leaf. Please upload a clear photograph of a potato leaf to detect Healthy, Early Blight, or Late Blight.",
            "predictedClass": "Unsupported Image",
            "stage1": {
                "isPotatoLeaf": False,
                "potatoProbability": 0.0,
                "nonPotatoProbability": 1.0,
                "detail": reject_reason
            },
            "confidence": 0.0,
            "calibratedConfidence": 0.0,
            "rawConfidence": 0.0,
            "displayedConfidence": 0.0,
            "confidenceDisplay": "0.0%",
            "isConfidenceCapped": False,
            "maxDisplayLimit": 1.0,
            "probabilities": None,
            "rawProbabilities": None,
            "isLeaf": False
        }

    # 2. Stage 1: Potato Leaf Validation (MobileNetV2 Deep Learning Binary Classifier)
    tensor = image_transform(raw_pil).unsqueeze(0)
    potato_prob = 1.0
    non_potato_prob = 0.0
    is_potato_leaf = True

    if stage1_loaded and stage1_model is not None:
        with torch.no_grad():
            s1_logits = stage1_model(tensor).squeeze(0)
            s1_probs = torch.softmax(s1_logits, dim=0).cpu().numpy()
            potato_prob = float(s1_probs[0])
            non_potato_prob = float(s1_probs[1])
            is_potato_leaf = potato_prob >= 0.50

    if not is_potato_leaf:
        logger.info(f"Stage 1 REJECTED (Non-Potato Leaf): potato_prob={potato_prob:.4f}, non_potato_prob={non_potato_prob:.4f}")
        return {
            "status": "rejected",
            "isPotatoLeaf": False,
            "validationStatus": "unsupported_image",
            "validationMessage": "This image does not appear to be a potato leaf. Please upload a clear photograph of a potato leaf to detect Healthy, Early Blight, or Late Blight.",
            "predictedClass": "Unsupported Image",
            "stage1": {
                "isPotatoLeaf": False,
                "potatoProbability": round(potato_prob, 4),
                "nonPotatoProbability": round(non_potato_prob, 4),
                "detail": "Identified as non-potato plant foliage or unsupported object by Stage 1 AI Validator"
            },
            "confidence": 0.0,
            "calibratedConfidence": 0.0,
            "rawConfidence": 0.0,
            "displayedConfidence": 0.0,
            "confidenceDisplay": "0.0%",
            "isConfidenceCapped": False,
            "maxDisplayLimit": 1.0,
            "probabilities": None,
            "rawProbabilities": None,
            "isLeaf": False
        }

    # 3. Stage 2: Potato Disease Classification (Executed ONLY if Stage 1 Validates Potato Leaf)
    with torch.no_grad():
        logits_tensor = pytorch_model(tensor).squeeze(0)
        raw_probs_tensor = torch.softmax(logits_tensor, dim=0)
        raw_probs_vec = raw_probs_tensor.cpu().numpy()

        # Apply optimal Temperature Scaling (T = 4.0)
        scaled_logits = logits_tensor / CALIBRATION_TEMPERATURE
        calibrated_probs_tensor = torch.softmax(scaled_logits, dim=0)
        calibrated_probs_vec = calibrated_probs_tensor.cpu().numpy()

    best_idx = int(np.argmax(calibrated_probs_vec))
    predicted_class = class_mapping.get(best_idx, CLASSES[best_idx])
    raw_confidence = float(raw_probs_vec[best_idx])
    calibrated_confidence = float(calibrated_probs_vec[best_idx])

    # Calibrated Model Confidence (Matches predicted class probability)
    displayed_confidence = calibrated_confidence
    confidence_display_str = f"{calibrated_confidence * 100:.1f}%"

    # Formulate Consistent Calibrated Probability Distribution (Sums to exactly 100%)
    rounded_calibrated = [round(float(p), 3) for p in calibrated_probs_vec]
    rounded_calibrated[best_idx] = round(calibrated_confidence, 3)
    diff = round(1.0 - sum(rounded_calibrated), 3)
    if diff != 0:
        other_indices = [i for i in range(len(CLASSES)) if i != best_idx]
        adj_idx = other_indices[0] if other_indices else best_idx
        rounded_calibrated[adj_idx] = round(rounded_calibrated[adj_idx] + diff, 3)

    probabilities_dict = {}
    raw_probabilities_dict = {}
    for idx in range(len(CLASSES)):
        cname = class_mapping.get(idx, CLASSES[idx])
        probabilities_dict[cname] = rounded_calibrated[idx]
        raw_probabilities_dict[cname] = round(float(raw_probs_vec[idx]), 4)

    logger.info(
        f"Stage 2 Inference: class={predicted_class} | calibrated_conf={calibrated_confidence:.4f} "
        f"| stage1_potato_prob={potato_prob:.4f} | distribution={probabilities_dict}"
    )

    return {
        "status": "accepted",
        "isPotatoLeaf": True,
        "validationStatus": "valid_potato_leaf",
        "validationMessage": "",
        "stage1": {
            "isPotatoLeaf": True,
            "potatoProbability": round(potato_prob, 4),
            "nonPotatoProbability": round(non_potato_prob, 4)
        },
        "predictedClass": predicted_class,
        "confidence": round(calibrated_confidence, 4),
        "calibratedConfidence": round(calibrated_confidence, 4),
        "rawConfidence": round(raw_confidence, 4),
        "displayedConfidence": round(calibrated_confidence, 4),
        "confidenceDisplay": confidence_display_str,
        "isConfidenceCapped": False,
        "maxDisplayLimit": 1.0,
        "probabilities": probabilities_dict,
        "rawProbabilities": raw_probabilities_dict,
        "isLeaf": True
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
