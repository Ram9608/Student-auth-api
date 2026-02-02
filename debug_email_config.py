
import smtplib
import os
from dotenv import load_dotenv

# Force reload .env
load_dotenv(override=True)

SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")

print(f"DEBUG: Email: '{SENDER_EMAIL}'")
print(f"DEBUG: Password length: {len(SENDER_PASSWORD) if SENDER_PASSWORD else 0}")
print(f"DEBUG: Password content (masked): {SENDER_PASSWORD[:2]}...{SENDER_PASSWORD[-2:]}" if SENDER_PASSWORD else "None")

# Test cleaning spaces
if SENDER_PASSWORD and " " in SENDER_PASSWORD:
    print("DEBUG: Password contains spaces. Trying to remove them for connection...")
    SENDER_PASSWORD_CLEAN = SENDER_PASSWORD.replace(" ", "")
else:
    SENDER_PASSWORD_CLEAN = SENDER_PASSWORD

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

try:
    print(f"Connecting to {SMTP_SERVER}:{SMTP_PORT}...")
    server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
    server.starttls()
    print("Logging in...")
    server.login(SENDER_EMAIL, SENDER_PASSWORD_CLEAN)
    print("✅ SUCCESS: Login successful!")
    server.quit()
except Exception as e:
    print(f"❌ ERROR: {e}")
