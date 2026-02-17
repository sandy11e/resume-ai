from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from services.job_database import jobs
import numpy as np

# Lazy load model - only load when first needed
_model = None

def _get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model

def semantic_job_match(resume_summary: str):

    model = _get_model()
    resume_embedding = model.encode([resume_summary])

    results = []

    for job in jobs:
        job_embedding = model.encode([job["description"]])
        similarity = cosine_similarity(resume_embedding, job_embedding)[0][0]

        results.append({
            "job_title": job["title"],
            "similarity_score": round(float(similarity * 100), 2),
            "job_description": job["description"]
        })

    results.sort(key=lambda x: x["similarity_score"], reverse=True)

    return results
