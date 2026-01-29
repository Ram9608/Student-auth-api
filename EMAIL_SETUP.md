# 📧 Email Setup Guide for Password Reset

## Overview
This guide will help you configure Gmail SMTP to send password reset emails.

---

## 🔧 Step 1: Generate Gmail App Password

### Prerequisites:
- A Gmail account
- 2-Step Verification enabled

### Steps:

1. **Go to Google Account Settings:**
   - Visit: https://myaccount.google.com/

2. **Enable 2-Step Verification** (if not already enabled):
   - Click "Security" in the left sidebar
   - Find "2-Step Verification"
   - Click "Get Started" and follow the prompts

3. **Generate App Password:**
   - In Security settings, search for "App passwords"
   - Click "App passwords"
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Type: `Student Auth API`
   - Click **Generate**
   - **Copy the 16-digit password** (remove spaces)

---

## 📝 Step 2: Configure Environment Variables

1. **Create `.env` file** in project root:
   ```bash
   # Copy the example file
   copy .env.example .env
   ```

2. **Edit `.env` file** and add your credentials:
   ```env
   # Email Configuration
   SENDER_EMAIL=your-email@gmail.com
   SENDER_PASSWORD=abcd efgh ijkl mnop  # Your 16-digit app password

   # JWT Secret
   SECRET_KEY=your-secret-key-change-in-production
   ```

3. **Replace values:**
   - `SENDER_EMAIL`: Your Gmail address (e.g., `ram.sahu@gmail.com`)
   - `SENDER_PASSWORD`: The 16-digit app password you copied

---

## 🐍 Step 3: Install python-dotenv (if not installed)

```bash
pip install python-dotenv
```

---

## 🔄 Step 4: Update email_utils.py to use .env

The code is already configured to read from environment variables:

```python
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "your-email@gmail.com")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD", "your-app-password")
```

---

## ✅ Step 5: Test Email Sending

1. **Start the server:**
   ```bash
   python -m uvicorn main:app --reload
   ```

2. **Test forgot password:**
   - Go to: http://127.0.0.1:8000/forgot-password
   - Enter a registered email
   - Click "Send Reset Link"

3. **Check your email inbox:**
   - You should receive a professional email with reset link
   - Check spam folder if not in inbox

---

## 🎨 Email Template Features

The password reset email includes:
- ✅ Professional HTML design with gradient header
- ✅ Clickable "Reset Password" button
- ✅ Security warnings (15-minute expiry)
- ✅ Fallback plain text version
- ✅ Mobile-responsive design

---

## 🔒 Security Best Practices

1. **Never commit `.env` file to Git**
   - Already added to `.gitignore`

2. **Use different credentials for production**
   - Consider using SendGrid, AWS SES, or Mailgun for production

3. **Rotate app passwords regularly**

4. **Monitor email sending limits:**
   - Gmail free tier: ~500 emails/day
   - For higher volume, use dedicated email service

---

## 🐛 Troubleshooting

### Email not sending?

1. **Check credentials:**
   ```python
   print(os.getenv("SENDER_EMAIL"))  # Should print your email
   ```

2. **Check 2-Step Verification:**
   - Must be enabled for app passwords

3. **Check spam folder:**
   - Gmail might mark it as spam initially

4. **Check terminal output:**
   - Look for "✅ Password reset email sent" or error messages

5. **Test SMTP connection:**
   ```python
   import smtplib
   server = smtplib.SMTP("smtp.gmail.com", 587)
   server.starttls()
   server.login("your-email@gmail.com", "your-app-password")
   print("✅ Connection successful!")
   ```

---

## 🚀 Production Recommendations

For production deployment, consider:

1. **SendGrid** (Free tier: 100 emails/day)
   - More reliable delivery
   - Better analytics
   - Professional sender reputation

2. **AWS SES** (Pay as you go)
   - Highly scalable
   - Very cheap ($0.10 per 1000 emails)

3. **Mailgun** (Free tier: 5000 emails/month)
   - Good for transactional emails

---

## 📊 Current Implementation

- ✅ Gmail SMTP configured
- ✅ HTML email templates
- ✅ Secure credential storage (.env)
- ✅ Error handling
- ✅ Fallback to console logging if email fails
- ✅ 15-minute token expiry

---

## 🎯 Next Steps

1. Generate Gmail App Password
2. Create `.env` file with credentials
3. Test forgot password flow
4. Check email inbox
5. Click reset link and test password reset

---

**Need Help?**
- Gmail App Passwords: https://support.google.com/accounts/answer/185833
- SMTP Settings: https://support.google.com/mail/answer/7126229
