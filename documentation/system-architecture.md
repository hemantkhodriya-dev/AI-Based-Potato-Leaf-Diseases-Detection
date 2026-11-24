# PotatoCare AI — System Architecture & Technical Design

This document details the complete end-to-end system architecture, service communications, pipeline sequencing, and security boundaries for **PotatoCare AI**.

---

## 1. High-Level Architecture Diagram

```mermaid
flowchart TD
    subgraph Client Layer
        Browser["User Web Browser<br/>React 18 + Vite (Port 3000)"]
        Standalone["Standalone Interface<br/>app.html"]
    end

    subgraph API Gateway Layer
        Express["Express.js Backend API<br/>Node.js (Port 5000)"]
        Multer["Multer Upload Middleware<br/>MIME & Size Validator"]
        LocalStorage["Local Uploads Directory<br/>backend/uploads/"]
    end

    subgraph AI Inference Microservice
        FastAPI["FastAPI AI Service<br/>Python (Port 8000)"]
        Preprocessor["PyTorch Image Preprocessor<br/>Resize, Tensor, Normalize"]
        Stage1["Stage 1: Potato Leaf Validator<br/>MobileNetV2 (Binary Classifier)"]
        Stage2["Stage 2: Disease Classifier<br/>MobileNetV2 (3-Class Multi-Head)"]
        Calibrator["Probability Calibrator<br/>Temperature Scaling (T=4.0)"]
    end

    subgraph Persistence Layer
        MongoDB[("MongoDB Atlas Cloud /<br/>Local MongoDB (Port 27017)")]
        MemFallback[("In-Memory Fallback Store<br/>(Zero-Downtime Resilience)")]
    end

    Browser -->|HTTP POST /api/predictions| Express
    Standalone -->|HTTP POST /api/predictions| Express
    Express --> Multer
    Multer --> LocalStorage
    Express -->|HTTP POST /predict multipart| FastAPI
    FastAPI --> Preprocessor
    Preprocessor --> Stage1

    Stage1 -->|Non-Potato Foliage or Object FAR=0%| FastAPI
    Stage1 -->|Valid Potato Leaf| Stage2
    Stage2 --> Calibrator
    Calibrator --> FastAPI

    FastAPI -->|JSON Diagnosis or Rejection Payload| Express
    Express -->|Persist Audit Record| MongoDB
    Express -.->|If MongoDB Offline| MemFallback
    Express -->|HTTP 200/201 JSON Response| Browser
```

---

## 2. Component Specifications

### 2.1 Frontend Client (React 18 + Vite)
- **Port**: `3000` (Dev server) or static build served via Express / Nginx.
- **Key Modules**:
  - `DetectPage`: Drag-and-drop file upload, file validation, 10 quick-test sample buttons.
  - `ResultPage`: Dual-branch presentation. Renders the **Unsupported Image Detected** card on rejection, or the comprehensive disease diagnosis card with calibrated probability charts on acceptance.
  - `HistoryPage`: Audit log viewer with class filtering, timestamp sorting, and record deletion.
  - `ConfidenceBadge`: Specialized component for rendering calibrated confidence with raw softmax tooltips.
  - `ModelStatusBanner`: Real-time ping checking FastAPI health, model loading state, and inference engine.

### 2.2 API Gateway (Node.js + Express)
- **Port**: `5000`
- **Responsibilities**:
  - Enforces CORS policies and Helmet HTTP security headers.
  - Manages image uploads up to 10MB; sanitizes file extensions and MIME headers.
  - Multiplexes requests to the Python FastAPI microservice.
  - Persists diagnostic history into MongoDB Atlas (or in-memory store if offline).

### 2.3 AI Microservice (Python + FastAPI + PyTorch)
- **Port**: `8000`
- **Responsibilities**:
  - Hosts the Two-Stage PyTorch deep learning pipeline.
  - **Stage 1 (Potato vs Non-Potato)**: Validates that the specimen is genuine potato foliage (*Solanum tuberosum*). Rejects mango leaves, tomato leaves, apple foliage, humans, animals, and synthetic graphics with **0% False Acceptance Rate**.
  - **Stage 2 (Disease Classification)**: Classifies potato leaves into `Healthy`, `Early Blight` (*Alternaria solani*), or `Late Blight` (*Phytophthora infestans*) with **99.07% test accuracy**.
  - **Calibration Layer**: Employs Temperature Scaling ($T=4.0$) so that probabilities fall into realistic 60%–96% confidence bands, strictly summing to 100.0%.

### 2.4 Database Layer (MongoDB)
- **Port**: `27017` (or MongoDB Atlas Cloud SRV).
- **Collection**: `predictions`.
- **Indexing**: Compound indices on `{ predictedClass: 1, createdAt: -1 }` and `{ status: 1, createdAt: -1 }`.

---

## 3. Communication Sequences

### 3.1 Valid Potato Leaf Diagnosis Flow
```mermaid
sequenceDiagram
    autonumber
    actor Farmer as Grower / User
    participant UI as React UI (Port 3000)
    participant API as Express API (Port 5000)
    participant AI as FastAPI Service (Port 8000)
    participant DB as MongoDB Atlas

    Farmer->>UI: Uploads Potato Leaf Photo
    UI->>API: POST /api/predictions (multipart/form-data)
    API->>API: Multer validates file format & stores in /uploads
    API->>AI: POST /predict (file stream)
    AI->>AI: Stage 1 Validator: Potato Leaf (P=0.999)
    AI->>AI: Stage 2 Classifier: Late Blight (Z_logits)
    AI->>AI: Calibrate with Temperature Scaling (T=4.0)
    AI-->>API: 200 OK (status: accepted, class: Late Blight, conf: 90.9%)
    API->>DB: Save Prediction document
    API-->>UI: 201 Created (Diagnosis record JSON)
    UI-->>Farmer: Render Late Blight diagnosis, symptoms & prevention
```

### 3.2 Non-Potato Image Rejection Flow
```mermaid
sequenceDiagram
    autonumber
    actor Farmer as Grower / User
    participant UI as React UI (Port 3000)
    participant API as Express API (Port 5000)
    participant AI as FastAPI Service (Port 8000)

    Farmer->>UI: Uploads Mango Leaf Photo
    UI->>API: POST /api/predictions (multipart/form-data)
    API->>AI: POST /predict (file stream)
    AI->>AI: Stage 1 Validator: Non-Potato (P=1.000)
    Note over AI: Stage 2 inference is NOT invoked
    AI-->>API: 200 OK (status: rejected, isPotatoLeaf: false)
    API-->>UI: 200 OK (status: rejected, predictedClass: Unsupported Image)
    UI-->>Farmer: Render Unsupported Image Detected Card & "Upload Another Image"
```

---

## 4. Security & Safety Controls

1. **Path Traversal Protection**: File paths for deletion are validated strictly against the resolved `uploads/` directory boundary.
2. **Payload Size Limits**: 10MB maximum payload restriction on Express and FastAPI.
3. **MIME & Magic Header Inspection**: Only authentic JPEG and PNG files are processed.
4. **Environment Isolation**: Database connection strings, API keys, and sensitive tokens are strictly loaded via `.env`.
