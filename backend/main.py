import os
import httpx

from fastapi import FastAPI
from anthropic import Anthropic
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()  # Must be first, before any os.environ.get()

PL_API_TOKEN = os.environ.get("PL_API_TOKEN")
PL_API_BASE = "https://us.prairielearn.com/pl/api/v1"
PL_HEADERS = {"Private-Token": PL_API_TOKEN}

app = FastAPI()

claude = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_KEY")
)

@app.get("/")
def health_check():
    return {"status": "ok"}

@app.get("/test-pl")
async def test_prairielearn():
    async with httpx.AsyncClient() as http:
        response = await http.get(
            f"{PL_API_BASE}/course_instances/213859/assessments",
            headers=PL_HEADERS
        )
    return response.json()