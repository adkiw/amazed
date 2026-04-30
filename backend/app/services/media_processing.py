from pathlib import Path

import cv2
import imagehash
from PIL import Image


def compute_image_phash(path: Path) -> str | None:
    try:
        with Image.open(path) as img:
            return str(imagehash.phash(img))
    except Exception:
        return None


def extract_video_frame_hashes(path: Path, frame_count: int = 5) -> list[str]:
    cap = cv2.VideoCapture(str(path))
    if not cap.isOpened():
        return []
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or frame_count
    step = max(total // frame_count, 1)
    hashes: list[str] = []
    for i in range(frame_count):
        cap.set(cv2.CAP_PROP_POS_FRAMES, i * step)
        ok, frame = cap.read()
        if not ok:
            continue
        pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        hashes.append(str(imagehash.phash(pil)))
    cap.release()
    return hashes


def audio_fingerprint_stub(path: Path) -> str:
    # TODO: Replace with robust spectral fingerprinting + C2PA evidence chain hooks.
    return f"mvp-audio-{path.stat().st_size}"
