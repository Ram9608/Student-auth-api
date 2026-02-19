from groq import Groq
import os
from typing import Optional, List, Dict
import json

class GroqClient:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            # Fallback for dev/testing if not set, though it should be set
            print("WARNING: GROQ_API_KEY environment variable not set.")
        
        self.client = Groq(api_key=self.api_key)
        self.model = "llama-3.1-8b-instant"  # Using a capable model

    def generate_chat_response(self, messages: List[Dict[str, str]], temperature: float = 0.7) -> str:
        """
        Generate chat response using Groq.
        messages: List of {"role": "user/system", "content": "..."}
        """
        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=1024,
                top_p=1,
                stream=False,
                stop=None,
            )
            return completion.choices[0].message.content
        except Exception as e:
            print(f"Groq API Error: {str(e)}")
            return "I apologize, but I am currently experiencing high traffic. Please try again later."

    def extract_json(self, prompt: str) -> Dict:
        """
        Extract JSON data from a prompt. 
        Forces JSON mode if model supports or parses text.
        """
        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that outputs only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.1
            )
            content = completion.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            print(f"Groq JSON Extraction Error: {str(e)}")
            return {}

groq_client = GroqClient()
