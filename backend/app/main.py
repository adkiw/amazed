from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.auth import router as auth_router
from app.api.media import router as media_router
from app.api.proof import router as proof_router
from app.db import base  # noqa: F401
from app.db.session import engine
from app.models.base import Base
from app.models.user import User

app = FastAPI(title="Proof of First Capture MVP")
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(media_router)
app.include_router(proof_router)


@app.on_event("startup")
def startup_init_db():
    # MVP safeguard: ensure required tables exist even if Alembic wasn't run yet.
    Base.metadata.create_all(bind=engine)

    # Demo account for easy first login: email=1@1.lt password=1
    with Session(engine) as db:
        existing = db.scalar(select(User).where(User.email == "1@1.lt"))
        if not existing:
            db.add(User(email="1@1.lt", name="user1", password_hash=pwd_context.hash("1")))
        else:
            existing.password_hash = pwd_context.hash("1")
            existing.name = "user1"
        db.commit()


@app.get("/health")
def health():
    return {"ok": True}
