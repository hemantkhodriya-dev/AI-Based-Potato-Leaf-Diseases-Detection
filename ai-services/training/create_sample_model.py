import os
import json
import numpy as np
from pathlib import Path

# Script to generate a baseline MobileNetV2 Keras model or weights file for local development & testing
def create_model():
    output_dir = Path(__file__).parent.parent / "ai-service" / "model"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    class_indices = {
        "0": "Early Blight",
        "1": "Healthy",
        "2": "Late Blight",
        "3": "Not a Potato Leaf"
    }

    with open(output_dir / "class_indices.json", "w") as f:
        json.dump(class_indices, f, indent=2)
    print(f"[SUCCESS] Class indices written to {output_dir / 'class_indices.json'}")

    model_path = output_dir / "potato_disease_model.keras"

    try:
        import tensorflow as tf
        from tensorflow.keras.applications import MobileNetV2
        from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
        from tensorflow.keras.models import Model

        print("Creating MobileNetV2 Keras model with TensorFlow...")
        base = MobileNetV2(weights=None, include_top=False, input_shape=(224, 224, 3))
        x = GlobalAveragePooling2D()(base.output)
        x = Dense(128, activation='relu')(x)
        outputs = Dense(4, activation='softmax')(x)
        model = Model(inputs=base.input, outputs=outputs)
        
        # Save model in .keras format
        model.save(str(model_path))
        print(f"[SUCCESS] Keras model saved to {model_path}")
    except Exception as e:
        print(f"[NOTE] TensorFlow not installed locally or failed: {e}")
        print("Creating metadata fallback file for Python inference service...")
        # Create a lightweight metadata structure if TF is not present in local python env
        metadata = {
            "model_type": "MobileNetV2",
            "input_shape": [224, 224, 3],
            "classes": ["Early Blight", "Healthy", "Late Blight"],
            "status": "ready"
        }
        with open(output_dir / "model_info.json", "w") as f:
            json.dump(metadata, f, indent=2)

if __name__ == "__main__":
    create_model()
