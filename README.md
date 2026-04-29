# Proof-of-First-Capture MVP

MVP sistema, kuri registruoja **first registered in our system** (ne „first on the internet“) media įrašus.

## Stack
- Frontend: React + Vite + Tailwind
- Backend: FastAPI + PostgreSQL + SQLAlchemy + Alembic
- Media: FFmpeg, OpenCV, imagehash, SHA-256
- Chrome extension: YouTube metadata + register mygtukas

## Paleidimas
```bash
docker compose up --build
```

Backend: http://localhost:8000
Frontend: http://localhost:5173

## Migracijos
```bash
docker compose exec backend alembic upgrade head
```

## API
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/media/upload`
- POST `/api/media/register-url`
- GET `/api/media/{id}`
- GET `/api/media/{id}/matches`
- GET `/api/proof/{slug}`

## Extension
1. Atidaryk `chrome://extensions`
2. Įjunk Developer mode
3. Load unpacked -> pasirink `extension/`
4. Atidaryk YouTube video ir spausk "Register this video"

## TODO
- C2PA / Content Credentials pasirašymo ir įrodymų grandinė.
- Stipresnis audio fingerprinting (pvz., chroma + locality sensitive hashing).
- Patikimesnis video similarity per keyframe embeddings.
