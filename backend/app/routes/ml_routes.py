from fastapi import APIRouter
router = APIRouter()
@router.get("/")
def test_route(): return {"status": "ML route active"}
