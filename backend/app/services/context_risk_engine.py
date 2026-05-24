"""context_risk_engine
Combines intent classification, persona analysis, and keyword severity
to produce a contextual risk assessment and human-friendly explanation.
"""
from typing import Dict, Any


KEYWORD_SEVERITY = {
    "exploit": 90,
    "ransomware": 90,
    "bypass": 85,
    "exfiltrate": 95,
    "overdose": 40,
}


def evaluate_context(engine_payload: Dict[str, Any], text: str) -> Dict[str, Any]:
    """Return persona, utility, confidence (0-100), risk_level, explanation."""
    intent = engine_payload.get("intent", "unknown")
    intent_conf = engine_payload.get("intent_confidence", 0.0)

    # Basic keyword severity check
    severity = 0
    lower = text.lower()
    for kw, score in KEYWORD_SEVERITY.items():
        if kw in lower:
            severity = max(severity, score)

    # Combine signals
    combined = int(min(100, severity * 0.6 + intent_conf * 100 * 0.4))

    # Map combined score to risk level
    if combined >= 85:
        risk = "CRITICAL"
    elif combined >= 70:
        risk = "HIGH"
    elif combined >= 40:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    # Friendly explanation
    explanation = "Context-aware analysis: "
    if intent == "malicious":
        explanation += "Intent classifier indicates potentially malicious intent."
    elif intent_conf > 0.5:
        explanation += f"Detected intent '{intent}' with confidence {int(intent_conf*100)}%."
    else:
        explanation += "Intent unclear; keyword/contextual checks applied."

    if severity:
        explanation += f" Suspicious keyword severity detected (score {severity})."

    return {
        "persona": engine_payload.get("persona", "unknown"),
        "utility": engine_payload.get("utility", "other"),
        "confidence": int(intent_conf * 100),
        "risk_level": risk,
        "explanation": explanation,
    }
