from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# 🤖 Job Recommender Logic
# Purpose: Analyzes resume text against a list of jobs to calculate a match score (Cosine Similarity).
# Why TF-IDF? Provides a lightweight and highly efficient alternative to heavy transformers like BERT/Transformers, ensuring smooth operation on 4GB RAM systems.

def recommend_jobs(resume_text: str, jobs: list, top_n: int = 3):
    """
    Calculates mathematical similarity between a student's resume and available job descriptions.
    
    Args:
        top_n (int): The number of top-ranked recommendations to return (Default: 3).
    
    Returns:
        list: Scored jobs sorted by match percentage.
    """

    # Validation: Return an empty set if input data is incomplete.
    if not resume_text or not jobs:
        return []

    # 1️⃣ Data Preparation: 
    # Combine Job Title, Description, and Skills into a singular document for comparison.
    # The first element in the corpus is always the user's resume (index 0).
    documents = [resume_text] + [
        f"{job.get('title', '')} {job.get('description', '')} {job.get('skills_required', '')}"
        for job in jobs
    ]

    # 2️⃣ Vectorization (TF-IDF):
    # Transforms text into a numerical matrix representing term significance.
    # stop_words="english": Filters out common filler words (e.g., 'the', 'is') for better accuracy.
    # max_features=500: Limits vocabulary to the most significant terms to optimize memory usage.
    vectorizer = TfidfVectorizer(stop_words="english", max_features=500)
    tfidf_matrix = vectorizer.fit_transform(documents)

    # 3️⃣ Cosine Similarity Calculation:
    # Compares the resume vector against the entire job corpus.
    # Scores range from 0 to 1, where 1 represents a perfect linguistic match.
    # Output is a percentage-based score for user readability.
    similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

    # 4️⃣ Result Formatting:
    scored_jobs = []
    for idx, score in enumerate(similarities):
        scored_jobs.append({
            "job_id": jobs[idx]["id"],
            "title": jobs[idx]["title"],
            "score": round(float(score) * 100, 2) # Normalize score to a 0-100 percentage scale.
        })

    # Sort candidates by descending match percentage.
    scored_jobs.sort(key=lambda x: x["score"], reverse=True)
    
    # Return Top N recommendations
    return scored_jobs[:top_n]

# 💡 Optimization Note: 
# Cosine Similarity is chosen for its efficiency in high-dimensional space and its ability to capture context beyond simple keyword matching.
# For high-scale deployments, consider integrating vector databases like PGVector or Faiss.
