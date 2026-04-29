from fastapi import FastAPI

from app.api.auth import router as auth_router
from app.api.media import router as media_router
from app.api.proof import router as proof_router

app = FastAPI(title="Proof of First Capture MVP")
app.include_router(auth_router)
app.include_router(media_router)
app.include_router(proof_router)


@app.get("/health")
def health():
    return {"ok": True}
