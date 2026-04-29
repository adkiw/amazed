from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.media_item import MediaItem
from app.models.similarity_match import SimilarityMatch

router = APIRouter(prefix="/api/proof", tags=["proof"])


@router.get("/{slug}")
def get_proof(slug: str, db: Session = Depends(get_db)):
    item = db.scalar(select(MediaItem).where(MediaItem.proof_slug == slug))
    if not item:
        raise HTTPException(status_code=404, detail="Proof not found")
    matches = db.scalars(select(SimilarityMatch).where(SimilarityMatch.media_item_id == item.id)).all()
    return {
        "status": "FIRST REGISTERED" if not matches else "SIMILAR FOUND",
        "disclaimer": "First registered in our system, not first on the internet.",
        "item": item,
        "matches": matches,
    }
