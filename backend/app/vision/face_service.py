import cv2
import numpy as np
# from deepface import DeepFace  # Moved inside methods to prevent hang
import json

# Face Service - Face Recognition via DeepFace only
# Removed mediapipe dependency since newer mediapipe removed .solutions API

# Face Service - Optimized for Performance
# Singleton pattern avoids multiple model loads.

class FaceService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FaceService, cls).__new__(cls)
            cls._instance.model_name = "Facenet"
            cls._instance.built = False
            cls._instance.cache = {} # {id: {"user_id": uid, "embedding": np_array}}
        return cls._instance

    def build(self, db=None):
        """Call this at server startup to warm up AI and load embeddings."""
        if not self.built:
            print("Warming up FaceService (Facenet model)...")
            try:
                from deepface import DeepFace
                DeepFace.build_model(self.model_name)
                self.built = True
                print("Face Model Ready!")
                if db:
                    self.warm_cache(db)
            except Exception as e:
                print(f"FaceService warm up failed: {e}")

    def warm_cache(self, db):
        """Pre-load all embeddings from DB into memory for INSTANT matching."""
        from ..models import FaceEmbedding
        embeddings = db.query(FaceEmbedding).all()
        self.cache = {}
        for entry in embeddings:
            try:
                vec = np.array(json.loads(entry.embedding_json))
                # Pre-normalize for instant dot product usage later
                norm = np.linalg.norm(vec)
                if norm > 0:
                    vec = vec / norm
                self.cache[entry.id] = {"user_id": entry.user_id, "embedding": vec}
            except:
                pass
        print(f"Face Cache Pre-Normalized: {len(self.cache)} vectors/IDs mapped!")

    def get_embedding(self, image_bgr):
        """
        Get face embedding vector from BGR image.
        Returns list (embedding) or None if no face found.
        """
        try:
            from deepface import DeepFace
            # Try multiple detectors for robustness if the fast one fails
            # Sequence: opencv (fastest) -> mtcnn (accurate) -> skip (enforce_detection=False)
            detectors = ['opencv', 'mtcnn']
            
            for detector in detectors:
                try:
                    print(f"AI: Processing with detector: {detector}...")
                    results = DeepFace.represent(
                        img_path=image_bgr,
                        model_name=self.model_name,
                        enforce_detection=True,
                        detector_backend=detector
                    )
                    
                    if results and len(results) > 0:
                        print(f"AI: Face detected using {detector}!")
                        if len(results) > 1:
                            print(f"Warning: {len(results)} faces detected. Using the primary one.")
                        return results[0]["embedding"]
                except ValueError:
                    print(f"Warning: AI: {detector} failed to detect face. Trying next...")
                    continue
                except Exception as e:
                    print(f"Error: AI: Error with {detector}: {e}")
                    continue

            # FINAL FALLBACK: No strict detection, just try to represent the whole image center
            print("AI: Final fallback - attempting representation without strict detection.")
            results = DeepFace.represent(
                img_path=image_bgr,
                model_name=self.model_name,
                enforce_detection=False,
                detector_backend='opencv'
            )
            if results and len(results) > 0:
                print("AI: Embedding generated in fallback mode.")
                return results[0]["embedding"]
                
        except Exception as e:
            print(f"DeepFace Critical Error: {e}")
        return None

    def find_best_match(self, current_vector, threshold=0.65):
        """
        Calculates cosine distance against ALL cached embeddings.
        Returns user_id of strongest match or None.
        FAST: Does all math in numpy instead of python loops.
        """
        if not self.cache:
            return None

        # 1. Prepare query vector (Normalize it)
        v_query = np.array(current_vector)
        v_query = v_query / np.linalg.norm(v_query)

        # 2. Collect all embeddings into a matrix
        ids = list(self.cache.keys())
        embeddings = np.array([self.cache[cid]["embedding"] for cid in ids])

        # 3. Embeddings are already normalized in warm_cache
        # 4. Matrix multiplication (Cosine Similarity = Dot Product)
        # Result is (len(ids),) vector of similarities
        similarities = np.dot(embeddings, v_query)
        
        # 5. Distance = 1 - Similarity
        distances = 1 - similarities
        
        # 6. Find the best match
        best_idx = np.argmin(distances)
        min_dist = distances[best_idx]

        if min_dist < threshold:
            best_uid = self.cache[ids[best_idx]]["user_id"]
            print(f"Fast Vector Match: UID {best_uid} - Dist {min_dist:.4f}")
            return best_uid
        
        return None

    def match_faces(self, embedding1, embedding2, threshold=0.65):
        """Fallback match for two specific vectors."""
        vec1 = np.array(embedding1) / np.linalg.norm(embedding1)
        vec2 = np.array(embedding2) / np.linalg.norm(embedding2)
        dist = 1 - np.dot(vec1, vec2)
        return bool(dist < threshold)

    def match_user_face(self, user_id, current_vector, threshold=0.65):
        """
        Check if the current vector matches a SPECIFIC user's cached embedding.
        Fast: Direct cache lookup by user_id.
        """
        if not self.cache:
            return False

        # Find the vector for the given user_id in cache (First match)
        user_vector = None
        for data in self.cache.values():
            if data["user_id"] == user_id:
                user_vector = data["embedding"]
                break
        
        if user_vector is None:
            return False

        v_query = np.array(current_vector) / np.linalg.norm(current_vector)
        v_db = user_vector / np.linalg.norm(user_vector)
        
        dist = 1 - np.dot(v_query, v_db)
        print(f"Individual Match: User {user_id} - Dist {dist:.4f} (Thr {threshold})")
        
        return bool(dist < threshold)

    def verify_liveness(self, image_bgr):
        return True
