@echo off
echo ==========================================
echo Starting Student Auth System...
echo ==========================================

echo [1/2] Launching Backend Server...
start "FastAPI Backend" cmd /k "venv\Scripts\activate && python -m uvicorn main:app --reload"

echo [2/2] Launching Frontend Interface...
cd react_frontend
start "React Frontend" cmd /k "npm run dev"

echo ==========================================
echo Both servers are running!
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo ==========================================
pause
