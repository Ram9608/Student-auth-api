import PyPDF2
import pytesseract
from PIL import Image
import io
import os

# 📝 OCR Support: Utilize Tesseract for text extraction from images (PNG/JPG).
def extract_text_from_image(image_bytes: bytes) -> str:
    try:
        img = Image.open(io.BytesIO(image_bytes))
        return pytesseract.image_to_string(img)
    except Exception as e:
        print(f"OCR Error: {e}")
        return ""

# ✅ This function extracts all text from an uploaded PDF file for database persistence.
def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    try:
        # Open file in "rb" (read-binary) mode.
        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            # Iterate through all pages to extract text content.
            for page in reader.pages:
                text += page.extract_text() or ""
    except Exception as e:
        print(f"Error reading PDF: {e}")
        text = "" 
    return text
