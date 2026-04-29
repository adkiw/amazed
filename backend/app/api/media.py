import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.media_item import MediaItem
from app.models.similarity_match import SimilarityMatch
from app.schemas.media import MediaCreateResponse
from app.services.media_processing import audio_fingerprint_stub, compute_image_phash, extract_video_frame_hashes
from app.services.similarity import find_best_match
from app.utils.hashing import sha256_file

router = APIRouter(prefix="/api/media", tags=["media"])


@router.post("/upload", response_model=MediaCreateResponse)
def upload_media(
    user_id: int = Form(...),
    media_type: str = Form(...),
    source_url: str | None = Form(None),
    title: str | None = Form(None),
    author_name: str | None = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    uploads = Path(settings.uploads_dir)
    uploads.mkdir(parents=True, exist_ok=True)
    dst = uploads / f"{uuid.uuid4()}-{file.filename}"
    with dst.open("wb") as out:
        shutil.copyfileobj(file.file, out)

    file_hash = sha256_file(dst)
    phash = compute_image_phash(dst) if media_type == "image" else None
    video_hashes = extract_video_frame_hashes(dst, 7) if media_type == "video" else None
    audio_fp = audio_fingerprint_stub(dst) if media_type == "video" else None

    matched, score, match_type = find_best_match(db, file_hash, phash)
    slug = uuid.uuid4().hex[:12]

    item = MediaItem(
        user_id=user_id,
        media_type=media_type,
        source_url=source_url,
        title=title,
        author_name=author_name,
        file_hash=file_hash,
        perceptual_hash=phash,
        video_fingerprints=video_hashes,
        audio_fingerprint=audio_fp,
        proof_slug=slug,
    )
    db.add(item)
    db.flush()

    status = "FIRST REGISTERED"
    if matched and score >= 70:
        status = "SIMILAR FOUND"
        db.add(SimilarityMatch(media_item_id=item.id, matched_media_item_id=matched.id, similarity_score=score, match_type=match_type))

    db.commit()
    return MediaCreateResponse(id=item.id, status=status, proof_slug=slug)


@router.post("/register-url")
def register_url(payload: dict, db: Session = Depends(get_db)):
    # Extension metadata registration endpoint.
    return {"status": "received", "payload": payload}


@router.get("/{media_id}")
def get_media(media_id: int, db: Session = Depends(get_db)):
    media = db.scalar(select(MediaItem).where(MediaItem.id == media_id))
    if not media:
        raise HTTPException(status_code=404, detail="Not found")
    return media


@router.get("/{media_id}/matches")
def get_matches(media_id: int, db: Session = Depends(get_db)):
    rows = db.scalars(select(SimilarityMatch).where(SimilarityMatch.media_item_id == media_id)).all()
    return rows


@router.get("/user/{user_id}/stats")
def user_stats(user_id: int, db: Session = Depends(get_db)):
    items = db.scalars(select(MediaItem).where(MediaItem.user_id == user_id).order_by(MediaItem.created_at.desc())).all()
    images = [i for i in items if i.media_type == "image"]
    videos = [i for i in items if i.media_type == "video"]
    return {
        "user_id": user_id,
        "total_uploads": len(items),
        "image_uploads": len(images),
        "video_uploads": len(videos),
        "latest_uploads": [
            {
                "id": i.id,
                "title": i.title,
                "status_hint": "Peržiūrėkite /api/proof/" + i.proof_slug,
                "created_at": i.created_at,
                "proof_slug": i.proof_slug,
            }
            for i in items[:5]
        ],
    }
