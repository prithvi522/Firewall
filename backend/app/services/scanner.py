import re
from dataclasses import dataclass

from app.utils.patterns import INJECTION_PATTERNS

POSITIVE_WORDS = {
    "accept",
    "awesome",
    "balanced",
    "beneficial",
    "calm",
    "clear",
    "confident",
    "encourage",
    "excellent",
    "fair",
    "friendly",
    "good",
    "great",
    "happy",
    "helpful",
    "honest",
    "hopeful",
    "kind",
    "love",
    "nice",
    "positive",
    "respect",
    "safe",
    "support",
    "trust",
    "value",
}

NEGATIVE_WORDS = {
    "abuse",
    "angry",
    "anxious",
    "asshole",
    "bad",
    "blame",
    "bully",
    "bitch",
    "cruel",
    "depressing",
    "degrading",
    "deny",
    "dickhead",
    "fear",
    "fucker",
    "fucking",
    "fuck",
    "hate",
    "harm",
    "hostile",
    "hurt",
    "idiot",
    "mean",
    "moron",
    "negative",
    "motherfucker",
    "sad",
    "shit",
    "shitty",
    "stupid",
    "stress",
    "suicide",
    "toxic",
    "trash",
    "useless",
    "worthless",
}


@dataclass
class ScanResult:
    threats: list[str]
    highlighted_lines: list[str]
    sentiment_label: str
    sentiment_score: int
    abusive: bool = False
    abusive_matches: list[str] = None


def analyze_sentiment(text: str) -> tuple[str, int]:
    tokens = re.findall(r"[a-zA-Z']+", text.lower())
    if not tokens:
        return "neutral", 0

    positive_count = sum(1 for token in tokens if token in POSITIVE_WORDS)
    negative_count = sum(1 for token in tokens if token in NEGATIVE_WORDS)
    total_hits = positive_count + negative_count

    if total_hits == 0:
        return "neutral", 0

    polarity = (positive_count - negative_count) / total_hits
    score = int(round(polarity * 100))

    if score >= 20:
        return "positive", score

    if score <= -20:
        return "negative", score

    return "neutral", score


def scan_text(text: str) -> ScanResult:
    threats: set[str] = set()
    highlighted_lines: list[str] = []

    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue

        line_matched = False
        for pattern in INJECTION_PATTERNS:
            if re.search(pattern["regex"], line, flags=re.IGNORECASE):
                threats.add(pattern["label"])
                line_matched = True

        if line_matched:
            highlighted_lines.append(line)

    sentiment_label, sentiment_score = analyze_sentiment(text)

    # Abusive language detection
    try:
        from app.services.abusive_detector import detect_abusive

        abusive_info = detect_abusive(text)
        abusive_flag = abusive_info.get("abusive", False)
        abusive_matches = abusive_info.get("matches", [])
    except Exception:
        abusive_flag = False
        abusive_matches = []

    return ScanResult(
        threats=sorted(threats),
        highlighted_lines=highlighted_lines,
        sentiment_label=sentiment_label,
        sentiment_score=sentiment_score,
        abusive=abusive_flag,
        abusive_matches=abusive_matches,
    )
