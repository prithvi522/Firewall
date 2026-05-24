from pathlib import Path
import tempfile

import app.services.review_store as review_store
from app.services.review_store import approve_review, create_pending_review


def test_pending_review_round_trip():
    original_store_path = review_store.STORE_PATH
    original_cache = dict(review_store._PENDING_REVIEWS)

    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            review_store.STORE_PATH = Path(temp_dir) / "review_store.json"
            review_store._PENDING_REVIEWS = {}

            token = create_pending_review("cleaned text", "summary", ["step 1", "step 2"])

            # Simulate a restart by clearing memory but leaving the JSON store intact.
            review_store._PENDING_REVIEWS = {}

            pending = approve_review(token)
            assert pending is not None
            assert pending.sanitized_text == "cleaned text"
            assert pending.review_summary == "summary"
            assert pending.review_actions == ["step 1", "step 2"]
    finally:
        review_store.STORE_PATH = original_store_path
        review_store._PENDING_REVIEWS = original_cache


def test_pending_review_is_single_use():
    original_store_path = review_store.STORE_PATH
    original_cache = dict(review_store._PENDING_REVIEWS)

    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            review_store.STORE_PATH = Path(temp_dir) / "review_store.json"
            review_store._PENDING_REVIEWS = {}

            token = create_pending_review("cleaned text", "summary", [])

            assert approve_review(token) is not None
            assert approve_review(token) is None
    finally:
        review_store.STORE_PATH = original_store_path
        review_store._PENDING_REVIEWS = original_cache