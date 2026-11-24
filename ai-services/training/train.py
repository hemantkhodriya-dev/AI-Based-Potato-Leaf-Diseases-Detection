import os
import json
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_fscore_support

# TensorFlow / Keras Imports
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 20
LEARNING_RATE = 1e-4

CLASS_NAME_MAP = {
    "Potato___healthy": "Healthy",
    "Potato___Early_blight": "Early Blight",
    "Potato___Late_blight": "Late Blight",
    "healthy": "Healthy",
    "early_blight": "Early Blight",
    "late_blight": "Late Blight",
    "Healthy": "Healthy",
    "Early Blight": "Early Blight",
    "Late Blight": "Late Blight",
    "background": "Not a Potato Leaf",
    "Background": "Not a Potato Leaf",
    "Background_without_leaves": "Not a Potato Leaf",
    "invalid": "Not a Potato Leaf",
    "Not_a_Leaf": "Not a Potato Leaf",
    "not_a_leaf": "Not a Potato Leaf"
}

def find_dataset_dir(base_path):
    """Recursively search for potato dataset directory containing healthy/early/late blight subfolders."""
    base = Path(base_path)
    if not base.exists():
        raise FileNotFoundError(f"Dataset path {base_path} does not exist.")
    
    # Check current directory
    subdirs = [d.name for d in base.iterdir() if d.is_dir()]
    target_keywords = ["healthy", "early", "late"]
    matching = [d for d in subdirs if any(k in d.lower() for k in target_keywords)]
    
    if len(matching) >= 3:
        return base
        
    # Search one level deeper (e.g., PlantVillage/PlantVillage or plantvillage_dataset/color)
    for child in base.iterdir():
        if child.is_dir():
            subdirs = [d.name for d in child.iterdir() if d.is_dir()]
            matching = [d for d in subdirs if any(k in d.lower() for k in target_keywords)]
            if len(matching) >= 3:
                return child

    return base

def main(dataset_path="./dataset", output_dir="../ai-service/model"):
    print("=" * 60)
    print("  Potato Care AI - MobileNetV2 Model Training Pipeline  ")
    print("=" * 60)

    dataset_dir = find_dataset_dir(dataset_path)
    print(f"--> Using Dataset Directory: {dataset_dir}")
    
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Data Augmentation for Training Set
    train_datagen = ImageDataGenerator(
        rescale=1.0/255.0,
        rotation_range=25,
        width_shift_range=0.15,
        height_shift_range=0.15,
        shear_range=0.15,
        zoom_range=0.15,
        horizontal_flip=True,
        fill_mode='nearest',
        validation_split=0.30 # 70% Train, 30% for Val + Test
    )

    # Validation and Testing Generator (No Augmentation except Rescaling)
    val_test_datagen = ImageDataGenerator(
        rescale=1.0/255.0,
        validation_split=0.30
    )

    print("\n--> Loading Train Dataset (70%)...")
    train_generator = train_datagen.flow_from_directory(
        dataset_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training',
        shuffle=True
    )

    print("\n--> Loading Temp Validation/Test Dataset (30%)...")
    val_test_generator = val_test_datagen.flow_from_directory(
        dataset_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation',
        shuffle=False
    )

    num_classes = train_generator.num_classes
    raw_class_indices = train_generator.class_indices
    print(f"--> Raw Class Map detected: {raw_class_indices}")

    # Standardize Class Label mapping for inference service
    formatted_class_map = {}
    for raw_label, index in raw_class_indices.items():
        standardized_name = CLASS_NAME_MAP.get(raw_label, raw_label)
        formatted_class_map[str(index)] = standardized_name

    print(f"--> Standardized Index Mapping: {formatted_class_map}")

    with open(output_path / "class_indices.json", "w") as f:
        json.dump(formatted_class_map, f, indent=2)

    # -------------------------------------------------------------
    # Build MobileNetV2 Transfer Learning Architecture
    # -------------------------------------------------------------
    print("\n--> Initializing MobileNetV2 Base Model...")
    base_model = MobileNetV2(
        weights='imagenet',
        include_top=False,
        input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3)
    )
    base_model.trainable = False # Freeze pre-trained weights initially

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.4)(x)
    outputs = Dense(num_classes, activation='softmax')(x)

    model = Model(inputs=base_model.input, outputs=outputs)

    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    model.summary()

    # Callbacks
    model_file = output_path / "potato_disease_model.keras"
    checkpoint = ModelCheckpoint(
        filepath=str(model_file),
        monitor='val_accuracy',
        save_best_only=True,
        verbose=1
    )
    early_stop = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)
    reduce_lr = ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=2, verbose=1)

    print("\n--> Starting Model Training...")
    history = model.fit(
        train_generator,
        epochs=EPOCHS,
        validation_data=val_test_generator,
        callbacks=[checkpoint, early_stop, reduce_lr]
    )

    # -------------------------------------------------------------
    # Fine-Tuning Phase (Unfreeze top layers)
    # -------------------------------------------------------------
    print("\n--> Fine-Tuning Top MobileNetV2 Layers...")
    base_model.trainable = True
    for layer in base_model.layers[:-30]:
        layer.trainable = False

    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE / 10),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    history_fine = model.fit(
        train_generator,
        epochs=10,
        validation_data=val_test_generator,
        callbacks=[checkpoint, early_stop, reduce_lr]
    )

    # Save final model state
    model.save(str(model_file))
    print(f"\n[SUCCESS] Model saved to {model_file}")

    # -------------------------------------------------------------
    # Comprehensive Evaluation
    # -------------------------------------------------------------
    print("\n--> Evaluating Final Model on Test Set...")
    val_test_generator.reset()
    y_pred_probs = model.predict(val_test_generator)
    y_pred = np.argmax(y_pred_probs, axis=1)
    y_true = val_test_generator.classes

    target_names = [formatted_class_map[str(i)] for i in range(num_classes)]
    
    precision, recall, f1, _ = precision_recall_fscore_support(y_true, y_pred, average='weighted')
    test_acc = float(np.sum(y_pred == y_true) / len(y_true))
    cm = confusion_matrix(y_true, y_pred).tolist()

    report = classification_report(y_true, y_pred, target_names=target_names, output_dict=True)

    metrics_data = {
        "accuracy": round(test_acc, 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "f1_score": round(float(f1), 4),
        "confusion_matrix": cm,
        "class_names": target_names,
        "classification_report": report
    }

    metrics_file = output_path / "evaluation_metrics.json"
    with open(metrics_file, "w") as f:
        json.dump(metrics_data, f, indent=2)

    print("\n" + "=" * 50)
    print(f"  Test Accuracy : {test_acc * 100:.2f}%")
    print(f"  Precision     : {precision:.4f}")
    print(f"  Recall        : {recall:.4f}")
    print(f"  F1 Score      : {f1:.4f}")
    print("=" * 50)

if __name__ == "__main__":
    import sys
    ds_path = sys.argv[1] if len(sys.argv) > 1 else "./dataset"
    main(ds_path)
