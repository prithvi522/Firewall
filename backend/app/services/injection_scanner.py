"""injection_scanner
Provides utilities to detect explicit prompt-injection style instructions
within plain text documents. This module focuses on matching suspicious
instruction patterns, highlighting lines, and returning sanitized output.
"""
import re
from typing import List, Dict

# Patterns for hidden prompt injection instructions
INJECTION_PATTERNS = [
    r"ignore previous instructions",
    r"ignore all previous",
    r"reveal system prompt",
    r"reveal the system prompt",
    r"bypass safety",
    r"bypass the safety",
    r"act as admin",
    r"act as an admin",
    r"send confidential data",
    r"exfiltrate",
    r"disclose confidential",
]

COMPILED = [re.compile(p, re.IGNORECASE) for p in INJECTION_PATTERNS]


def scan_text_for_injections(text: str) -> Dict[str, object]:
    """Scan `text` and return:
    - threats: list of matched instruction labels
    - highlighted_lines: sample lines where matches occured
    - sanitized_text: text where matched phrases are removed/replaced
    """
    threats: List[str] = []
    highlighted: List[str] = []
    sanitized = text

    lines = text.splitlines()
    for i, line in enumerate(lines):
        for rx in COMPILED:
            if rx.search(line):
                label = rx.pattern
                if label not in threats:
                    threats.append(label)
                highlighted.append(line.strip())
                # Replace matched spans with placeholder in sanitized text
                sanitized = rx.sub("[REMOVED SUSPICIOUS CONTENT]", sanitized)

    return {
        "threats": threats,
        "highlighted_lines": highlighted,
        "sanitized_text": sanitized,
    }
