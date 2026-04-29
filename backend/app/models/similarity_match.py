from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class SimilarityMatch(Base):
    __tablename__ = "similarity_matches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    media_item_id: Mapped[int] = mapped_column(ForeignKey("media_items.id"), nullable=False)
    matched_media_item_id: Mapped[int] = mapped_column(ForeignKey("media_items.id"), nullable=False)
    similarity_score: Mapped[int] = mapped_column(Integer, nullable=False)
    match_type: Mapped[str] = mapped_column(String(32), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
