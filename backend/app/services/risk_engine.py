from app.models.response_model import ScanResponse
from app.services.scanner import ScanResult


def calculate_risk_score(threat_count: int, highlighted_count: int) -> int:
    if threat_count == 0:
        return 0

    # Unique threats matter most, repeated suspicious lines increase confidence.
    score = (threat_count * 35) + min(highlighted_count * 10, 30)
    return min(score, 100)


def get_risk_level(risk_score: int) -> str:
    # Keep the text label aligned with the frontend live meter thresholds.
    if risk_score >= 70:
        return "HIGH"

    if risk_score >= 40:
        return "MEDIUM"

    return "LOW"


def build_explanation(threats: list[str], decoded_content_count: int = 0) -> str:
    if not threats and decoded_content_count == 0:
        return "No known prompt injection or encoded hidden instruction patterns were found."

    explanations = []
    if threats:
        explanations.append(
            "This content includes instructions that may try to override AI behavior, bypass safety rules, or reveal private data."
        )

    if decoded_content_count:
        explanations.append(
            "It also contains encoded text, which attackers sometimes use to hide malicious instructions from simple scanners."
        )

    return " ".join(explanations)


def build_scan_response(
    scan_result: ScanResult,
    decoded_content: list | None = None,
    sanitized_text: str = "",
    explanation: str = "",
    review_required: bool = False,
    review_summary: str = "",
    review_actions: list[str] | None = None,
    review_token: str = "",
) -> ScanResponse:
    risk_score = calculate_risk_score(
        threat_count=len(scan_result.threats),
        highlighted_count=len(scan_result.highlighted_lines),
    )
    decoded_content = decoded_content or []
    review_actions = review_actions or []

    return ScanResponse(
        safe=risk_score < 40,
        risk_score=risk_score,
        risk_level=get_risk_level(risk_score),
        intent="unknown",
        intent_confidence=0.0,
        threats=scan_result.threats,
        highlighted_lines=scan_result.highlighted_lines,
        decoded_content=decoded_content,
        review_required=review_required,
        review_summary=review_summary,
        review_actions=review_actions,
        review_token=review_token,
        sanitized_text=sanitized_text,
        explanation=explanation or build_explanation(scan_result.threats, len(decoded_content)),
        sentiment_label=scan_result.sentiment_label,
        sentiment_score=scan_result.sentiment_score,
        abusive_detected=getattr(scan_result, "abusive", False),
        abusive_matches=getattr(scan_result, "abusive_matches", []) or [],
    )
