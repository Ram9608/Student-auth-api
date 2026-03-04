from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
import cv2
import numpy as np
import json
import base64
import asyncio

from ..database import get_db
from ..models import User, FaceEmbedding, AttendanceLog, VisionLog
from ..core.dependencies import get_current_user
from ..core.security import create_access_token

router = APIRouter()

# AI Services (Lazy Loading to save 4GB RAM startup time)
def get_face_service(db: Session = None):
    from ..vision.face_service import FaceService
    fs = FaceService()
    # Auto-Warm cache if empty and DB is available
    if not fs.cache and db:
        print("Auto-warming FaceService Cache...")
        fs.warm_cache(db)
    return fs

# Service getter for EmotionService with lazy singleton
_emotion_service = None

def get_emotion_service():
    global _emotion_service
    if _emotion_service is None:
        from ..vision.emotion_service import EmotionService
        _emotion_service = EmotionService()
    return _emotion_service



# Service getter for PoseService with lazy singleton
_pose_service = None

def get_pose_service():
    global _pose_service
    if _pose_service is None:
        from ..vision.pose_service import PoseService
        _pose_service = PoseService()
    return _pose_service

# Service getter for ObjectService with lazy singleton
_object_service = None

def get_object_service():
    global _object_service
    if _object_service is None:
        from ..vision.object_service import ObjectService
        _object_service = ObjectService()
    return _object_service

