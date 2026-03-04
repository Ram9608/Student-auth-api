from app.utils.skill_library import SKILL_RESOURCES

# 🧠 analyze_skills function: Ye function PDF se nikla text leta hai aur job me maange skills ko match krta hai (without heavy ML model, memory bachane k liye bas basic string match)
def analyze_skills(resume_text: str, job_skills: str):
    # Dono strings ko lower() karte hain taki 'Python' aur 'python' match ho jaye easily.
    resume_text = resume_text.lower()
    
    # job_skills string (ex "Python, FastAPI") ko array me split krta hai comma se, aur spaces trim krdeta hai strip()
    job_skill_list = [s.strip().lower() for s in job_skills.split(",")]

    matched = [] # Jo skills mil gye
    missing = [] # Jo skills resume mein nai mile

    # Har required skill ko dhundhte hain Resume text ke andar manually
    for skill in job_skill_list:
        if skill in resume_text:
            matched.append(skill)
        else:
            missing.append(skill)

    # Percentage formula: Kitne match hue / Total kitne mangay x 100
    match_percentage = (
        len(matched) / len(job_skill_list) * 100
        if job_skill_list else 0
    )

    # 💡 Missing skills check karke Skill Library se links attach krte hain array me
    suggestions = {}
    for skill in missing:
        if skill in SKILL_RESOURCES:
            suggestions[skill] = SKILL_RESOURCES[skill]

    return {
        "match_percentage": round(match_percentage, 2), # Ex: 66.67
        "matched_skills": matched,
        "missing_skills": missing,
        "learning_resources": suggestions # User ab click krke missing skills seekh skta hai direct 🚀
    }
