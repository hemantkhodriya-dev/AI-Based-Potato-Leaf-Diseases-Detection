import os
import json
import time
from pathlib import Path
import numpy as np
from PIL import Image
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_fscore_support

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as transforms
import torchvision.models as models

# Set seeds for reproducibility
torch.manual_seed(42)
np.random.seed(42)

IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 10
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

CLASS_NAMES = ["Early Blight", "Healthy", "Late Blight"]
DIR_MAP = {
    "Potato___Early_blight": 0,
    "Potato___healthy": 1,
    "Potato___Late_blight": 2,
    "Early Blight": 0,
    "Healthy": 1,
    "Late Blight": 2,
}

class PotatoDataset(Dataset):
    def __init__(self, file_paths, labels, transform=None):
        self.file_paths = file_paths
        self.labels = labels
        self.transform = transform

    def __len__(self):
        return len(self.file_paths)

    def __getitem__(self, idx):
        path = self.file_paths[idx]
        image = Image.open(path).convert("RGB")
        label = self.labels[idx]
        if self.transform:
            image = self.transform(image)
        return image, label

def get_image_paths_and_labels(dataset_dir):
    dataset_path = Path(dataset_dir)
    paths = []
    labels = []
    
    for sub in dataset_path.iterdir():
        if sub.is_dir() and sub.name in DIR_MAP:
            label_idx = DIR_MAP[sub.name]
            for img_file in sub.iterdir():
                if img_file.suffix.lower() in [".jpg", ".jpeg", ".png"]:
                    paths.append(str(img_file))
                    labels.append(label_idx)
    return paths, labels

def create_model(num_classes=3):
    # Load MobileNetV2 with pre-trained ImageNet weights
    weights = models.MobileNet_V2_Weights.DEFAULT
    model = models.mobilenet_v2(weights=weights)
    
    # Fine-tune: freeze early feature layers, keep top layers trainable
    for param in list(model.features.parameters())[:-10]:
        param.requires_grad = False
        
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, 256),
        nn.ReLU(inplace=True),
        nn.Dropout(p=0.2),
        nn.Linear(256, num_classes)
    )
    return model

