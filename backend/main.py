from fastapi import FastAPI, UploadFile, File
import shutil
from services.job_matcher import match_jobs
from services.semantic_matcher import semantic_job_match
from fastapi.middleware.cors import CORSMiddleware
from services.resume_parser import extract_text
from services.resume_analyzer import analyze_resume
from services.chat_engine import chat_with_resume
from services.score_calculator import generate_score_breakdown



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

    resume_text = stored_resume["text"]
    
    # Step 1: Analyze Resume
    analysis = analyze_resume(resume_text)

    skills = analysis.get("skills", [])

    # Step 2: Generate Intelligent Score Breakdown
    score_breakdown = generate_score_breakdown(resume_text, analysis)
    scores = score_breakdown["scores"]
    overall_score = score_breakdown["overall_score"]
    recommendations = score_breakdown["recommendations"]

    # Step 3: Job Matching
    job_results = match_jobs(skills)

    # Final structured response with real data
    final_response = {
        "summary": analysis.get("summary", analysis.get("experience", "Resume analyzed")),
        "education": analysis.get("education", "Not specified"),
        "experience": analysis.get("experience", "Not specified"),
        "skills": skills,
        "scores": scores,
        "overall_score": overall_score,
        "recommendations": recommendations,
        "job_matches": job_results,
        "certifications": analysis.get("certifications", []),
        "projects": analysis.get("projects", ""),
        "job_roles": analysis.get("job_roles", [])
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