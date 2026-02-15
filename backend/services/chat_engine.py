from services.llm import generate

def chat_with_resume(structured_data: dict, question: str) -> str:

    prompt = f"""
You are a resume assistant.

Use ONLY this structured resume data:
{structured_data}

If answer not found, say:
"Not mentioned in resume."

Answer concisely.

Question:
{question}
"""

    return generate(prompt)
