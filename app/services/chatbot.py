import os
import re
from abc import ABC, abstractmethod
from typing import Optional
import openai
from app.core.config import settings
from app.core.groq import groq_client

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

class GroqProvider(BaseAIProvider):
    def __init__(self):
        self.client = groq_client

    def generate_response(self, message: str) -> str:
        try:
            messages = [
                {"role": "system", "content": "You are a helpful education assistant chatbot. Keep answers short, educational, and polite."},
                {"role": "user", "content": message}
            ]
            return self.client.generate_chat_response(messages)
        except Exception as e:
            print(f"Groq Error: {e}")
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
        self.groq_key = os.getenv("GROQ_API_KEY")
        
        self.providers = {}
        
        if self.openai_key:
            self.providers["openai"] = OpenAIProvider(self.openai_key)
        
        # Groq client handles its own key check, but we can check existence here for logic
        if self.groq_key:
            self.providers["groq"] = GroqProvider()
            
        self.providers["fallback"] = FallbackProvider()

    def get_response(self, message: str, preferred_provider: str = "auto") -> dict:
        provider_name = "fallback"
        provider = self.providers["fallback"]

        # Selection Logic
        if preferred_provider == "openai" and "openai" in self.providers:
            provider_name = "openai"
            provider = self.providers["openai"]
        elif preferred_provider == "groq" and "groq" in self.providers:
            provider_name = "groq"
            provider = self.providers["groq"]
        elif preferred_provider == "auto":
            # Priority: Groq (Fast & Free Tier available) -> OpenAI -> Fallback
            if "groq" in self.providers:
                provider_name = "groq"
                provider = self.providers["groq"]
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
