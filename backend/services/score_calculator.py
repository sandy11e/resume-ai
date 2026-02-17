"""
Intelligent Resume Scoring Module
Calculates comprehensive scores based on actual resume content
"""

import re
from collections import Counter

# Common ATS keywords that recruiters/systems look for
ATS_KEYWORDS = {
    "technical_acronyms": ["API", "REST", "SQL", "CI/CD", "JSON", "XML", "HTML", "CSS", "AWS", "GCP", "AZURE", "ML", "AI", "NLP"],
    "action_verbs": ["developed", "designed", "implemented", "managed", "led", "created", "built", "architected", "optimized", "deployed"],
    "soft_skills": ["leadership", "communication", "teamwork", "collaboration", "problem-solving", "analytical", "strategic", "innovative"]
}

KEY_SECTIONS = ["education", "experience", "skills", "projects", "certifications", "awards"]

def calculate_ats_score(resume_text: str, analysis: dict) -> int:
    """
    Calculate ATS compatibility score (0-100)
    Based on formatting, structure, and keyword presence
    """
    score = 50  # Base score
    
    text_lower = resume_text.lower()
    
    # Check for standard resume sections
    section_count = 0
    for section in KEY_SECTIONS:
        if re.search(rf"\b{section}\b", text_lower):
            section_count += 1
    
    section_score = min(section_count * 8, 30)  # Max 30 points
    score += section_score
    
    # Check for technical keywords
    technical_count = sum(1 for keyword in ATS_KEYWORDS["technical_acronyms"] 
                         if keyword.lower() in text_lower)
    technical_score = min(technical_count * 2, 15)
    score += technical_score
    
    # Check for action verbs
    action_verb_count = sum(1 for verb in ATS_KEYWORDS["action_verbs"] 
                           if verb.lower() in text_lower)
    verb_score = min(action_verb_count, 10)
    score += verb_score
    
    # Penalize for very short text
    if len(resume_text) < 200:
        score -= 15
    
    # Check for proper formatting (bullet points, numbers, dates)
    if "•" in resume_text or "-" in resume_text or "*" in resume_text:
        score += 5
    
    if re.search(r"\d{4}[-/]\d{4}|\d{4}[-/]\d{2}", resume_text):  # Date patterns
        score += 5
    
    return min(max(score, 0), 100)


def calculate_relevance_score(analysis: dict, resume_text: str) -> int:
    """
    Calculate how relevant the resume is to current job market
    Based on skills demand, experience currency, and education
    """
    score = 40  # Base score
    
    skills = analysis.get("skills", [])
    experience = analysis.get("experience", "")
    education = analysis.get("education", "")
    
    # Convert to string if needed (handle dicts, lists, etc)
    if isinstance(experience, dict):
        experience = str(experience)
    elif isinstance(experience, list):
        experience = " ".join(str(e) for e in experience)
    else:
        experience = str(experience) if experience else ""
    
    if isinstance(education, dict):
        education = str(education)
    elif isinstance(education, list):
        education = " ".join(str(e) for e in education)
    else:
        education = str(education) if education else ""
    
    # In-demand tech skills
    trending_skills = [
        "Python", "JavaScript", "React", "TypeScript", "AWS", "Docker",
        "Kubernetes", "AI", "Machine Learning", "Data Science", "Cloud",
        "DevOps", "CI/CD", "Microservices", "SQL"
    ]
    
    trending_count = sum(1 for skill in skills if any(t.lower() in skill.lower() for t in trending_skills))
    skill_relevance = min(trending_count * 5, 30)
    score += skill_relevance
    
    # Check for recent experience indicators
    if any(word in experience.lower() for word in ["recent", "currently", "present", "2024", "2025", "2026"]):
        score += 15
    elif any(word in experience.lower() for word in ["2023"]):
        score += 10
    elif any(word in experience.lower() for word in ["2022"]):
        score += 5
    
    # Education bonus
    if any(degree in education.lower() for degree in ["bachelor", "master", "phd", "engineering", "computer science"]):
        score += 10
    
    # Penalize if very old experience
    if any(year in resume_text for year in ["2010", "2009", "2008"]):
        score -= 5
    
    return min(max(score, 0), 100)


