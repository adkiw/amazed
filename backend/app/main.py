from fastapi import FastAPI

from app.api.auth import router as auth_router
from app.api.media import router as media_router
from app.api.proof import router as proof_router
from app.db import base  # noqa: F401
from app.db.session import engine
from app.models.base import Base

app = FastAPI(title="Proof of First Capture MVP")
app.include_router(auth_router)
app.include_router(media_router)
app.include_router(proof_router)


@app.on_event("startup")
def startup_init_db():
    # MVP safeguard: ensure required tables exist even if Alembic wasn't run yet.
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health():
    return {"ok": True}
