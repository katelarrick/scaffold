import os
from fastapi import FastAPI
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

@app.get("/")
def health_check():
    return {"status": "ok"}

@app.get("/test-claude")
def test_claude():
    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=64,
        messages=[{"role": "user", "content": "Say hello in one sentence."}]
    )
    return {"response": message.content[0].text}