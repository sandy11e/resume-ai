from services.job_database import jobs

def match_jobs(candidate_skills: list):

    results = []

    for job in jobs:
        required = job["skills_required"]

        matched = list(set(candidate_skills) & set(required))
        missing = list(set(required) - set(candidate_skills))

        if required:
            fit_score = round((len(matched) / len(required)) * 100, 2)
        else:
            fit_score = 0

        results.append({
            "job_title": job["title"],
            "fit_score": fit_score,
            "matched_skills": matched,
            "missing_skills": missing
        })

    results.sort(key=lambda x: x["fit_score"], reverse=True)

    return results
