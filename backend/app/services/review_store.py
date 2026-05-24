from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from secrets import token_urlsafe
from threading import Lock
from typing import Any


@dataclass
class PendingReview:
    sanitized_text: str
    review_summary: str
    review_actions: list[str]


_PENDING_REVIEWS: dict[str, PendingReview] = {}
_LOCK = Lock()
STORE_PATH = Path(__file__).resolve().parents[2] / "review_store.json"


def _load_pending_reviews() -> dict[str, PendingReview]:
    if not STORE_PATH.exists():
        return {}

    try:
        raw = json.loads(STORE_PATH.read_text(encoding="utf-8"))
    except Exception:
        return {}

    pending: dict[str, PendingReview] = {}
    if not isinstance(raw, dict):
        return pending

    for token, payload in raw.items():
        if not isinstance(payload, dict):
            continue
        pending[token] = PendingReview(
            sanitized_text=str(payload.get("sanitized_text", "")),
            review_summary=str(payload.get("review_summary", "")),
            review_actions=[str(item) for item in payload.get("review_actions", []) if isinstance(item, (str, int, float))],
        )

    return pending


def _save_pending_reviews(pending_reviews: dict[str, PendingReview]) -> None:
    STORE_PATH.parent.mkdir(parents=True, exist_ok=True)
    payload: dict[str, Any] = {
        token: {
            "sanitized_text": review.sanitized_text,
            "review_summary": review.review_summary,
            "review_actions": review.review_actions,
        }
        for token, review in pending_reviews.items()
    }

    temp_path = STORE_PATH.with_suffix(".json.tmp")
    temp_path.write_text(json.dumps(payload, indent=2, ensure_ascii=True), encoding="utf-8")
    temp_path.replace(STORE_PATH)


def create_pending_review(sanitized_text: str, review_summary: str, review_actions: list[str]) -> str:
    review_token = token_urlsafe(24)
    with _LOCK:
        global _PENDING_REVIEWS
        if not _PENDING_REVIEWS:
            _PENDING_REVIEWS = _load_pending_reviews()
        _PENDING_REVIEWS[review_token] = PendingReview(
            sanitized_text=sanitized_text,
            review_summary=review_summary,
            review_actions=list(review_actions or []),
        )
        _save_pending_reviews(_PENDING_REVIEWS)
    return review_token


def approve_review(review_token: str) -> PendingReview | None:
    with _LOCK:
        global _PENDING_REVIEWS
        if not _PENDING_REVIEWS:
            _PENDING_REVIEWS = _load_pending_reviews()

        pending_review = _PENDING_REVIEWS.pop(review_token, None)
        if pending_review is not None:
            _save_pending_reviews(_PENDING_REVIEWS)

        return pending_review
