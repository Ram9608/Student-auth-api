import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Email Configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")

if not SENDER_EMAIL or not SENDER_PASSWORD:
    print("ERROR: SENDER_EMAIL or SENDER_PASSWORD not set in environment or .env file.")
else:
    print(f"Email Config Loaded: {SENDER_EMAIL} / Password Len: {len(SENDER_PASSWORD)}")
SENDER_NAME = "Student Auth System"

def send_password_reset_email(recipient_email: str, reset_link: str) -> bool:
    """
    Send password reset email to user
    
    Args:
        recipient_email: User's email address
        reset_link: Password reset link with token
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = "Password Reset Request - Student Auth System"
        message["From"] = f"{SENDER_NAME} <{SENDER_EMAIL}>"
        message["To"] = recipient_email

        # HTML Email Template
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }}
                .container {{
                    max-width: 600px;
                    margin: 40px auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 30px;
                    text-align: center;
                    color: white;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 24px;
                }}
                .content {{
                    padding: 40px 30px;
                }}
                .content p {{
                    color: #333;
                    line-height: 1.6;
                    margin: 15px 0;
                }}
                .button {{
                    display: inline-block;
                    padding: 14px 32px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                    margin: 20px 0;
                    transition: transform 0.2s;
                }}
                .button:hover {{
                    transform: translateY(-2px);
                }}
                .footer {{
                    background-color: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    color: #6c757d;
                    font-size: 12px;
                }}
                .warning {{
                    background-color: #fff3cd;
                    border-left: 4px solid #ffc107;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 4px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>We received a request to reset your password for your Student Auth System account.</p>
                    <p>Click the button below to reset your password:</p>
                    
                    <center>
                        <a href="{reset_link}" class="button">Reset Password</a>
                    </center>
                    
                    <div class="warning">
                        <strong>Important:</strong>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>This link will expire in <strong>15 minutes</strong></li>
                            <li>If you didn't request this, please ignore this email</li>
                            <li>Never share this link with anyone</li>
                        </ul>
                    </div>
                    
                    <p style="color: #6c757d; font-size: 13px; margin-top: 30px;">
                        If the button doesn't work, copy and paste this link into your browser:<br>
                        <a href="{reset_link}" style="color: #667eea; word-break: break-all;">{reset_link}</a>
                    </p>
                </div>
                <div class="footer">
                    <p>© 2024 Student Auth System. All rights reserved.</p>
                    <p>This is an automated email. Please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
        """

        # Plain text version (fallback)
        text_content = f"""
        Password Reset Request
        
        Hello,
        
        We received a request to reset your password for your Student Auth System account.
        
        Click the link below to reset your password:
        {reset_link}
        
        Important:
        - This link will expire in 15 minutes
        - If you didn't request this, please ignore this email
        - Never share this link with anyone
        
        © 2024 Student Auth System
        """

        # Attach both versions
        part1 = MIMEText(text_content, "plain")
        part2 = MIMEText(html_content, "html")
        message.attach(part1)
        message.attach(part2)

        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()  # Secure connection
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(message)
        
        print(f"Password reset email sent to: {recipient_email}")
        return True
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Failed to send email to {recipient_email}: {str(e)}")
        return False


def send_welcome_email(recipient_email: str, user_name: str) -> bool:
    """
    Send welcome email to newly registered user (Optional)
    
    Args:
        recipient_email: User's email address
        user_name: User's first name
        
    Returns:
        bool: True if email sent successfully
    """
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = "Welcome to Student Auth System!"
        message["From"] = f"{SENDER_NAME} <{SENDER_EMAIL}>"
        message["To"] = recipient_email

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; }}
                .container {{ max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; }}
                .content {{ padding: 40px 30px; }}
                .footer {{ background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome, {user_name}!</h1>
                </div>
                <div class="content">
                    <p>Thank you for registering with Student Auth System.</p>
                    <p>Your account has been successfully created. You can now log in and access your dashboard.</p>
                    <p>If you have any questions, feel free to reach out to our support team.</p>
                </div>
                <div class="footer">
                    <p>© 2024 Student Auth System. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

        part = MIMEText(html_content, "html")
        message.attach(part)

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(message)
        
        print(f"Welcome email sent to: {recipient_email}")
        return True
        
    except Exception as e:
        print(f"Failed to send welcome email: {str(e)}")
        return False
