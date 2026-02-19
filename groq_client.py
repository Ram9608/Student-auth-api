import os
import sys
from dotenv import load_dotenv

# Add the current directory to sys.path to make app module resolvable
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

from app.core.groq import GroqClient

def main():
    print("Testing Groq Client...")
    
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("Error: GROQ_API_KEY is not set in environment variables.")
        return

    client = GroqClient()
    
    try:
        messages = [{"role": "user", "content": "Hello! Please reply with a short greeting to confirm you are working."}]
        print("Sending request to Groq...")
        response = client.generate_chat_response(messages)
        print("\nGroq Response:")
        print(response)
        
    except Exception as e:
        print(f"Error testing Groq Client: {e}")

if __name__ == "__main__":
    main()
