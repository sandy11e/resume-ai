from fastapi import FastAPI, UploadFile, File
import shutil
from services.job_matcher import match_jobs
from services.semantic_matcher import semantic_job_match
from fastapi.middleware.cors import CORSMiddleware
from services.resume_parser import extract_text
from services.resume_analyzer import analyze_resume
from services.chat_engine import chat_with_resume



app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
stored_resume = {}
stored_analysis = {}

@app.post("/upload")
async def upload_resume(file: UploadFile = File(...)):

    with open("resume.pdf", "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = extract_text("resume.pdf")

    global stored_resume
    stored_resume = {"text": text}

    return {"message": "Resume uploaded successfully."}


@app.post("/analyze")
async def analyze():

    global stored_resume, stored_analysis

    if not stored_resume:
        return {"error": "Upload resume first."}

    # Step 1: Analyze Resume
    analysis = analyze_resume(stored_resume["text"])

    skills = analysis.get("skills", [])

    # Step 2: Job Matching
    job_results = match_jobs(skills)

    # Step 3: Score Breakdown
    scores = {
        "technical": min(len(skills) * 7, 100),
        "experience": 70,
        "education": 75,
        "projects": 80,
        "market_fit": min(len(job_results) * 5, 100)
    }

    overall_score = int(sum(scores.values()) / len(scores))

    # Final structured response
    final_response = {
        "summary": analysis.get("experience", ""),
        "skills": skills,
        "scores": scores,
        "overall_score": overall_score,
        "job_matches": job_results
    }

    stored_analysis = final_response

    return final_response



@app.post("/chat")
async def chat(question: str):

    global stored_analysis

    if not stored_analysis:
        return {"error": "Analyze resume first."}

    response = chat_with_resume(stored_analysis, question)

    return {"response": response}
