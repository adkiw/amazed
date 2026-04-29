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
from app.models.user import User
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

    detailed_uploads = []
    for i in items[:10]:
        same_hash = db.scalars(select(MediaItem).where(MediaItem.file_hash == i.file_hash).order_by(MediaItem.first_registered_at.asc())).all()
        first_item = same_hash[0] if same_hash else i
        rank = 1
        for idx, record in enumerate(same_hash, start=1):
            if record.id == i.id:
                rank = idx
                break
        first_owner = db.scalar(select(User).where(User.id == first_item.user_id))
        detailed_uploads.append({
            "id": i.id,
            "title": i.title,
            "created_at": i.created_at,
            "proof_slug": i.proof_slug,
            "is_first_for_hash": rank == 1,
            "rank_for_same_hash": rank,
            "first_uploader_name": first_owner.name if first_owner else None,
            "first_uploader_id": first_owner.id if first_owner else first_item.user_id,
            "first_registered_at": first_item.first_registered_at,
        })

    return {
        "user_id": user_id,
        "total_uploads": len(items),
        "image_uploads": len(images),
        "video_uploads": len(videos),
        "latest_uploads": detailed_uploads,
    }


@router.delete("/{media_id}")
def delete_media(media_id: int, db: Session = Depends(get_db)):
    item = db.scalar(select(MediaItem).where(MediaItem.id == media_id))
    if not item:
        raise HTTPException(status_code=404, detail="Not found")

    related = db.scalars(select(SimilarityMatch).where((SimilarityMatch.media_item_id == media_id) | (SimilarityMatch.matched_media_item_id == media_id))).all()
    for row in related:
        db.delete(row)

    db.delete(item)
    db.commit()
    return {"ok": True, "deleted_media_id": media_id}
