from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.media_item import MediaItem
from app.models.similarity_match import SimilarityMatch
from app.models.user import User

router = APIRouter(prefix="/api/proof", tags=["proof"])


@router.get("/{slug}")
def get_proof(slug: str, db: Session = Depends(get_db)):
    item = db.scalar(select(MediaItem).where(MediaItem.proof_slug == slug))
    if not item:
        raise HTTPException(status_code=404, detail="Proof not found")
    matches = db.scalars(select(SimilarityMatch).where(SimilarityMatch.media_item_id == item.id)).all()
    first_owner = db.scalar(select(User).where(User.id == item.user_id))

    first_match_info = None
    if matches:
        best = max(matches, key=lambda m: m.similarity_score)
        matched_item = db.scalar(select(MediaItem).where(MediaItem.id == best.matched_media_item_id))
        matched_owner = db.scalar(select(User).where(User.id == matched_item.user_id)) if matched_item else None
        first_match_info = {
            "matched_media_id": best.matched_media_item_id,
            "similarity_score": best.similarity_score,
            "match_type": best.match_type,
            "first_registered_at": matched_item.first_registered_at if matched_item else None,
            "first_author": matched_owner.name if matched_owner else None,
            "first_author_id": matched_owner.id if matched_owner else None,
        }

    return {
        "status": "FIRST REGISTERED" if not matches else "SIMILAR FOUND",
        "disclaimer": "First registered in our system, not first on the internet.",
        "human_summary": {
            "uploaded_media_id": item.id,
            "uploaded_by": first_owner.name if first_owner else item.user_id,
            "uploaded_at": item.first_registered_at,
            "first_in_system": not bool(matches),
            "similar_to_existing": bool(matches),
            "first_existing_match": first_match_info,
        },
        "item": item,
        "matches": matches,
    }