def main():
    print("=" * 65)
    print(" 🥔 PotatoCare AI: MobileNetV2 Genuine Training Pipeline")
    print(f" Device: {DEVICE}")
    print("=" * 65)

    dataset_dir = Path("./ml-training/dataset")
    if not dataset_dir.exists():
        dataset_dir = Path("./dataset")
    
    paths, labels = get_image_paths_and_labels(dataset_dir)
    print(f"Total images discovered: {len(paths)}")
    for i, name in enumerate(CLASS_NAMES):
        count = sum(1 for l in labels if l == i)
        print(f"  Class {i} ({name}): {count} images")

    # 1. Stratified Train / Val / Test Split: 70% Train, 15% Val, 15% Test
    train_paths, test_val_paths, train_labels, test_val_labels = train_test_split(
        paths, labels, test_size=0.30, random_state=42, stratify=labels
    )
    val_paths, test_paths, val_labels, test_labels = train_test_split(
        test_val_paths, test_val_labels, test_size=0.50, random_state=42, stratify=test_val_labels
    )

    print(f"\nSplit Distribution:")
    print(f"  Training set   : {len(train_paths)} images")
    print(f"  Validation set : {len(val_paths)} images")
    print(f"  Test set       : {len(test_paths)} images (independent holdout)")

    # 2. Data Transforms with Robust Agricultural Augmentation
    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(IMG_SIZE, scale=(0.8, 1.0)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.5),
        transforms.RandomRotation(degrees=25),
        transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.15, hue=0.04),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    val_test_transform = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    train_ds = PotatoDataset(train_paths, train_labels, transform=train_transform)
    val_ds = PotatoDataset(val_paths, val_labels, transform=val_test_transform)
    test_ds = PotatoDataset(test_paths, test_labels, transform=val_test_transform)

    # 3. Class-weighted CrossEntropyLoss to handle class distribution (152 healthy vs 1000 blight)
    train_class_counts = [sum(1 for l in train_labels if l == i) for i in range(3)]
    total_train = len(train_labels)
    class_weights = [total_train / (3.0 * c) for c in train_class_counts]
    weight_tensor = torch.tensor(class_weights, dtype=torch.float).to(DEVICE)
    print(f"Calculated Class Weights for Loss: {class_weights}")

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)
    test_loader = DataLoader(test_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

    # 4. Model, Loss, Optimizer
    model = create_model(num_classes=3).to(DEVICE)
    criterion = nn.CrossEntropyLoss(weight=weight_tensor)
    optimizer = torch.optim.AdamW(model.parameters(), lr=5e-4, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=EPOCHS, eta_min=1e-5)

    # 5. Training Loop
    print("\n--> Starting Model Training...")
    best_val_acc = 0.0
    best_model_state = None
    start_time = time.time()

    for epoch in range(1, EPOCHS + 1):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for imgs, lbls in train_loader:
            imgs, lbls = imgs.to(DEVICE), lbls.to(DEVICE)
            optimizer.zero_grad()
            outputs = model(imgs)
            loss = criterion(outputs, lbls)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * imgs.size(0)
            _, preds = torch.max(outputs, 1)
            correct += (preds == lbls).sum().item()
            total += lbls.size(0)

        scheduler.step()
        train_loss = running_loss / total
        train_acc = correct / total

        # Validation
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0

        with torch.no_grad():
            for imgs, lbls in val_loader:
                imgs, lbls = imgs.to(DEVICE), lbls.to(DEVICE)
                outputs = model(imgs)
                loss = criterion(outputs, lbls)

                val_loss += loss.item() * imgs.size(0)
                _, preds = torch.max(outputs, 1)
                val_correct += (preds == lbls).sum().item()
                val_total += lbls.size(0)

        val_loss = val_loss / val_total
        val_acc = val_correct / val_total

        print(f"Epoch [{epoch:02d}/{EPOCHS:02d}] "
              f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc*100:.2f}% | "
              f"Val Loss: {val_loss:.4f} | Val Acc: {val_acc*100:.2f}%")

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_model_state = model.state_dict().copy()

    elapsed = time.time() - start_time
    print(f"\n--> Training Completed in {elapsed:.1f}s. Best Validation Accuracy: {best_val_acc*100:.2f}%")

    if best_model_state is not None:
        model.load_state_dict(best_model_state)

    # 6. Comprehensive Independent Test Set Evaluation
    print("\n" + "=" * 65)
    print("  Independent Test Set Evaluation (Unseen Data)")
    print("=" * 65)

    model.eval()
    all_preds = []
    all_targets = []
    all_probs = []

    with torch.no_grad():
        for imgs, lbls in test_loader:
            imgs = imgs.to(DEVICE)
            outputs = model(imgs)
            probs = torch.softmax(outputs, dim=1)
            _, preds = torch.max(outputs, 1)

            all_preds.extend(preds.cpu().numpy().tolist())
            all_targets.extend(lbls.numpy().tolist())
            all_probs.extend(probs.cpu().numpy().tolist())

    all_preds = np.array(all_preds)
    all_targets = np.array(all_targets)
    all_probs = np.array(all_probs)

    test_acc = float(np.mean(all_preds == all_targets))
    precision_w, recall_w, f1_w, _ = precision_recall_fscore_support(all_targets, all_preds, average='weighted')
    precision_m, recall_m, f1_m, _ = precision_recall_fscore_support(all_targets, all_preds, average='macro')
    cm = confusion_matrix(all_targets, all_preds).tolist()
    report = classification_report(all_targets, all_preds, target_names=CLASS_NAMES, output_dict=True)

    print(f"  Test Accuracy  : {test_acc * 100:.2f}%")
    print(f"  Weighted F1    : {f1_w:.4f}")
    print(f"  Macro F1       : {f1_m:.4f}")
    print(f"  Weighted Recall: {recall_w:.4f}")
    print(f"  Confusion Matrix (Rows=True, Cols=Predicted):")
    for idx, row in enumerate(cm):
        print(f"    {CLASS_NAMES[idx]:14s}: {row}")

    print("\nDetailed Classification Report:")
    for cname in CLASS_NAMES:
        c_stats = report[cname]
        print(f"  {cname:14s} -> Precision: {c_stats['precision']:.4f} | Recall: {c_stats['recall']:.4f} | F1: {c_stats['f1-score']:.4f} (Support: {c_stats['support']})")

    # 7. Save Model Weights & Artifacts to ai-service/model/
    output_dir = Path("./ai-service/model")
    output_dir.mkdir(parents=True, exist_ok=True)

    model_pth_path = output_dir / "potato_mobilenet_v2.pth"
    torch.save(model.state_dict(), str(model_pth_path))
    print(f"\n[SAVED] PyTorch model state saved: {model_pth_path}")

    # Also export TorchScript model for production deployment (no python code dependency)
    example_input = torch.randn(1, 3, IMG_SIZE, IMG_SIZE).to(DEVICE)
    model.eval()
    traced_model = torch.jit.trace(model, example_input)
    torchscript_path = output_dir / "potato_disease_model.pt"
    traced_model.save(str(torchscript_path))
    print(f"[SAVED] TorchScript optimized model saved: {torchscript_path}")

    # Save class indices
    class_indices = {"0": "Early Blight", "1": "Healthy", "2": "Late Blight"}
    with open(output_dir / "class_indices.json", "w") as f:
        json.dump(class_indices, f, indent=2)

    # Save model info
    model_info = {
        "model_type": "MobileNetV2 (PyTorch Deep CNN)",
        "input_shape": [IMG_SIZE, IMG_SIZE, 3],
        "classes": CLASS_NAMES,
        "normalization": {
            "mean": [0.485, 0.456, 0.406],
            "std": [0.229, 0.224, 0.225]
        },
        "trained_date": time.strftime("%Y-%m-%d %H:%M:%S"),
        "status": "ready",
        "best_val_accuracy": round(float(best_val_acc), 4)
    }
    with open(output_dir / "model_info.json", "w") as f:
        json.dump(model_info, f, indent=2)

    # Save comprehensive evaluation metrics
    metrics = {
        "accuracy": round(test_acc, 4),
        "precision_weighted": round(float(precision_w), 4),
        "recall_weighted": round(float(recall_w), 4),
        "f1_weighted": round(float(f1_w), 4),
        "precision_macro": round(float(precision_m), 4),
        "recall_macro": round(float(recall_m), 4),
        "f1_macro": round(float(f1_m), 4),
        "confusion_matrix": cm,
        "class_names": CLASS_NAMES,
        "classification_report": report,
        "total_test_samples": len(all_targets)
    }
    with open(output_dir / "evaluation_metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"[SAVED] Evaluation metrics written to: {output_dir / 'evaluation_metrics.json'}")
    print("\n[COMPLETE] Model training and evaluation completed successfully!")

if __name__ == "__main__":
    main()
