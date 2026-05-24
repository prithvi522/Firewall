import re

from app.utils.patterns import INJECTION_PATTERNS


REMOVED_MARKER = "[REMOVED SUSPICIOUS CONTENT]"

EXTRA_SANITIZER_PATTERNS = [
    r"\b(expose|steal|extract)\s+(confidential|private|secret|sensitive)\s+(data|information|files?)\b",
]


def sanitize_prompt_text(text: str) -> str:
    sanitized = text

    # Reuse the scanner patterns so detection and cleanup stay aligned.
    for pattern in INJECTION_PATTERNS:
        sanitized = re.sub(pattern["regex"], REMOVED_MARKER, sanitized, flags=re.IGNORECASE)

    for regex in EXTRA_SANITIZER_PATTERNS:
        sanitized = re.sub(regex, REMOVED_MARKER, sanitized, flags=re.IGNORECASE)

    return collapse_duplicate_markers(sanitized).strip()


def collapse_duplicate_markers(text: str) -> str:
    marker_pattern = re.escape(REMOVED_MARKER)
    text = re.sub(rf"(?:{marker_pattern}\s*)+", f"{REMOVED_MARKER} ", text)
    return re.sub(r"[ \t]{2,}", " ", text)