# 🔹 1. FACE REGISTRATION (Generate and store biometric embeddings)
@router.post("/register-face")
async def register_face(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Captures user photo, extracts biometric vectors, and persists them in the 'face_embeddings' table.
    """
    print(f"DEBUG: Face Registration Attempt for User: {current_user.full_name} (ID: {current_user.id})")
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        print("DEBUG: Failed to decode image from UploadFile!")
        raise HTTPException(status_code=400, detail="Failed to decode image.")

    # Speed Optimization: Reduce image size for faster AI analysis
    # NOTE: Resizing too small might hurt detection. Let's try 640x480 first and then internal deepface handles it.
    # img = cv2.resize(img, (320, 240))
    print(f"DEBUG: Image Decoded. Size: {img.shape}")

    # Use AI to get face vector
    face_service = get_face_service(db)
    print("DEBUG: Requesting Face Embedding...")
    vector = face_service.get_embedding(img)
    
    if not vector:
        print("DEBUG: No face detected in the captured image.")
        raise HTTPException(status_code=400, detail="Verification failed: Face not detected in frame.")

    print(f"DEBUG: Embedding Generated (Len: {len(vector)})")

    # Store vector as a JSON string in the database
    db_face = FaceEmbedding(
        user_id=current_user.id,
        embedding_json=json.dumps(vector)
    )
    db.add(db_face)
    db.commit()
    print("DEBUG: Embedding saved to Database.")

    # Refresh Cache (CRITICAL for \"Fast\" experience)
    face_service.warm_cache(db)

    return {"status": "success", "message": "Face registered successfully!"}

from ..schemas import FaceLoginRequest, FaceLoginResponse

# 🔹 2. FACE LOGIN (Attendance + Auth via Camera)
@router.post("/face-login", response_model=FaceLoginResponse)
async def face_login(
    data: FaceLoginRequest,
    db: Session = Depends(get_db)
):
    """
    Identifies user via Base64 image and returns a secure JWT token.
    """
    print(f"DEBUG: Incoming Face Login Attempt...")
    if not data or not data.image:
        print("DEBUG FAIL: Empty payload or image field is MISSING in JSON body!")
        return FaceLoginResponse(verified=False, message="FIELD REQUIRED: No image data received by server.")
    
    # Payload logging for diagnostics
    print(f"DEBUG: Payload Detected (Len: {len(data.image)}) | Data Start: {data.image[:80]}...")

    try:
        # 1. Decode Base64 Image
        try:
            # Remove header if present (data:image/jpeg;base64,...)
            header, encoded = (data.image.split(",", 1) if "," in data.image else (None, data.image))
            img_bytes = base64.b64decode(encoded)
            nparr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        except Exception as e:
            return FaceLoginResponse(verified=False, message=f"Invalid image format: {str(e)}")
        
        if img is None:
            return FaceLoginResponse(verified=False, message="Failed to decode image.")

        # Speed Optimization: Resize frame
        img = cv2.resize(img, (320, 240))

        # 2. Get AI Embedding
        face_service = get_face_service(db)
        current_vector = face_service.get_embedding(img)
        
        if not current_vector:
            print("AI Error: Face detected in UI but embedding failed on server.")
            return FaceLoginResponse(verified=False, message="AI could not map your face. Please look directly at the lens.")

        # 3. Search Matching User in Cache (Fast NumPy)
        match_user_id = face_service.find_best_match(current_vector)
        
        if not match_user_id:
            print(f"Recognition Failed: Distance exceeded internal threshold.")
            return FaceLoginResponse(verified=False, message="Face not recognized. Tip: Remove spectacles or improve lighting.")

        # 4. Success Flow
        found_user = db.query(User).filter(User.id == match_user_id).first()
        if not found_user:
            print(f"Database Error: User ID {match_user_id} matched but user record missing!")
            return FaceLoginResponse(verified=False, message="System out of sync. Contact support.")

        print(f"Fast Match: {found_user.full_name} ({found_user.role})")

        # Log Attendance
        attendance = AttendanceLog(user_id=found_user.id)
        db.add(attendance)
        db.commit()

        # Generate JWT Token
        token = create_access_token({
            "user_id": found_user.id,
            "role": found_user.role
        })

        return FaceLoginResponse(
            verified=True,
            message=f"Welcome back, {found_user.full_name}!",
            user=found_user.full_name,
            role=found_user.role,
            access_token=token
        )

    except Exception as e:
        print(f"Backend Internal Error: {e}")
        return FaceLoginResponse(verified=False, message=f"Internal server error: {str(e)}")


# 🔹 3. UNIFIED FRAME ANALYSIS (Emotion, Security, Activity in one call)
@router.post("/analyze-frame")
async def analyze_frame(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Executes comprehensive AI analysis (Emotion, Security, etc) and persists logs.
    Utilized for dashboard analytics and behavioral tracking.
    """
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # AI: Run all services (Parallel processing manually or async recommended)
    emotion_service = get_emotion_service()
    pose_service = get_pose_service()
    object_service = get_object_service()
    
    emotion = emotion_service.analyze_emotion(img)
    pose_status, _ = pose_service.analyze_pose(img)
    is_sleeping = pose_service.check_drowsiness(img)
    objects, alerts = object_service.detect_and_track(img)

    # Save Vision Logs in DB
    # Emotion Log
    log_emotion = VisionLog(user_id=current_user.id, log_type='emotion', content=emotion)
    db.add(log_emotion)
    
    # Activity Alert (If Falling)
    if "FALL" in pose_status:
        alert_activity = VisionLog(user_id=current_user.id, log_type='activity', content='FALL DETECTED!')
        db.add(alert_activity)
    
    # Security Alerts
    for alert in alerts:
        log_alert = VisionLog(user_id=current_user.id, log_type='security_alert', content=alert)
        db.add(log_alert)

    db.commit()

    return {
        "emotion": emotion,
        "activity": pose_status,
        "drowsy": is_sleeping,
        "objects": [obj["name"] for obj in objects],
        "alerts": alerts
    }

# 🔹 4. REAL-TIME VISION STREAM (WebSocket - Module 8)
# Iska use hoga Live Camera Dashboard ke liye.
@router.websocket("/stream")
async def vision_stream(websocket: WebSocket, db: Session = Depends(get_db)):
    """
    WebSocket endpoint for high-frequency frame analysis and real-time behavioral insights (LOW LATENCY).
    """
    await websocket.accept()
    try:
        while True:
            # 1. Receive image in Base64 string format (Web standard)
            data = await websocket.receive_text()
            img_data = base64.b64decode(data.split(",")[1])
            nparr = np.frombuffer(img_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            # 2. AI Processing (Selective: Fast only)
            emotion_service = get_emotion_service()
            pose_service = get_pose_service()
            
            emotion = emotion_service.analyze_emotion(frame)
            pose_status, _ = pose_service.analyze_pose(frame)
            gesture = pose_service.get_hand_gestures(frame)

            # 3. Response JSON
            response = {
                "emotion": emotion,
                "pose": pose_status,
                "gesture": gesture,
                "status": "Processing OK"
            }
            await websocket.send_text(json.dumps(response))
            
            # Rate control check (Prevents CPU overhead on 4GB machine)
            await asyncio.sleep(0.1) # 10 FPS cap for stability

    except WebSocketDisconnect:
        print("Vision Stream Disconnected.")

# 🔹 5. AI PROCTORING STREAM (Module 8 - NTA Style Monitoring)
@router.websocket("/proctor")
async def proctor_stream(websocket: WebSocket, db: Session = Depends(get_db)):
    """
    AI-Driven Proctoring: Monitors candidate integrity (Multi-person, forbidden objects, or absence).
    """
    await websocket.accept()
    print("AI Proctoring Started for Candidate.")
    
    # lazy load services
    face_service = get_face_service()
    object_service = get_object_service()
    
    warning_count = 0
    max_warnings = 3
    
    try:
        while True:
            data = await websocket.receive_text()
            img_data = base64.b64decode(data.split(",")[1])
            nparr = np.frombuffer(img_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if frame is None:
                continue

            alerts = []
            
            # 📱 Object Detection (Stricter restricted list)
            objects, _ = object_service.detect_and_track(frame)
            restricted = ["cell phone", "mobile", "book", "laptop", "remote", "tablet", "backpack"]
            for obj in objects:
                # If person detected by YOLO, and face_count from deepface is > 1, then it's multiple people
                if obj["name"].lower() in restricted:
                    alerts.append(f"RESTRICTED OBJECT: {obj['name'].upper()}")

            # 👥 Face Detection
            try:
                from deepface import DeepFace
                faces = DeepFace.extract_faces(img_path=frame, detector_backend='opencv', enforce_detection=False)
                # Filter by confidence
                valid_faces = [f for f in faces if f.get('confidence', 0) > 0.4]
                face_count = len(valid_faces)
                
                if face_count == 0:
                    alerts.append("NO FACE DETECTED!")
                elif face_count > 1:
                    alerts.append(f"MULTIPLE PEOPLE ({face_count})!")
                else:
                    # Detect looking away (stricter 15% threshold)
                    face = valid_faces[0]
                    region = face['facial_area']
                    fx = region['x'] + region['w'] // 2
                    cx = frame.shape[1] // 2
                    # 15% of frame width is more realistic for proctoring
                    if abs(fx - cx) > (frame.shape[1] * 0.15):
                        alerts.append("LOOKING AWAY DETECTED!")
            except Exception as e:
                print(f"DeepFace Trace: {e}")
                pass

            # ⚠️ Warning Logic with Cooldown (Don't spam warnings every second)
            current_time = asyncio.get_event_loop().time()
            if not hasattr(websocket, 'last_warning_time'):
                websocket.last_warning_time = 0

            if alerts and (current_time - websocket.last_warning_time > 2.0):
                warning_count += 1
                websocket.last_warning_time = current_time
                for msg in alerts:
                    log = VisionLog(log_type='proctor_alert', content=msg)
                    db.add(log)
                db.commit()

            # 🛑 Termination Logic
            test_status = "SAFE"
            if alerts:
                test_status = "VIOLATION"
            if warning_count >= max_warnings:
                test_status = "REVOKED"

            # 📊 Response JSON
            response = {
                "proctored": True,
                "alerts": alerts,
                "warning_count": warning_count,
                "status": test_status,
                "message": "COMMAND: DISCONNECT" if test_status == "REVOKED" else "CONTINUE"
            }
            await websocket.send_text(json.dumps(response))
            
            if test_status == "REVOKED":
                print(f"Test Revoked after {warning_count} warnings.")
                await asyncio.sleep(1) # Final pulse
                break # Close socket
            
            await asyncio.sleep(0.5)

    except WebSocketDisconnect:
        print("Proctoring Session Ended.")

# 🔹 6. STUDENT FACELOCK (RBAC Protected)
from ..core.dependencies import student_only, teacher_only

@router.post("/student/facelock")
async def student_facelock(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(student_only)
):
    """
    Student-only endpoint for Face Verification.
    Logic runs only after 'student_only' dependency passes.
    """
    print(f"student FaceLock Request: User {current_user.email}")
    
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid Image")

    face_service = get_face_service(db)
    current_vector = face_service.get_embedding(img)
    
    if not current_vector:
        raise HTTPException(status_code=400, detail="Face not detected")

    # OPTIMIZED: Use memory-cache check for this specific user
    is_match = face_service.match_user_face(current_user.id, current_vector)

    if not is_match:
        print(f"Face Mismatch for Student: {current_user.full_name}")
        raise HTTPException(status_code=401, detail="Face Verification Failed - Identity Mismatch")

    # Log attendance
    attendance = AttendanceLog(user_id=current_user.id)
    db.add(attendance)
    db.commit()

    return {"status": "success", "message": "Face verified! Attendance logged."}


@router.post("/teacher/facelock")
async def teacher_facelock(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(teacher_only)
):
    """
    Teacher-only endpoint for Face Verification.
    """
    print(f"Teacher FaceLock Request: {current_user.email}")
    
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid Image")

    face_service = get_face_service(db)
    current_vector = face_service.get_embedding(img)
    
    if not current_vector:
        raise HTTPException(status_code=400, detail="Face not detected")

    # OPTIMIZED: Use memory-cache check for this specific user
    is_match = face_service.match_user_face(current_user.id, current_vector)
    
    if not is_match:
        print(f"Teacher Face Mismatch: {current_user.full_name}")
        raise HTTPException(status_code=401, detail="Teacher verification failed!")

    return {"status": "success", "message": "Teacher Identity Verified"}

# 💡 Optimization Note:
# WebSockets can be resource-intensive on 4GB RAM configurations.
# Implementing client-side throttling (e.g., 200ms frame interval) is highly recommended for stability.
