from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.models.response_model import ScanResponse
from app.services.decoder import find_encoded_content
from app.services.pdf_parser import extract_text_from_file, read_text_best_effort
from app.services.risk_engine import build_explanation, build_scan_response
from app.services.review_plan import build_review_plan
from app.services.review_store import approve_review, create_pending_review
from app.services.sanitizer import sanitize_prompt_text
from app.services.scanner import ScanResult, scan_text
from app.services.threat_engine import analyze_document
from app.services.persona_analyzer import analyze_persona
from app.services.context_risk_engine import evaluate_context
from app.services.intent_classifier_ml import available as _ml_available, MODEL_NAME as ML_MODEL_NAME
from app.utils.helpers import save_upload_file

router = APIRouter()

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
MAX_FILE_SIZE = 10 * 1024 * 1024


@router.post("/review/approve")
async def approve_sanitized_preview(review_token: str = Form(...)):
    pending_review = approve_review(review_token)
    if not pending_review:
        raise HTTPException(status_code=404, detail="Review token was not found or already used.")

    return {
        "review_approved": True,
        "sanitized_text": pending_review.sanitized_text,
        "review_summary": pending_review.review_summary,
        "review_actions": pending_review.review_actions,
    }


@router.post("/upload", response_model=ScanResponse)
async def upload_and_scan(file: UploadFile = File(...), mode: str = Form("standard"), engine: str = Form("auto")):
    if not file.filename:
        raise HTTPException(status_code=400, detail="A file name is required.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File is too large. Maximum size is 10 MB.")

    saved_path = save_upload_file(UPLOAD_DIR, file.filename, content)

    try:
        # Text extraction is isolated so additional parsers can be added without changing the route.
        document_text = extract_text_from_file(saved_path, content_type=file.content_type)
    except Exception:
        # Keep the scan flow non-blocking for unsupported, damaged, or binary-only files.
        document_text = read_text_best_effort(saved_path)

    document_text = document_text or ""

    # Use the unified threat engine to produce advanced analysis while keeping
    # the previous flow compatible. The engine returns an aggregated payload
    # that we translate into the ScanResponse model.
    engine_payload = analyze_document(saved_path, document_text, file.content_type or "")

    # record the engine preference for observability (auto, heuristic, ml)
    engine_payload["engine"] = engine or "auto"

    # Persona analysis for dual-intent flow
    persona, utility, persona_risk = analyze_persona(document_text)
    engine_payload["persona"] = persona
    engine_payload["utility"] = utility

    # If the client requested dual-intent analysis, refine risk and explanation
    if mode and mode.lower() in ("dual", "dual_intent", "intent"):
        cr = evaluate_context(engine_payload, document_text)
        # merge context risk outputs
        engine_payload.update(cr)

    # decoded_content is still provided by the decoder helper for backward compatibility
    decoded_content = find_encoded_content(document_text)
    decoded_list = [item.__dict__ for item in decoded_content]

    # Build a ScanResult by running the lightweight scanner once and merging engine outputs.
    scanned = scan_text(document_text)
    combined_result = ScanResult(
        threats=engine_payload.get("threats", scanned.threats),
        highlighted_lines=engine_payload.get("highlighted_lines", scanned.highlighted_lines),
        sentiment_label=getattr(scanned, "sentiment_label", "neutral"),
        sentiment_score=getattr(scanned, "sentiment_score", 0),
        abusive=getattr(scanned, "abusive", False),
        abusive_matches=getattr(scanned, "abusive_matches", []) or [],
    )
    review_plan = build_review_plan(combined_result.threats, len(decoded_content), combined_result.abusive)

    # Sanitize using existing sanitizer for presentation
    sanitized_text = engine_payload.get("sanitized_text", sanitize_prompt_text(document_text))
    review_token = ""

    if review_plan["review_required"]:
        review_token = create_pending_review(sanitized_text, review_plan["review_summary"], review_plan["review_actions"])
        sanitized_text = ""

    response = build_scan_response(
        combined_result,
        decoded_content=decoded_list,
        sanitized_text=sanitized_text,
        explanation=engine_payload.get("explanation", build_explanation(combined_result.threats, len(decoded_content))),
        review_required=review_plan["review_required"],
        review_summary=review_plan["review_summary"],
        review_actions=review_plan["review_actions"],
        review_token=review_token,
    )

    # Augment the old response model with the new engine fields
    response_dict = response.dict()
    response_dict.update(
        {
            "intent": engine_payload.get("intent", "unknown"),
            "intent_confidence": engine_payload.get("intent_confidence", 0.0),
            "conversation_risk": engine_payload.get("conversation_risk", 0),
            "encoded_threats": engine_payload.get("encoded_threats", []),
            "image_threats": engine_payload.get("image_threats", []),
            "persona": engine_payload.get("persona", "unknown"),
            "utility": engine_payload.get("utility", "other"),
            "confidence": engine_payload.get("confidence", int(engine_payload.get("intent_confidence", 0.0) * 100)),
            "risk_level": engine_payload.get("risk_level", response_dict.get("risk_level")),
            "explanation": engine_payload.get("explanation", response_dict.get("explanation")),
            "engine": engine_payload.get("engine", "auto"),
            "abusive_detected": combined_result.abusive,
            "abusive_matches": combined_result.abusive_matches,
            "review_required": review_plan["review_required"],
            "review_summary": review_plan["review_summary"],
            "review_actions": review_plan["review_actions"],
            "review_token": review_token,
        }
    )

    return response_dict


@router.get("/ml_status")
def ml_status():
    """Return whether the optional ML intent classifier is available and the model name."""
    available = bool(_ml_available())
    return {"ml_available": available, "model": ML_MODEL_NAME if available else None}
