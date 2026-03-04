from app.database import SessionLocal
from app.models import FaceEmbedding

def clear_embeddings():
    db = SessionLocal()
    try:
        count = db.query(FaceEmbedding).delete()
        db.commit()
        print(f"Successfully deleted {count} face embeddings. DB is now fresh for re-registration.")
    except Exception as e:
        db.rollback()
        print(f"Error clearing DB: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    clear_embeddings()
