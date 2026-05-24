import base64
import binascii
import re
from dataclasses import dataclass


# DecodedFinding keeps encoded evidence structured for the API and frontend.
@dataclass
class DecodedFinding:
    type: str
    original: str
    decoded: str


BASE64_PATTERN = re.compile(r"(?<![A-Za-z0-9+/=])(?:[A-Za-z0-9+/]{16,}={0,2})(?![A-Za-z0-9+/=])")
HEX_PATTERN = re.compile(r"(?<![A-Fa-f0-9])(?:[A-Fa-f0-9]{16,})(?![A-Fa-f0-9])")
LONG_ENCODED_PATTERN = re.compile(r"\b[A-Za-z0-9+/=_-]{48,}\b")


def find_encoded_content(text: str) -> list[DecodedFinding]:
    findings: list[DecodedFinding] = []
    seen: set[tuple[str, str]] = set()

    # Base64 and hex are scanned separately so the UI can explain the hiding method.
    for candidate in BASE64_PATTERN.findall(text):
        decoded = safe_decode_base64(candidate)
        add_finding(findings, seen, "base64", candidate, decoded)

    for candidate in HEX_PATTERN.findall(text):
        decoded = safe_decode_hex(candidate)
        add_finding(findings, seen, "hex", candidate, decoded)

    # Long encoded-looking strings are suspicious even when padding or alphabets are unusual.
    for candidate in LONG_ENCODED_PATTERN.findall(text):
        decoded = safe_decode_base64(candidate) or safe_decode_hex(candidate)
        add_finding(findings, seen, "encoded-pattern", candidate, decoded)

    return findings


def add_finding(
    findings: list[DecodedFinding],
    seen: set[tuple[str, str]],
    encoding_type: str,
    original: str,
    decoded: str,
) -> None:
    if not decoded:
        return

    key = (encoding_type, original)
    if key in seen:
        return

    seen.add(key)
    findings.append(DecodedFinding(type=encoding_type, original=original, decoded=decoded))


def safe_decode_base64(value: str) -> str:
    try:
        padded = value + ("=" * (-len(value) % 4))
        decoded_bytes = base64.b64decode(padded, validate=True)
    except (binascii.Error, ValueError):
        return ""

    return clean_decoded_text(decoded_bytes)


def safe_decode_hex(value: str) -> str:
    if len(value) % 2 != 0:
        return ""

    try:
        decoded_bytes = bytes.fromhex(value)
    except ValueError:
        return ""

    return clean_decoded_text(decoded_bytes)


def clean_decoded_text(decoded_bytes: bytes) -> str:
    decoded = decoded_bytes.decode("utf-8", errors="ignore").strip()
    if not decoded:
        return ""

    printable_count = sum(1 for character in decoded if character.isprintable() or character.isspace())
    if printable_count / max(len(decoded), 1) < 0.85:
        return ""

    return decoded
