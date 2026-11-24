# PotatoCare AI — REST API Documentation

This document describes all API endpoints provided by the **Express Backend Gateway** (Port 5000) and the **Python FastAPI AI Microservice** (Port 8000).

---

## 1. Express Backend Gateway (Port 5000)

Base URL: `http://localhost:5000`

### 1.1 Health & Status Check
- **Endpoint**: `GET /api/health`
- **Description**: Returns the health state of the Express gateway, MongoDB connection status, and AI microservice health.
- **Response `200 OK`**:
```json
{
  "status": "ok",
  "service": "PotatoCare Backend API",
  "database": "MongoDB",
  "aiServiceUrl": "http://127.0.0.1:8000",
  "aiServiceStatus": {
    "status": "ok",
    "service": "PotatoCare AI Service",
    "model_loaded": true,
    "stage1_loaded": true,
    "two_stage_pipeline": true,
    "inference_engine": "pytorch_mobilenet_v2",
    "accuracy": 0.9907,
    "f1_score": 0.9908,
    "temperature_scaling": 4.0
  },
  "timestamp": "2026-11-25T01:52:30.146Z"
}
```

---

### 1.2 Upload & Classify Leaf Image
- **Endpoint**: `POST /api/predictions`
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `image`: Image file (`.jpg`, `.jpeg`, `.png`, max 10MB)

#### Success Response A: Valid Potato Leaf (HTTP 201 Created)
```json
{
  "_id": "674390b1c2b5360012345678",
  "status": "accepted",
  "isPotatoLeaf": true,
  "validationStatus": "valid_potato_leaf",
  "stage1": {
    "isPotatoLeaf": true,
    "potatoProbability": 0.9998,
    "nonPotatoProbability": 0.0002
  },
  "imageUrl": "/uploads/leaf-1795551763276-580574772.jpg",
  "imagePath": "C:\\Users\\...\\backend\\uploads\\leaf-1795551763276-580574772.jpg",
  "predictedClass": "Healthy",
  "confidence": 0.8356,
  "calibratedConfidence": 0.8356,
  "rawConfidence": 0.9992,
  "displayedConfidence": 0.8356,
  "isConfidenceCapped": false,
  "maxDisplayLimit": 1.0,
  "classProbabilities": {
    "Early Blight": 0.026,
    "Healthy": 0.836,
    "Late Blight": 0.138
  },
  "rawProbabilities": {
    "Early Blight": 0.0,
    "Healthy": 0.9992,
    "Late Blight": 0.0008
  },
  "isLeaf": true,
  "validationMessage": "",
  "createdAt": "2026-11-25T01:52:43.676Z"
}
```

#### Success Response B: Unsupported Image Rejection (HTTP 200 OK or 422)
*Returned when Stage 1 identifies mango leaf, tomato leaf, apple leaf, human face, animal, or non-foliage object.*
```json
{
  "_id": "rejected-1795551763993-wh9cb0",
  "status": "rejected",
  "isPotatoLeaf": false,
  "isLeaf": false,
  "imageUrl": "/uploads/leaf-1795551763887-744348246.jpg",
  "predictedClass": "Unsupported Image",
  "validationStatus": "unsupported_image",
  "validationMessage": "This image does not appear to be a potato leaf. Please upload a clear photograph of a potato leaf to detect Healthy, Early Blight, or Late Blight.",
  "stage1": {
    "isPotatoLeaf": false,
    "potatoProbability": 0.0,
    "nonPotatoProbability": 1.0,
    "detail": "Identified as non-potato plant foliage or unsupported object by Stage 1 AI Validator"
  },
  "confidence": 0,
  "calibratedConfidence": 0,
  "rawConfidence": 0,
  "displayedConfidence": 0,
  "classProbabilities": null,
  "probabilities": null,
  "createdAt": "2026-11-25T01:52:43.993Z"
}
```

---

### 1.3 List Historical Diagnoses
- **Endpoint**: `GET /api/predictions`
- **Query Parameters**:
  - `page`: Page index (default: `1`)
  - `limit`: Records per page (default: `10`)
  - `classFilter`: Filter by diagnosis (`all`, `Healthy`, `Early Blight`, `Late Blight`, `Unsupported Image`)
  - `sortBy`: `newest` (default) or `oldest`
- **Response `200 OK`**:
```json
{
  "data": [
    {
      "_id": "674390b1c2b5360012345678",
      "imageUrl": "/uploads/leaf-123.jpg",
      "predictedClass": "Early Blight",
      "calibratedConfidence": 0.9686,
      "createdAt": "2026-11-25T01:50:00.000Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### 1.4 Delete Diagnosis Record
- **Endpoint**: `DELETE /api/predictions/:id`
- **Description**: Permanently removes the diagnosis record and cleans up the associated leaf image from the filesystem.
- **Response `200 OK`**:
```json
{
  "message": "Prediction record and leaf image deleted successfully.",
  "id": "674390b1c2b5360012345678"
}
```

---

## 2. Python FastAPI Microservice (Port 8000)

Base URL: `http://localhost:8000`

### 2.1 Microservice Health
- **Endpoint**: `GET /health`
- **Response `200 OK`**: Returns inference engine, loaded models, accuracy benchmarks, and calibration settings.

### 2.2 Direct Image Inference
- **Endpoint**: `POST /predict`
- **Content-Type**: `multipart/form-data` (form field: `file`)
- **Returns**: Two-stage validation payload including `stage1` probability scores and calibrated Stage 2 disease predictions.

### 2.3 Model Information & Calibration
- `GET /model-info`: Architecture details, input size ($224 \times 224$), parameters.
- `GET /metrics`: Precision, recall, and confusion matrix on the 323-sample holdout test split.
- `GET /calibration`: Temperature value ($T=4.0$), Expected Calibration Error (ECE), and reliability diagram bins.
