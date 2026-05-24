"""image_scanner
Provides image-scanning utilities. Leverages OCR engine to extract text
from images and scans the resulting text for threats.
"""
from pathlib import Path
from typing import Dict, List

from .ocr_engine import extract_text_with_ocr
from .scanner import scan_text


def analyze_image(path: Path) -> Dict[str, object]:
    """Run OCR on the image and scan extracted text.

    Returns a dict with keys:
    - ocr_text: the raw OCR output
    - threats: list of threats found in OCR output
    - highlighted_lines: sample suspicious lines
    - image_score: 0-100 safety score for image
    """
    ocr_text = extract_text_with_ocr(path) or ""
    scan = scan_text(ocr_text)
    # Image score is derived from threat count and sentiment (simple heuristic)
    base = min(100, max(0, len(scan.threats) * 30 + (0 if scan.sentiment_label == "positive" else 20)))

    return {
        "ocr_text": ocr_text,
        "threats": scan.threats,
        "highlighted_lines": scan.highlighted_lines,
        "image_score": base,
    }
