# from deepface import DeepFace # Moved inside to prevent hang
import cv2

# 😊 Emotion Detection Service - Module 2
# Purpose: Analyze facial expressions to identify emotions (e.g., Happy, Sad, Angry).
# DeepFace provides a pre-built Emotion model which is ready-to-use.

class EmotionService:
    def __init__(self):
        # DeepFace model will be loaded on first initialization.
        # It's better than manual loading via Keras (Memory optimized).
        self.actions = ['emotion']

    def analyze_emotion(self, frame_bgr):
        """
        AI-driven analysis of the input frame to determine the 'Dominant Emotion'.
        """
        try:
            from deepface import DeepFace
            # Enforce detection = False: Analyze the entire frame for performance (Fast).
            # Detector backend = 'opencv': Minimal resource footprint for 4GB RAM configurations.
            results = DeepFace.analyze(img_path=frame_bgr, actions=self.actions, enforce_detection=False, detector_backend='opencv')
            
            if results and len(results) > 0:
                # Extract the primary emotion from results.
                dominant_emotion = results[0]['dominant_emotion']
                return dominant_emotion
        except Exception as e:
            print(f"Emotion AI Error: {str(e)}")
        
        return "Neutral" # Default state is Neutral

# 💡 Optimization Note:
# 'Dominant Emotion' data can be leveraged for behavioral analytics and student performance visualization.
# If memory constraints are encountered on 4GB systems, consider using 'mediapipe' as the detector backend for a lighter footprint.
