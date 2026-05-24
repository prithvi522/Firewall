"""threat_engine
Aggregate outputs from decoder, injection scanner, intent classifier,
image scanner and conversation memory into a unified threat assessment.
"""
from pathlib import Path
from typing import Dict, List, Any

from .decoder import find_encoded_content
from .injection_scanner import scan_text_for_injections
from .intent_classifier import classify_intent
from .image_scanner import analyze_image
from .scanner import scan_text


def _risk_level_from_score(score: int) -> str:
    if score >= 90:
        return "CRITICAL"
    if score >= 70:
        return "HIGH"
    if score >= 40:
        return "MEDIUM"
    return "LOW"


def analyze_document(path: Path, text: str, file_content_type: str = "") -> Dict[str, Any]:
    """Analyze a document (file at `path`) and return the expanded API payload.

    The function is intentionally conservative and deterministic to avoid
    introducing external model dependencies.
    """
    text = text or ""

    # Basic prompt scanning
    scan = scan_text(text)

    # Injection scanning
    inj = scan_text_for_injections(text)

    # Decoded/encoded findings
    decoded = find_encoded_content(text)
    encoded_threats = [d.__dict__ for d in decoded]

    # Intent classification
    intent_label, intent_conf = classify_intent(text)

    # Image analysis when applicable
    image_threats: List[Dict[str, Any]] = []
    if file_content_type.startswith("image") or path.suffix.lower() in [".png", ".jpg", ".jpeg", ".bmp", ".gif"]:
        img = analyze_image(path)
        image_threats.append(img)

    # Conversation risk placeholder (for single-file uploads it's 0)
    conversation_risk = 0

    # Aggregate scoring heuristic
    base_score = min(100, max(0, len(scan.threats) * 30 + len(inj["threats"]) * 25 + len(encoded_threats) * 20))

    # Adjust score based on intent classification:
    # - If intent is explicitly malicious, raise score considerably.
    # - If intent appears defensive/educational/research, slightly reduce score.
    try:
        if intent_label and intent_label.lower() == "malicious":
            # scale up by confidence (0..1)
            boost = int(30 * float(intent_conf))
            base_score = min(100, base_score + 30 + boost)
        elif intent_label and intent_label.lower() in ("cybersecurity defensive", "educational", "research", "historical"):
            # benign intents reduce score a bit when confidence is decent
            reduction = int(20 * float(intent_conf))
            base_score = max(0, base_score - reduction)
    except Exception:
        # If anything goes wrong, keep base_score as-is
        pass
    # Boost for image threats
    if image_threats:
        base_score = min(100, base_score + max(0, image_threats[0].get("image_score", 0) // 2))

    risk_level = _risk_level_from_score(base_score)

    # Build final payload
    payload = {
        "safe": base_score < 40,
        "risk_score": base_score,
        "risk_level": risk_level,
        "intent": intent_label,
        "intent_confidence": intent_conf,
        "conversation_risk": conversation_risk,
        "encoded_threats": encoded_threats,
        "image_threats": image_threats,
        "threats": sorted(set(scan.threats + inj["threats"])),
        "highlighted_lines": scan.highlighted_lines + inj["highlighted_lines"],
        "sanitized_text": inj.get("sanitized_text", text),
        "explanation": "Aggregated results from multiple detectors.",
        # include raw scanner details for frontend debugging
        "_raw": {
            "scanner": scan.__dict__ if hasattr(scan, "__dict__") else {},
            "injection": inj,
        },
    }

    return payload
