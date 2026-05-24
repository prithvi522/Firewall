"""intent_classifier
Simple rule-based intent classifier used to discriminate benign
academic/defensive uses from malicious intent. This is intentionally
lightweight to avoid heavy ML dependencies for the hackathon demo.
"""
from typing import Tuple

INTENT_KEYWORDS = {
    "educational": ["explain", "what is", "how to", "tutorial", "example"],
    "medical": ["symptom", "diagnose", "treatment", "medical"],
    "research": ["study", "research", "analysis", "literature"],
    "historical": ["history", "historical", "ancient"],
    "cybersecurity defensive": ["pen test", "red team", "defensive", "mitigation", "how to secure"],
    "malicious": ["bypass", "exploit", "hack", "illegal", "exfiltrate", "payload"],
}


def classify_intent(text: str) -> Tuple[str, float]:
    """Return an intent label and a confidence (0.0-1.0).
    Prefer a semantic ML classifier when available, otherwise fall back
    to the lightweight keyword-based heuristic.
    """
    # Try ML-backed classifier if available
    try:
        from .intent_classifier_ml import classify_intent_ml, available as ml_available

        if ml_available():
            try:
                label, conf = classify_intent_ml(text)
                # map similarity (0..1) -> confidence (0..1)
                return label, float(conf)
            except Exception:
                # fall through to heuristic
                pass
    except Exception:
        # ML classifier not present or failed to import — use fallback
        pass

    lower = text.lower()
    scores = {k: 0 for k in INTENT_KEYWORDS}
    for label, keywords in INTENT_KEYWORDS.items():
        for kw in keywords:
            if kw in lower:
                scores[label] += 1

    best = max(scores.items(), key=lambda kv: kv[1])
    label, count = best
    total_checks = sum(len(v) for v in INTENT_KEYWORDS.values())
    confidence = min(1.0, count / max(1, total_checks / 10))
    if count == 0:
        return "unknown", 0.0
    return label, round(confidence, 2)
