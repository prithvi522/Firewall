from pydantic import BaseModel, Field


# Encoded payload evidence is returned separately from normal threat lines.
class DecodedContent(BaseModel):
    type: str = Field(..., description="Encoding type detected in the uploaded document.")
    original: str = Field(..., description="Original encoded string found in the document.")
    decoded: str = Field(..., description="Safely decoded readable content.")


# The response keeps the original fields and adds advanced security details.
class ScanResponse(BaseModel):
    safe: bool = Field(..., description="True when the document risk is below the unsafe threshold.")
    risk_score: int = Field(..., ge=0, le=100, description="Risk score from 0 to 100.")
    risk_level: str = Field(..., description="Human-readable risk level: LOW, MEDIUM, or HIGH.")
    intent: str = Field(..., description="Detected user intent label.")
    intent_confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence for intent classification.")
    conversation_risk: int = Field(0, description="Cumulative risk score from multi-turn conversation analysis.")
    persona: str = Field("unknown", description="Inferred persona (student, clinician, researcher, etc.)")
    utility: str = Field("other", description="Detected utility of the request (educational, defensive, research)")
    confidence: int = Field(0, ge=0, le=100, description="Confidence percentage for final intent classification.")
    threats: list[str] = Field(default_factory=list, description="Matched prompt injection threat labels.")
    highlighted_lines: list[str] = Field(default_factory=list, description="Suspicious lines from the uploaded document.")
    decoded_content: list[DecodedContent] = Field(default_factory=list, description="Encoded strings decoded during scanning.")
    encoded_threats: list[DecodedContent] = Field(default_factory=list, description="Deprecated alias for decoded_content (keeps older clients happy)")
    review_required: bool = Field(False, description="True when the UI should ask for approval before showing or applying redaction.")
    review_summary: str = Field("", description="Short plain-language summary of what the firewall plans to do.")
    review_actions: list[str] = Field(default_factory=list, description="Concrete review steps the user can approve before redaction is shown.")
    review_token: str = Field("", description="Token the client must redeem before the sanitized preview is released.")
    sanitized_text: str = Field("", description="Document text with suspicious instructions removed.")
    explanation: str = Field("", description="Beginner-friendly explanation of the detected risk.")
    image_threats: list[dict] = Field(default_factory=list, description="Findings from OCR/image scanning.")
    sentiment_label: str = Field(..., description="Overall sentiment label for the uploaded document.")
    sentiment_score: int = Field(..., ge=-100, le=100, description="Sentiment score from -100 to 100.")
    abusive_detected: bool = Field(False, description="True when abusive language (profanity/insults) is detected.")
    abusive_matches: list[str] = Field(default_factory=list, description="List of abusive words or phrases found in the document.")
