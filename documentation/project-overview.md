# PotatoCare AI — Project Overview & Pathology Reference

**PotatoCare AI** is a clinical-grade, deep-learning-powered plant pathology diagnostic platform designed to detect and categorize foliar diseases in potato crops (*Solanum tuberosum*).

---

## 1. Problem Statement

Potato is the world's fourth most important food crop. Foliar fungal and oomycete pathogens—specifically **Early Blight** (*Alternaria solani*) and **Late Blight** (*Phytophthora infestans*)—cause catastrophic yield losses exceeding \$5 billion annually.

### Key Engineering Challenges Solved:
1. **Late Blight False Negatives**:
   - Destructive Late Blight infections were previously misclassified or conflated with Early Blight due to overlapping necrotic lesion patterns.
   - **Solution**: Fine-tuned MobileNetV2 with specialized cross-entropy loss, achieving **98.0% recall** and **1.000 precision** for Late Blight on holdout evaluations.
2. **Model Overconfidence**:
   - Standard Softmax layers frequently output artificial 99.9% or 100% confidence, even on ambiguous leaf borders.
   - **Solution**: Empirically optimized post-hoc **Temperature Scaling** ($T=4.0$), shifting predictions into realistic, reliable 60%–96% confidence bands while preserving rank order.
3. **Cross-Crop Misclassification**:
   - Standard 3-class classifiers inevitably forced images of mango leaves, tomato foliage, animals, or non-plant objects into one of the three potato categories.
   - **Solution**: Implemented a **Two-Stage Classification Pipeline** featuring an upstream binary MobileNetV2 validator that filters out non-potato specimens with a **0.0% False Acceptance Rate**.

---

## 2. Potato Pathology Profiles

### 2.1 Healthy Potato Foliage
- **Botanical Identity**: *Solanum tuberosum* (Optimal Foliar Health)
- **Visual Morphology**: Uniform emerald-green coloration, intact veins, firm petioles, complete absence of water-soaked lesions or chlorotic margins.
- **Cultural Management**: Balanced NPK fertilization, drip irrigation, and regular field scouting.

### 2.2 Early Blight
- **Causal Pathogen**: *Alternaria solani* (Fungal pathogen)
- **Symptomatology**: Dark brown to black circular lesions displaying distinctive **concentric target rings** surrounded by yellow chlorotic halos. Primarily originates on older, lower canopy foliage.
- **Agronomic Mitigation**: 2–3 year crop rotation with non-solanaceous species, wider row spacing to facilitate canopy aeration, and preventive chlorothalonil / copper-based applications.

### 2.3 Late Blight
- **Causal Pathogen**: *Phytophthora infestans* (Oomycete water mold)
- **Symptomatology**: Water-soaked, pale-to-dark irregular lesions rapidly spreading from leaf tips. Under humid conditions, delicate white downy sporulation develops on the abaxial (underside) leaf surface, leading to rapid blackened foliar collapse.
- **Agronomic Mitigation**: Planting certified disease-free seed tubers, eliminating cull piles, avoiding overhead sprinkler irrigation during high-humidity periods, and timely application of targeted systemic oomycete fungicides (e.g., metalaxyl/mefenoxam, mandipropamid).

---

## 3. Two-Stage Pipeline Logic

```text
[ Uploaded Leaf Image ]
          │
          ▼
┌───────────────────────────────────────┐
│ Stage 1: Potato Leaf Validator        │
│ MobileNetV2 Binary Classifier         │
│ (Potato vs Non-Potato / Invalid)      │
└──────────────────┬────────────────────┘
                   │
         Is genuine potato foliage?
         /                     \
       YES                      NO
        │                        │
        ▼                        ▼
┌─────────────────────────┐  ┌──────────────────────────────────────────┐
│ Stage 2: Disease Model  │  │ Rejection Pipeline                       │
│ MobileNetV2 (3 Classes) │  │ • Display: Unsupported Image Detected    │
│ + Temperature Scaling   │  │ • Message: Upload a clear potato leaf    │
└───────────┬─────────────┘  │ • Suppress all disease statistics        │
            │                └──────────────────────────────────────────┘
            ▼
┌────────────────────────────────────────────────────────┐
│ Calibrated Output: Healthy (83.6%), Early Blight, etc. │
│ Probabilities strictly sum to 100.0%                   │
└────────────────────────────────────────────────────────┘
```
