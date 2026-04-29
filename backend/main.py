import os
import httpx

from fastapi import FastAPI
from anthropic import Anthropic, BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()  # Must be first, before any os.environ.get()

PL_API_TOKEN = os.environ.get("PL_API_TOKEN")
PL_API_BASE = "https://us.prairielearn.com/pl/api/v1"
PL_HEADERS = {"Private-Token": PL_API_TOKEN}

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/assessments")
async def get_assessments():
    result = supabase.table("assessments").select("*").order("name").execute()
    return result.data

@app.get("/assessments/{assessment_id}/questions")
async def get_questions(assessment_id: str):
    result = (supabase.table("questions")
              .select("*")
              .eq("assessment_id", assessment_id)
              .order("title")
              .execute())
    return result.data

@app.get("/questions/{question_id}/concepts")
async def get_question_concepts(question_id: str):
    result = (supabase.table("question_concepts")
              .select("*")
              .eq("question_id", question_id)
              .execute())
    return result.data


class PinRequest(BaseModel):
    pin: str

@app.post("/validate-pin")
async def validate_pin(body: PinRequest):
    result = supabase.table("student_pins").select("pin").eq("pin", body.pin).execute()
    return {"valid": len(result.data) > 0}