import os
import re
from abc import ABC, abstractmethod
from typing import Optional
import google.generativeai as genai
import openai
from app.core.config import settings

class BaseAIProvider(ABC):
    @abstractmethod
    def generate_response(self, message: str) -> str:
        pass

class OpenAIProvider(BaseAIProvider):
    def __init__(self, api_key: str):
        self.client = openai.OpenAI(api_key=api_key)

    def generate_response(self, message: str) -> str:
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful education assistant chatbot. Keep answers short, educational, and polite."},
                    {"role": "user", "content": message}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI Error: {e}")
            raise e

class GeminiProvider(BaseAIProvider):
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash-latest')

    def generate_response(self, message: str) -> str:
        try:
            response = self.model.generate_content(message)
            return response.text
        except Exception as e:
            print(f"Gemini Error: {e}")
            raise e

class FallbackProvider(BaseAIProvider):
    def generate_response(self, message: str) -> str:
        msg = message.lower()
        if "hello" in msg or "hi" in msg:
            return "Hello! I am your Student Assistant. How can I help you today?"
        if "job" in msg:
            return "You can view jobs in the 'All Jobs' tab or check 'For You' for recommendations."
        if "resume" in msg:
            return "Go to your 'Profile' tab to upload your PDF resume for analysis."
        if "skill" in msg:
            return "Updating your skills in the profile will help us recommend better jobs for you."
        return "I am currently running in offline mode. Please ask about Jobs, Resumes, or Skills, or configure an AI API Key for full capabilities."

class ChatbotService:
    def __init__(self):
        # Determine available providers
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        
        self.providers = {}
        
        if self.openai_key:
            self.providers["openai"] = OpenAIProvider(self.openai_key)
        
        if self.gemini_key:
            self.providers["gemini"] = GeminiProvider(self.gemini_key)
            
        self.providers["fallback"] = FallbackProvider()

    def get_response(self, message: str, preferred_provider: str = "auto") -> dict:
        provider_name = "fallback"
        provider = self.providers["fallback"]

        # Selection Logic
        if preferred_provider == "openai" and "openai" in self.providers:
            provider_name = "openai"
            provider = self.providers["openai"]
        elif preferred_provider == "gemini" and "gemini" in self.providers:
            provider_name = "gemini"
            provider = self.providers["gemini"]
        elif preferred_provider == "auto":
            # Priority: Gemini (Free Tier available) -> OpenAI -> Fallback
            if "gemini" in self.providers:
                provider_name = "gemini"
                provider = self.providers["gemini"]
            elif "openai" in self.providers:
                provider_name = "openai"
                provider = self.providers["openai"]
        
        try:
            response_text = provider.generate_response(message)
            return {"response": response_text, "provider": provider_name}
        except Exception:
            # Automatic failover to fallback
            return {
                "response": self.providers["fallback"].generate_response(message),
                "provider": "fallback (error recovered)"
            }
