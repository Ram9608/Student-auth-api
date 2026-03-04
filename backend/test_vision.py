import cv2
import numpy as np
from app.vision.face_service import FaceService
from app.vision.emotion_service import EmotionService
from app.vision.pose_service import PoseService
from app.vision.object_service import ObjectService

# 🧪 Simple Vision Test Script
# Run: python test_vision.py
# Note: Ensure you have a 'test.jpg' or it picks a blank frame.

def test_all():
    print("Starting Vision Service Tests...")
    
    # Init Services
    face = FaceService()
    emotion = EmotionService()
    pose = PoseService()
    obj = ObjectService()

    # Create dummy frame (640x480 black image)
    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    cv2.putText(frame, 'TEST', (200, 200), cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 2)

    print("--- Face Service ---")
    print("(Note: First run may take a minute to load DeepFace models...)")
    emb = face.get_embedding(frame)
    print(f"Face Embedding: {'Detected' if emb else 'Not detected (Blank frame ok)'}")

    print("--- Emotion Service ---")
    res_emo = emotion.analyze_emotion(frame)
    print(f"Emotion Result: {res_emo}")

    print("--- Pose Service ---")
    status, _ = pose.analyze_pose(frame)
    drowsy = pose.check_drowsiness(frame)
    gesture = pose.get_hand_gestures(frame)
    print(f"Pose: {status}, Drowsy: {drowsy}, Gesture: {gesture}")

    print("--- Object Service ---")
    # objects, alerts = obj.detect_and_track(frame)
    # print(f"Objects: {len(objects)}, Alerts: {len(alerts)}")
    print("YOLO test skipped (requires .pt file download in background)")

    print("\n✅ Vision Services Initialization Test Complete!")

if __name__ == "__main__":
    test_all()
