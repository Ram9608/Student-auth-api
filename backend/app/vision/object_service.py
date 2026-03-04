# from ultralytics import YOLO # Moved inside to prevent hang
import cv2
import os

# 🕵️ Object Tracking & Security Service - Module 6
# Uses: YOLOv8-nano (World's fastest and lightest real-time detector)
# Detect: Person, Mobile, Laptop, etc. for Security/Proctoring.

class ObjectService:
    def __init__(self, model_name="yolov8n.pt"):
        from ultralytics import YOLO
        # Load Ultralytics YOLO model: Automatically downloads weights if local files are missing.
        # 'n' denotes the NANO architecture, which minimizes RAM footprint (~3.5MB weight file).
        self.model = YOLO(model_name)
        
        # Security: Which objects are flagged in 'Restricted Zone'?
        self.flagged_objects = ["cell phone", "laptop", "backpack"]
        
    def detect_and_track(self, frame_bgr):
        """
        AI scan for objects and return results.
        Tracking enabled for trajectory.
        """
        # conf=0.10: Extreme sensitivity for mobile phones
        # imgsz=640: Standard high-res for YOLO to detect small objects clearly
        results = self.model.predict(source=frame_bgr, conf=0.10, imgsz=640, verbose=False)
        
        detections = []
        alerts = []
        
        for result in results:
            for box in result.boxes:
                # Class name string
                cls_name = self.model.names[int(box.cls)]
                conf = float(box.conf)
                
                # Flag if it's restricted (AI Security Case)
                if cls_name in self.flagged_objects:
                    alerts.append(f"Security Alert: {cls_name} detected!")

                detections.append({
                    "name": cls_name,
                    "confidence": round(conf * 100, 2),
                    "box": box.xyxy[0].tolist() # [x1, y1, x2, y2]
                })
        
        if detections:
            print(f"DEBUG: YOLO Detect: {[d['name'] for d in detections if d['confidence'] > 10]}")

        return detections, alerts

# 💡 Developer Tip:
# Implement 'Restricted Zone' validation logic here. If bounding box coordinates intersect with admin-defined zones,
# security alerts should be logged in the database for specialized dashboard visualization.
