from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import uvicorn
import numpy as np
import cv2
import time
from utils import track_eyes
from pydantic import BaseModel
import requests
from executor import run_code

load_dotenv()
app=FastAPI()

API_KEY = os.getenv("API_KEY")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/track-eyes")
async def track_eyes_api(frame: UploadFile = File(...)):
    contents = await frame.read()

    np_arr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    result = track_eyes(img)

    return result


# 🔹 Input schema
class PromptRequest(BaseModel):
    prompt: str

class QuestionRequest(BaseModel):
    topic: str
    subtopic: str

class CodeRequest(BaseModel):
    code: str
    test_cases: list

class AnswerRequest(BaseModel):
    question: str
    expected_points: str | list | None = None
    answer: str

# 🔹 n8n webhook URL
N8N_WEBHOOK_URL = "http://localhost:5678/webhook/ollama-agent"


@app.post("/get_5_subtopics")
def generate_response(req: PromptRequest):
    try:
        response = requests.post(
            N8N_WEBHOOK_URL,
            json={"prompt": req.prompt}
        )
        print(response.status_code, response.text)
        return response.json()

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


#This is suppose to be called 5 times get question for each subtopic
@app.post("/get_questions")
def get_questions(req: QuestionRequest):
    try:
        response = requests.post(
            "http://localhost:5678/webhook/generate-questions",
            json={
                "topic": req.topic,
                "subtopic": req.subtopic
            }
        )

        print(response.status_code, response.text)
        return response.json()

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.post("/run_code")
def execute_code(req: CodeRequest):
    results = []

    for test in req.test_cases:
        result = run_code(req.code, test["input"])

        passed = result["stdout"] == str(test["expected"])

        results.append({
            "input": test["input"],
            "expected": test["expected"],
            "output": result["stdout"],
            "error": result["stderr"],
            "passed": passed
        })

    total = len(results)
    passed_count = sum(r["passed"] for r in results)

    return {
        "results": results,
        "score": f"{passed_count}/{total}"
    }


@app.post("/submit_answer")
def submit_answer(req: AnswerRequest):
    try:
        response = requests.post(
            "http://localhost:5678/webhook/verify-answer",
            json={
                "question": req.question,
                "expected_points": req.expected_points,
                "answer": req.answer
            }
        )

        print(response.status_code, response.text)
        return response.json()

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/")
def read_root():
    return {"message": "Server running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)