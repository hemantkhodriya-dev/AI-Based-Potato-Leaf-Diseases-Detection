# 🍃 PotatoCare AI - Machine Learning Model Training Guide

This directory contains the training scripts, Google Colab Notebook, and evaluation routines for the **Potato Leaf Disease Detection Model** built with MobileNetV2 transfer learning.

---

## 1. Dataset Overview

We use the **Kaggle PlantVillage Dataset**:
- **Dataset Link**: [https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset](https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset)
- **Target Potato Classes**:
  1. `Potato___healthy` (Healthy foliage)
  2. `Potato___Early_blight` (Alternaria solani)
  3. `Potato___Late_blight` (Phytophthora infestans)
  4. `Background_without_leaves` / `Not_a_Leaf` (4th Class: Non-leaf objects, logos, rooms, random backgrounds)

> **Why a 4th "Background / Invalid" class is crucial:**  
> Standard 3-class Softmax classifiers assume *every image in the universe* belongs to one of the 3 leaf classes. If a user uploads a Spotify logo, human face, or car, a 3-class Softmax model is mathematically forced to distribute 100% of probability across the 3 potato classes (often picking "Healthy" because of the green color!).  
> Training with a 4th **`Background_without_leaves`** folder enables the neural network to explicitly classify and reject non-leaf images with high confidence.

---

## 2. Dataset Setup Options

### Option A: Automatic Download via Kaggle API (Recommended)
1. Generate an API token from your Kaggle Account page (`kaggle.json`).
2. Place `kaggle.json` in `~/.kaggle/` (or run `export KAGGLE_CONFIG_DIR=.`).
3. Run the download command:
   ```bash
   kaggle datasets download -d abdallahalidev/plantvillage-dataset -p ./dataset --unzip
   ```

### Option B: Google Colab Setup
1. Open [`train_model.ipynb`](./train_model.ipynb) in Google Colab.
2. Select **Runtime -> Change runtime type -> T4 GPU**.
3. Upload `kaggle.json` or download the zip directly in the notebook environment.

---

## 3. Training & Evaluation Pipeline

The script `train.py` executes the full pipeline:
- **Preprocessing**: Resizes images to `224 x 224 x 3` (MobileNetV2 standard input size).
- **Data Augmentation**: Rotations (25°), width/height shifts (15%), zoom (15%), shear, horizontal flip.
- **Dataset Split**: 70% Training, 15% Validation, 15% Test.
- **Model Architecture**:
  - Pre-trained `MobileNetV2` backbone (ImageNet weights).
  - Global Average Pooling layer.
  - Dense hidden layer (256 units, ReLU) + Dropout (0.4).
  - Output Dense layer (3 units, Softmax).
- **Optimization**: Adam Optimizer ($LR = 10^{-4}$), categorical cross-entropy loss, Early Stopping, ReduceLROnPlateau.

### Running Local Training:
```bash
python train.py ./dataset
```

---

## 4. Model Artifacts

After training completes, the following files are produced:
- `potato_disease_model.keras` — Trained Keras model weights and architecture.
- `class_indices.json` — Class index mapping (`0: Early Blight`, `1: Healthy`, `2: Late Blight`).
- `evaluation_metrics.json` — Actual evaluation results (Test Accuracy, Precision, Recall, F1 Score, Confusion Matrix).

Copy `potato_disease_model.keras` and `class_indices.json` into `../ai-service/model/` so the Python FastAPI service can serve predictions.
