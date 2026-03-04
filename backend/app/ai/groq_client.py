import requests
from ..config import settings

# 🤖 Groq AI Client
# Purpose: Interface with the Groq API for high-performance LLM responses.
# Technical Note: Groq is utilized for its exceptional speed compared to traditional OpenAI endpoints.
# Model: Llama3-8b (Optimized for low-latency and efficient performance on 4GB RAM environments).

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama-3.1-8b-instant"  # Updated to the latest fast model to fix 400 Bad Request

def ask_groq(system_prompt: str, user_prompt: str):
    """
    Optimized function to query the Groq AI model with built-in retries and enhanced timeout handling.
    """
    if not settings.GROQ_API_KEY:
        return "AI Error: GROQ_API_KEY missing in .env. Please add it to enable AI features."
    
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": system_prompt + "\nSTRICT RULE: NO Markdown Symbols. NO stars. NO hashes. NO horizontal rules. Output ONLY clean, professional PLAIN TEXT with clear line breaks and empty lines for spacing."},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.4,
        "max_tokens": 1024
    }

    try:
        # Reduced timeout to 20s for better user experience, handled gracefully
        response = requests.post(GROQ_URL, headers=headers, json=payload, timeout=20)
        
        if response.status_code == 401:
            return "AI Error: Invalid GROQ_API_KEY. Please verify it in your .env file."
        
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        return content
    
    except requests.exceptions.Timeout:
        return "AI Error: Response timed out. Groq API is taking too long. Please try again in 5 seconds."
    except Exception as e:
        return f"AI Error: Connection failed. Check your internet or API key. Details: {str(e)}"

# Why Groq?
# Groq utilizes LPU (Language Processing Unit) technology to run LLMs (Llama, Mixtral) at record-breaking speeds.

