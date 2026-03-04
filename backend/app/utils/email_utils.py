import aiosmtplib
from email.message import EmailMessage
from app.config import settings

async def send_email(to_email: str, subject: str, content: str):
    """
    Unified Email Dispatcher for AI Platform Alerts & OTPs.
    """
    msg = EmailMessage()
    msg["From"] = settings.SENDER_EMAIL
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(content)

    try:
        await aiosmtplib.send(
            msg,
            hostname=settings.SMTP_SERVER,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASS,
            start_tls=True,
        )
        return True, None
    except Exception as e:
        print(f"SMTP Dispatch Error: {e}")
        return False, str(e)