def calculate_keywords_score(skills: list, resume_text: str) -> int:
    """
    Calculate keyword coverage and density
    Based on industry-relevant keywords in resume
    """
    text_lower = resume_text.lower()
    score = 30  # Base score
    
    # Count skill mentions
    skill_mentions = 0
    for skill in skills:
        skill_mentions += text_lower.count(skill.lower())
    
    skill_score = min(len(skills) * 5 + min(skill_mentions * 2, 20), 40)
    score += skill_score
    
    # Check for certifications/credentials
    cert_keywords = ["certification", "certified", "license", "credential", "aws certified", "gcp certified"]
    if any(cert in text_lower for cert in cert_keywords):
        score += 10
    
    # Check for methodologies
    methodologies = ["agile", "scrum", "kanban", "waterfall", "devops", "tdd", "bdd"]
    methodology_count = sum(1 for method in methodologies if method in text_lower)
    score += min(methodology_count * 3, 15)
    
    return min(max(score, 0), 100)


def calculate_formatting_score(resume_text: str) -> int:
    """
    Calculate resume formatting quality and readability
    """
    score = 50  # Base score
    
    lines = resume_text.split("\n")
    
    # Check for reasonable line length (not too cramped)
    avg_line_length = sum(len(line) for line in lines) / max(len(lines), 1)
    if 40 < avg_line_length < 100:
        score += 15
    elif 30 < avg_line_length < 120:
        score += 10
    
    # Check for consistency in formatting
    bullet_lines = sum(1 for line in lines if line.strip().startswith(("•", "-", "*")))
    if bullet_lines > 0:
        score += 10
    
    # Check text doesn't have excessive special characters (indicates pdf corruption)
    special_chars = sum(1 for char in resume_text if ord(char) > 127)
    if special_chars < len(resume_text) * 0.05:  # Less than 5% special chars
        score += 15
    
    # Penalize excessive whitespace
    if resume_text.count("\n\n") > len(lines) * 0.3:
        score -= 10
    
    # Check for proper spacing and paragraph breaks
    if len(lines) > 20:  # Has decent content
        score += 10
    
    return min(max(score, 0), 100)


def calculate_experience_score(experience: str, skills: list, resume_text: str) -> int:
    """
    Calculate experience level and quality
    """
    score = 40  # Base score
    
    # Convert to string if needed (handle dicts, lists, etc)
    if isinstance(experience, dict):
        experience = str(experience)
    elif isinstance(experience, list):
        experience = " ".join(str(e) for e in experience)
    else:
        experience = str(experience) if experience else ""
    
    if not experience:
        return score
    
    text_lower = experience.lower()
    
    # Check for years of experience
    years_match = re.findall(r"(\d+)\+?\s*years?", text_lower)
    if years_match:
        years = int(max(years_match))
        if years >= 10:
            score += 25
        elif years >= 5:
            score += 18
        elif years >= 3:
            score += 12
        elif years >= 1:
            score += 8
    
    # Check for leadership/management experience
    if any(word in text_lower for word in ["led", "managed", "supervised", "directed", "team", "department"]):
        score += 15
    
    # Check for measurable achievements (percentages, numbers)
    if re.search(r"\d+\%|improved.*\d+|increased.*\d+|reduced.*\d+", text_lower):
        score += 12
    
    # Check for diverse roles (job switching vs stability)
    job_count = len(re.findall(r"(?:position|role|engineer|developer|manager|analyst|specialist)", text_lower))
    if 3 <= job_count <= 6:
        score += 10
    elif job_count > 6:
        score += 8
    
    return min(max(score, 0), 100)


