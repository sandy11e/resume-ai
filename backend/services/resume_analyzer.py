import json
from services.llm import generate

def analyze_resume(text: str) -> dict:

    prompt = f"""
Return ONLY valid JSON.

Format:

{{
  "skills": [],
  "education": "",
  "experience": "",
  "job_roles": []
}}

Do NOT include markdown.
Do NOT include explanation.
Return pure JSON only.

Resume:
{text}
"""

    response = generate(prompt).strip()

    # Clean accidental markdown
    if response.startswith("```"):
        response = response.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(response)
    except:
        return {
            "skills": [],
            "education": "",
            "experience": "",
            "job_roles": [],
            "raw_output": response
        }
