import json
from services.llm import generate

def analyze_resume(text: str) -> dict:

    prompt = f"""
You are a resume analyzer. Extract detailed information from this resume and return ONLY valid JSON.

Return this exact structure (no markdown, no explanation, pure JSON only):

{{
  "skills": ["list", "of", "technical", "and", "soft", "skills"],
  "education": "Summary of education (degree, university, graduation year if available)",
  "experience": "Summary of work experience including years of experience and key roles",
  "job_roles": ["list", "of", "job", "titles", "or", "positions"],
  "summary": "A brief (1-2 sentence) professional summary based on resume",
  "certifications": ["list", "of", "certifications", "if", "any"],
  "projects": "Brief mention of notable projects if mentioned in resume"
}}

Resume content:
{text}

Return ONLY the JSON object, nothing else."""

    response = generate(prompt).strip()

    # Clean accidental markdown
    if response.startswith("```"):
        response = response.replace("```json", "").replace("```", "").strip()
    if response.startswith("{") == False:
        # Find where JSON starts
        json_start = response.find("{")
        if json_start != -1:
            response = response[json_start:]
    if response.endswith("}") == False:
        # Find where JSON ends
        json_end = response.rfind("}")
        if json_end != -1:
            response = response[:json_end+1]

    try:
        return json.loads(response)
    except:
        return {
            "skills": [],
            "education": "Not extracted",
            "experience": "Not extracted",
            "job_roles": [],
            "summary": "Unable to extract summary",
            "certifications": [],
            "projects": "",
            "raw_output": response
        }
