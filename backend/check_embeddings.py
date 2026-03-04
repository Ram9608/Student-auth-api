from app.database import SessionLocal
from app.models import FaceEmbedding, User
import json

def check_embeddings():
    db = SessionLocal()
    count = db.query(FaceEmbedding).count()
    print(f"Total Face Embeddings in DB: {count}")
    
    embeddings = db.query(FaceEmbedding).all()
    for e in embeddings:
        user = db.query(User).filter(User.id == e.user_id).first()
        name = user.full_name if user else "Unknown"
        print(f"User ID: {e.user_id} ({name}), Embedding size: {len(json.loads(e.embedding_json))}")
    
    db.close()

if __name__ == "__main__":
    check_embeddings()
