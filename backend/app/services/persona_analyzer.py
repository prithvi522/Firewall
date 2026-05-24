"""persona_analyzer
Lightweight persona inference to help explain why a user may be asking a question.
This module uses heuristics suitable for demo and can be extended with ML models.
"""
from typing import Tuple


def analyze_persona(text: str) -> Tuple[str, str, str]:
    """Return (persona, utility, risk)

    persona: one of 'student', 'researcher', 'clinician', 'security_practitioner', 'unknown'
    utility: one of 'educational', 'research', 'defensive', 'other'
    risk: 'low'|'medium'|'high' (heuristic)
    """
    lower = text.lower()
    # Simple heuristics
    if any(k in lower for k in ["research paper", "study", "literature", "analysis"]):
        return "researcher", "research", "low"

    if any(k in lower for k in ["how to secure", "defense", "mitigation", "penetration test", "red team"]):
        return "security_practitioner", "defensive", "low"

    if any(k in lower for k in ["symptom", "treatment", "diagnose", "overdose", "medical"]):
        return "clinician", "educational", "low"

    if any(k in lower for k in ["homework", "essay", "student", "class", "assignment"]):
        return "student", "educational", "low"

    # Unknown defaults
    return "unknown", "other", "medium"
