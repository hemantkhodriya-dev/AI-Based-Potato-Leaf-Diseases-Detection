# PotatoCare AI — Database Architecture & MongoDB Configuration

This directory contains the database schema definitions and indexing strategies for **PotatoCare AI**.

---

## 1. Dual-Mode Persistence Strategy

1. **Primary (MongoDB Atlas Cloud / Local MongoDB)**:
   - Diagnoses, calibrated confidence scores, multi-class probability maps, Stage 1 validation outcomes, and specimen file metadata are permanently indexed and stored.
2. **Graceful Fallback (Memory Store)**:
   - If MongoDB connection is temporarily unavailable or in offline evaluation mode, the backend automatically transitions to an in-memory storage fallback without crashing or refusing user uploads.

---

## 2. Directory Structure

```text
database/
├── schemas/
│   └── PredictionSchema.js       # Complete Mongoose schema definition with indexes
└── README.md                     # Database documentation
```

---

## 3. Schema Architecture (`PredictionSchema.js`)

Each prediction document tracks the full lifecycle of a leaf diagnosis:

| Field | Type | Description |
|---|---|---|
| `imageUrl` | `String` (Required) | Client-accessible URL for the uploaded leaf specimen |
| `imagePath` | `String` (Required) | Local filesystem path to the leaf image in `backend/uploads/` |
| `predictedClass` | `String` (Enum) | `Healthy`, `Early Blight`, `Late Blight`, `Unsupported Image` |
| `status` | `String` (Enum) | `accepted` (valid potato foliage) or `rejected` (non-target object) |
| `isPotatoLeaf` | `Boolean` | Stage 1 validation flag (`true` if genuine potato leaf) |
| `validationStatus`| `String` | Detailed status string (`valid_potato_leaf`, `unsupported_image`) |
| `validationMessage`| `String` | Guidance shown to growers upon rejection |
| `stage1` | `Object` | Probability breakdown for `potatoProbability` and `nonPotatoProbability` |
| `confidence` | `Number` | Genuine calibrated confidence value (0.000 to 1.000) |
| `calibratedConfidence` | `Number` | Temperature-scaled confidence ($T=4.0$, 60%–96% typical range) |
| `rawConfidence` | `Number` | Uncalibrated raw softmax probability for comparison |
| `classProbabilities` | `Map<String, Number>` | Calibrated probabilities for all 3 classes (sums to 100%) |
| `rawProbabilities` | `Map<String, Number>` | Raw uncalibrated probabilities |
| `createdAt` | `Date` (Indexed) | Timestamp of diagnosis creation |

---

## 4. Connection Configuration

Define your MongoDB connection string in `.env`:

### MongoDB Atlas Cloud Cluster
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/potatocare?retryWrites=true&w=majority
```

### Local MongoDB Service
```env
MONGO_URI=mongodb://127.0.0.1:27017/potatocare
```
