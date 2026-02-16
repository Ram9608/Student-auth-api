import os
import pypdf
import re
from typing import List, Dict, Optional
from app.core.groq import GroqClient

class PDFParser:
    def __init__(self):
        self.groq = GroqClient()

    def extract_text(self, file_path: str) -> Optional[str]:
        """Extract all text from a PDF file."""
        if not os.path.exists(file_path):
            return None
        
        try:
            text = ""
            with open(file_path, 'rb') as file:
                reader = pypdf.PdfReader(file)
                for page in reader.pages:
                    text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            print(f"Error reading PDF {file_path}: {e}")
            return None

    def extract_skills(self, text: str) -> List[str]:
        """Use Groq to extract skills from text."""
        if not text:
            return []

        prompt = f"""
        Extract a list of technical and soft skills from the following resume text.
        Return ONLY a JSON object with a key "skills" containing a list of strings.
        Example: {{"skills": ["Python", "JavaScript", "Communication"]}}
        
        Resume Text:
        {text[:4000]}  # Limit token usage
        """
        
        try:
            result = self.groq.extract_json(prompt)
            if result and "skills" in result:
                return [s.strip() for s in result["skills"]]
            return []
        except Exception as e:
            print(f"Skill extraction error: {e}")
            return []

pdf_parser = PDFParser()
