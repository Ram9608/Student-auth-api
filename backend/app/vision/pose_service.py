import cv2
import numpy as np

# Pose Service - Fallback implementation (no mediapipe dependency)
# Using OpenCV-based heuristics instead since mediapipe API changed in newer versions

class PoseService:
    def __init__(self):
        # No heavy init needed - we use cv2 only
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    def analyze_pose(self, frame_bgr):
        """
        Simplified pose analysis using face detection.
        Returns (status, None) for compatibility.
        """
        try:
            gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(gray, 1.1, 5)
            if len(faces) > 0:
                return "Standing/Sitting", None
            else:
                return "No Pose Detected", None
        except Exception as e:
            print(f"PoseService.analyze_pose error: {e}")
            return "Unknown", None

    def check_drowsiness(self, frame_bgr):
        """
        Simplified drowsiness check (returns False always in lite mode).
        Full implementation requires dlib or mediapipe which has breaking changes.
        """
        return False

    def get_hand_gestures(self, frame_bgr):
        """Simplified hand gesture detection - returns None in lite mode."""
        return "None"
