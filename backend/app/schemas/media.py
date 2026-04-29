from datetime import datetime

from pydantic import BaseModel


class MediaCreateResponse(BaseModel):
    id: int
    status: str
    proof_slug: str


class MatchResponse(BaseModel):
    media_item_id: int
    matched_media_item_id: int
    similarity_score: int
    match_type: str


class MediaDetail(BaseModel):
    id: int
    source_url: str | None
    file_hash: str
    perceptual_hash: str | None
    first_registered_at: datetime
    proof_slug: str