def calculate_projects_score(analysis: dict, resume_text: str) -> int:
    """
    Calculate presence and quality of projects
    """
    score = 35  # Base score
    
    text_lower = resume_text.lower()
    
    # Check for projects section
    if "project" in text_lower:
        score += 20
    
    # Check for quantifiable project metrics
    if re.search(r"users?.*\d+|downloads?.*\d+|stars?.*\d+|contributors?.*\d+", text_lower):
        score += 15
    
    # Check for open source mentions
    if any(term in text_lower for term in ["github", "gitlab", "open source", "npm", "pypi"]):
        score += 15
    
    # Check for deployed/published projects
    if any(term in text_lower for term in ["deployed", "published", "released", "launched", "production"]):
        score += 10
    
    # Check for technical diversity in projects
    job_roles = analysis.get("job_roles", [])
    if len(job_roles) > 0:
        score += 5
    
    return min(max(score, 0), 100)


def calculate_education_score(education: str) -> int:
    """
    Calculate education credentials impact
    """
    score = 20  # Base score
    
    # Convert to string if needed (handle dicts, lists, etc)
    if isinstance(education, dict):
        education = str(education)
    elif isinstance(education, list):
        education = " ".join(str(e) for e in education)
    else:
        education = str(education) if education else ""
    
    if not education:
        return score
    
    text_lower = education.lower()
    
    # Degree level scoring
    if "phd" in text_lower or "doctorate" in text_lower:
        score += 40
    elif "master" in text_lower or "ms" in text_lower or "mba" in text_lower:
        score += 35
    elif "bachelor" in text_lower or "bs" in text_lower or "ba" in text_lower:
        score += 25
    elif "associate" in text_lower or "diploma" in text_lower:
        score += 15
    else:
        score += 10
    
    # Check for relevant major
    relevant_majors = ["computer science", "engineering", "mathematics", "physics", "data science", "information technology"]
    if any(major in text_lower for major in relevant_majors):
        score += 15
    
    # Check for university tier (rough approximation)
    if any(uni in text_lower for uni in ["stanford", "mit", "harvard", "berkeley", "carnegie", "caltech"]):
        score += 10
    
    return min(max(score, 0), 100)


def calculate_overall_score(scores: dict) -> int:
    """
    Calculate weighted overall score
    """
    weights = {
        "ats": 0.15,           # 15% - System compatibility
        "relevance": 0.20,     # 20% - Job market fit
        "keywords": 0.20,      # 20% - Keyword coverage
        "formatting": 0.15,    # 15% - Presentation
        "experience": 0.20,    # 20% - Experience level
        "education": 0.10      # 10% - Education value
    }
    
    total = sum(scores.get(key, 0) * weight for key, weight in weights.items())
    return min(max(int(total), 0), 100)


def generate_score_breakdown(resume_text: str, analysis: dict) -> dict:
    """
    Generate comprehensive score breakdown with all metrics
    """
    skills = analysis.get("skills", [])
    experience = analysis.get("experience", "")
    education = analysis.get("education", "")
    
    scores = {
        "ats": calculate_ats_score(resume_text, analysis),
        "relevance": calculate_relevance_score(analysis, resume_text),
        "keywords": calculate_keywords_score(skills, resume_text),
        "formatting": calculate_formatting_score(resume_text),
        "experience": calculate_experience_score(experience, skills, resume_text),
        "education": calculate_education_score(education),
    }
    
    overall = calculate_overall_score(scores)
    
    # Generate recommendations based on scores
    recommendations = []
    
    if scores["ats"] < 70:
        recommendations.append("Add more standard resume sections (Education, Experience, Skills)")
    
    if scores["keywords"] < 70:
        recommendations.append("Include more industry-specific keywords and technical skills")
    
    if scores["formatting"] < 70:
        recommendations.append("Improve formatting with bullet points and consistent structure")
    
    if scores["experience"] < 60:
        recommendations.append("Add more detailed work experience with quantifiable achievements")
    
    if scores["relevance"] < 70:
        recommendations.append("Update resume with more recent experience and trending technologies")
    
    if not recommendations:
        recommendations.append("Resume is well-optimized!")
    
    return {
        "scores": scores,
        "overall_score": overall,
        "recommendations": recommendations
    }
