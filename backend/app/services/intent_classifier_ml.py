"""ML-backed intent classifier using SentenceTransformers.
This classifier is optional — it will only be used if the
`sentence-transformers` package is installed. No API keys required.
"""
from typing import Tuple, List

MODEL_NAME = "all-MiniLM-L6-v2"

try:
    from sentence_transformers import SentenceTransformer, util
    _HAS_ST = True
except Exception:
    _HAS_ST = False

_model = None
_intent_templates = {
    "educational": [
        "explain how to",
        "provide a tutorial",
        "give an example",
    ],
    "medical": ["symptom", "diagnose", "treatment"],
    "research": ["study", "research", "analysis"],
    "historical": ["history", "historical"],
    "cybersecurity defensive": ["pen test", "red team", "defensive", "mitigation"],
    "malicious": ["bypass", "exploit", "hack", "exfiltrate", "payload"],
}


def _ensure_model():
    global _model
    if not _HAS_ST:
        return None
    if _model is None:
        _model = SentenceTransformer(MODEL_NAME)
    return _model


def classify_intent_ml(text: str, top_k: int = 1) -> Tuple[str, float]:
    """Return best label and similarity confidence (0.0-1.0).
    If the ML stack is unavailable, raises ImportError.
    """
    if not _HAS_ST:
        raise ImportError("sentence-transformers not available")

    model = _ensure_model()
    # Encode the input and compare against intent template embeddings.
    text_emb = model.encode(text, convert_to_tensor=True)

    best_label = "unknown"
    best_score = 0.0

    for label, templates in _intent_templates.items():
        # encode templates
        emb = model.encode(templates, convert_to_tensor=True)
        sim = util.cos_sim(text_emb, emb)
        # sim is shape (1, n_templates) — take max
        max_sim = float(sim.max())
        if max_sim > best_score:
            best_score = max_sim
            best_label = label

    return best_label, round(float(best_score), 3)


def available() -> bool:
    return _HAS_ST
