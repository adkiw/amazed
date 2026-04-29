from imagehash import hex_to_hash
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.media_item import MediaItem


def hamming_similarity(h1: str, h2: str) -> int:
    dist = (hex_to_hash(h1) - hex_to_hash(h2))
    return max(0, 100 - dist * 4)


def find_best_match(db: Session, file_hash: str, phash: str | None) -> tuple[MediaItem | None, int, str]:
    items = db.scalars(select(MediaItem)).all()
    best, best_score, match_type = None, 0, "none"
    for item in items:
        if item.file_hash == file_hash:
            return item, 100, "file_hash"
        if phash and item.perceptual_hash:
            score = hamming_similarity(phash, item.perceptual_hash)
            if score > best_score:
                best, best_score, match_type = item, score, "perceptual_hash"
    return best, best_score, match_type
