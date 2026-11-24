import os
import sys
import time
import subprocess
import requests
import json
from pathlib import Path
from PIL import Image
import numpy as np

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
AI_DIR = ROOT_DIR / "ai-services"
BACKEND_DIR = ROOT_DIR / "backend"
SAMPLES_DIR = BACKEND_DIR / "samples"

BACKEND_URL = "http://127.0.0.1:5000"
AI_SERVICE_URL = "http://127.0.0.1:8000"

def create_synthetic_invalid_image(path):
    img = Image.new("RGB", (256, 256), color=(20, 40, 220)) # Solid flat blue
    img.save(path)

def create_corrupted_file(path):
    with open(path, "wb") as f:
        f.write(b"NOT_A_VALID_JPEG_HEADER_CORRUPTED_BYTES_123456789")

def main():
    print("=" * 75)
    print(" 🥔 PotatoCare AI: Comprehensive 10-Case Two-Stage Verification Suite")
    print("=" * 75)

    ai_process = None
    backend_process = None

    # 1. Verify or Start Python FastAPI AI Service
    print("\n[STEP 1] Checking Python FastAPI AI Microservice on port 8000...")
    fastapi_online = False
    try:
        r = requests.get(f"{AI_SERVICE_URL}/health", timeout=2)
        if r.status_code == 200 and r.json().get("model_loaded"):
            data = r.json()
            print(f"  --> FastAPI AI Service is already ONLINE! Engine: {data.get('inference_engine')} | Stage1 Loaded: {data.get('stage1_loaded')}")
            fastapi_online = True
    except Exception:
        pass

    if not fastapi_online:
        print("  Starting FastAPI AI Microservice on port 8000...")
        ai_process = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"],
            cwd=str(AI_DIR),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        for attempt in range(12):
            try:
                r = requests.get(f"{AI_SERVICE_URL}/health", timeout=2)
                if r.status_code == 200 and r.json().get("model_loaded"):
                    data = r.json()
                    print(f"  --> FastAPI AI Service is ONLINE! Engine: {data.get('inference_engine')} | Stage1 Loaded: {data.get('stage1_loaded')}")
                    fastapi_online = True
                    break
            except Exception:
                time.sleep(1)

    if not fastapi_online:
        print("  [ERROR] FastAPI AI service failed to start.")
        if ai_process: ai_process.terminate()
        sys.exit(1)

    # 2. Verify or Start Express.js Backend
    print("\n[STEP 2] Checking Express.js Backend API on port 5000...")
    backend_online = False
    try:
        r = requests.get(f"{BACKEND_URL}/api/health", timeout=2)
        if r.status_code == 200:
            print(f"  --> Express API is already ONLINE! Database: {r.json().get('database')}")
            backend_online = True
    except Exception:
        pass

    if not backend_online:
        print("  Starting Express.js Backend API on port 5000...")
        backend_process = subprocess.Popen(
            ["node", "server.js"],
            cwd=str(BACKEND_DIR),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        for attempt in range(12):
            try:
                r = requests.get(f"{BACKEND_URL}/api/health", timeout=2)
                if r.status_code == 200:
                    print(f"  --> Express API is ONLINE! Database: {r.json().get('database')}")
                    backend_online = True
                    break
            except Exception:
                time.sleep(1)

    if not backend_online:
        print("  [ERROR] Express API failed to start.")
        if ai_process: ai_process.terminate()
        if backend_process: backend_process.terminate()
        sys.exit(1)

    results = {}
    tmp_dir = ROOT_DIR / "tmp_test_images"
    tmp_dir.mkdir(parents=True, exist_ok=True)

    try:
        # CASE 1: Healthy Potato Leaf
        print("\n--> Case 1: Healthy Potato Leaf (Expected: Accept & Predict Healthy)")
        with open(SAMPLES_DIR / "healthy_sample.jpg", "rb") as f:
            res = requests.post(f"{BACKEND_URL}/api/predictions", files={"image": ("healthy_leaf.jpg", f, "image/jpeg")})
        assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.text}"
        data1 = res.json()
        assert data1.get("status") == "accepted" and data1.get("isPotatoLeaf") is True
        assert data1.get("predictedClass") == "Healthy"
        probs1 = data1.get("classProbabilities", {})
        assert abs(sum(probs1.values()) - 1.0) < 0.01
        print(f"  Result: Class={data1['predictedClass']} | Conf={data1['confidence']*100:.1f}% | Probabilities={probs1}")
        results["Case 1: Healthy Potato Leaf"] = f"PASSED (Accepted -> Healthy {data1['confidence']*100:.1f}%)"

        # CASE 2: Early Blight Potato Leaf
        print("\n--> Case 2: Early Blight Potato Leaf (Expected: Accept & Predict Early Blight)")
        with open(SAMPLES_DIR / "early_blight_sample.jpg", "rb") as f:
            res = requests.post(f"{BACKEND_URL}/api/predictions", files={"image": ("early_blight_leaf.jpg", f, "image/jpeg")})
        assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.text}"
        data2 = res.json()
        assert data2.get("status") == "accepted" and data2.get("isPotatoLeaf") is True
        assert data2.get("predictedClass") == "Early Blight"
        probs2 = data2.get("classProbabilities", {})
        assert abs(sum(probs2.values()) - 1.0) < 0.01
        print(f"  Result: Class={data2['predictedClass']} | Conf={data2['confidence']*100:.1f}% | Probabilities={probs2}")
        results["Case 2: Early Blight Potato Leaf"] = f"PASSED (Accepted -> Early Blight {data2['confidence']*100:.1f}%)"

        # CASE 3: Late Blight Potato Leaf
        print("\n--> Case 3: Late Blight Potato Leaf (Expected: Accept & Predict Late Blight)")
        with open(SAMPLES_DIR / "late_blight_sample.jpg", "rb") as f:
            res = requests.post(f"{BACKEND_URL}/api/predictions", files={"image": ("late_blight_leaf.jpg", f, "image/jpeg")})
        assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.text}"
        data3 = res.json()
        assert data3.get("status") == "accepted" and data3.get("isPotatoLeaf") is True
        assert data3.get("predictedClass") == "Late Blight"
        probs3 = data3.get("classProbabilities", {})
        assert abs(sum(probs3.values()) - 1.0) < 0.01
        print(f"  Result: Class={data3['predictedClass']} | Conf={data3['confidence']*100:.1f}% | Probabilities={probs3}")
        results["Case 3: Late Blight Potato Leaf"] = f"PASSED (Accepted -> Late Blight {data3['confidence']*100:.1f}%)"

        # CASE 4: Mango Leaf
        print("\n--> Case 4: Mango Leaf (Expected: Reject - Non-Potato Plant)")
        with open(SAMPLES_DIR / "mango_sample.jpg", "rb") as f:
            res = requests.post(f"{BACKEND_URL}/api/predictions", files={"image": ("mango_sample.jpg", f, "image/jpeg")})
        data4 = res.json()
        assert data4.get("status") == "rejected" or data4.get("isPotatoLeaf") is False
        assert data4.get("predictedClass") == "Unsupported Image"
        print(f"  Status: {res.status_code} | Msg: {data4.get('validationMessage')} | NonPotatoProb: {data4.get('stage1', {}).get('nonPotatoProbability')}")
        results["Case 4: Mango Leaf"] = "PASSED (Rejected - Stage 1 Validator identified Non-Potato)"

        # CASE 5: Tomato Leaf
        print("\n--> Case 5: Tomato Leaf (Expected: Reject - Non-Potato Plant)")
        with open(SAMPLES_DIR / "tomato_leaf_sample.jpg", "rb") as f:
            res = requests.post(f"{BACKEND_URL}/api/predictions", files={"image": ("tomato_sample.jpg", f, "image/jpeg")})
        data5 = res.json()
        assert data5.get("status") == "rejected" or data5.get("isPotatoLeaf") is False
        assert data5.get("predictedClass") == "Unsupported Image"
        print(f"  Status: {res.status_code} | Msg: {data5.get('validationMessage')} | NonPotatoProb: {data5.get('stage1', {}).get('nonPotatoProbability')}")
        results["Case 5: Tomato Leaf"] = "PASSED (Rejected - Stage 1 Validator identified Non-Potato)"

        # CASE 6: Other Plant Leaf (Apple Foliage)
        print("\n--> Case 6: Other Plant Leaves (Apple) (Expected: Reject - Non-Potato Plant)")
        with open(SAMPLES_DIR / "apple_sample.jpg", "rb") as f:
            res = requests.post(f"{BACKEND_URL}/api/predictions", files={"image": ("apple_sample.jpg", f, "image/jpeg")})
        data6 = res.json()
        assert data6.get("status") == "rejected" or data6.get("isPotatoLeaf") is False
        assert data6.get("predictedClass") == "Unsupported Image"
        print(f"  Status: {res.status_code} | Msg: {data6.get('validationMessage')} | NonPotatoProb: {data6.get('stage1', {}).get('nonPotatoProbability')}")
        results["Case 6: Other Plant Leaves (Apple)"] = "PASSED (Rejected - Stage 1 Validator identified Non-Potato)"

        # CASE 7: Human Face
        print("\n--> Case 7: Human Face Image (Expected: Reject - Non-Plant Object)")
        with open(SAMPLES_DIR / "human_face_sample.jpg", "rb") as f:
            res = requests.post(f"{BACKEND_URL}/api/predictions", files={"image": ("human_sample.jpg", f, "image/jpeg")})
        data7 = res.json()
        assert data7.get("status") == "rejected" or data7.get("isPotatoLeaf") is False
        print(f"  Status: {res.status_code} | Msg: {data7.get('validationMessage')}")
        results["Case 7: Human Face"] = "PASSED (Rejected - Non-Plant Object)"

        # CASE 8: Animal Image
        print("\n--> Case 8: Animal Image (Expected: Reject - Non-Plant Object)")
        with open(SAMPLES_DIR / "animal_sample.jpg", "rb") as f:
            res = requests.post(f"{BACKEND_URL}/api/predictions", files={"image": ("animal_sample.jpg", f, "image/jpeg")})
        data8 = res.json()
        assert data8.get("status") == "rejected" or data8.get("isPotatoLeaf") is False
        print(f"  Status: {res.status_code} | Msg: {data8.get('validationMessage')}")
        results["Case 8: Animal Image"] = "PASSED (Rejected - Non-Plant Object)"

        # CASE 9: Random Object / Synthetic Graphic
        print("\n--> Case 9: Random Object / Synthetic Graphic (Expected: Reject)")
        inv_path = tmp_dir / "random_box.jpg"
        create_synthetic_invalid_image(inv_path)
        with open(inv_path, "rb") as f:
            res = requests.post(f"{BACKEND_URL}/api/predictions", files={"image": ("random_box.jpg", f, "image/jpeg")})
        data9 = res.json()
        assert data9.get("status") == "rejected" or data9.get("isPotatoLeaf") is False or res.status_code in [400, 422]
        print(f"  Status: {res.status_code} | Response: {data9.get('validationMessage') or data9.get('error')}")
        results["Case 9: Random Object / Graphic"] = "PASSED (Rejected - Synthetic / Non-Foliage Object)"

        # CASE 10: Blurry / Corrupted File
        print("\n--> Case 10: Corrupted / Malformed Image (Expected: Reject)")
        corrupted_path = tmp_dir / "corrupted_leaf.jpg"
        create_corrupted_file(corrupted_path)
        with open(corrupted_path, "rb") as f:
            res = requests.post(f"{BACKEND_URL}/api/predictions", files={"image": ("corrupted_leaf.jpg", f, "image/jpeg")})
        assert res.status_code in [400, 422, 500]
        print(f"  Status: {res.status_code} | Response: {res.json().get('error')}")
        results["Case 10: Corrupted / Malformed Image"] = f"PASSED (Rejected with {res.status_code})"

    finally:
        if tmp_dir.exists():
            import shutil
            shutil.rmtree(tmp_dir, ignore_errors=True)

        if ai_process or backend_process:
            print("\n[CLEANUP] Stopping test background processes...")
            if backend_process: backend_process.terminate()
            if ai_process: ai_process.terminate()

    print("\n" + "=" * 75)
    print(" 📊 10-CASE TWO-STAGE VERIFICATION SUMMARY")
    print("=" * 75)
    all_passed = True
    for cname, status in results.items():
        print(f"  {cname:42s}: {status}")
        if "PASSED" not in status:
            all_passed = False
    print("=" * 75)
    if all_passed:
        print("  🎉 ALL 10 VERIFICATION CASES PASSED WITH 100% SUCCESS!")
    print("=" * 75)

if __name__ == "__main__":
    main()
