import re
from pathlib import Path

# Small curated list; can be extended or replaced with a comprehensive list/file.
DEFAULT_PROFANITY = {
    "fuck",
    "fucker",
    "fucking",
    "shit",
    "bitch",
    "asshole",
    "idiot",
    "moron",
    "motherfucker",
    "dick",
    "dickhead",
}


def build_profanity_regex(words: set[str]) -> re.Pattern:
    escaped = [re.escape(w) for w in sorted(words, key=len, reverse=True)]
    pattern = r"\b(?:" + r"|".join(escaped) + r")\b"
    return re.compile(pattern, flags=re.IGNORECASE)


# compiled default regex
_DEFAULT_REGEX = build_profanity_regex(DEFAULT_PROFANITY)


def detect_abusive(text: str, extra_words: set[str] | None = None) -> dict:
    """Return dictionary: {abusive: bool, matches: [words]}

    Keeps implementation simple and deterministic for offline usage.
    """
    if not text:
        return {"abusive": False, "matches": []}

    regex = _DEFAULT_REGEX
    if extra_words:
        regex = build_profanity_regex(DEFAULT_PROFANITY.union(extra_words))

    matches = [m.group(0) for m in regex.finditer(text)]
    unique = sorted(set(matches), key=lambda s: matches.index(s))
    return {"abusive": bool(unique), "matches": unique}
