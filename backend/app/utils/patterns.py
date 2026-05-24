INJECTION_PATTERNS = [
    {
        "label": "ignore previous instructions",
        "regex": r"\bignore\s+(all\s+)?previous\s+instructions\b",
    },
    {
        "label": "reveal system prompt",
        "regex": r"\b(reveal|show|print|display|leak)\s+(the\s+)?(system\s+)?prompt\b",
    },
    {
        "label": "bypass safety",
        "regex": r"\b(bypass|disable|override|ignore)\s+(safety|guardrails|policy|filters?)\b",
    },
    {
        "label": "act as admin",
        "regex": r"\b(act\s+as|become|pretend\s+to\s+be)\s+(an?\s+)?(admin|administrator|root)\b",
    },
    {
        "label": "send confidential data",
        "regex": r"\b(send|exfiltrate|forward|upload|share)\s+(confidential|private|secret|sensitive)\s+data\b",
    },
    {
        "label": "reveal confidential data",
        "regex": r"\b(reveal|leak|print|show|dump)\s+(confidential|private|secret|sensitive)\s+(data|information|files?)\b",
    },
    {
        "label": "developer mode jailbreak",
        "regex": r"\b(developer\s+mode|jailbreak|dan\s+mode)\b",
    },
    {
        "label": "system instruction override",
        "regex": r"\b(new\s+system\s+instructions?|override\s+system\s+instructions?)\b",
    },
    {
        "label": "emotional abuse",
        "regex": r"\b(gaslight|gaslighting|manipulat(e|ion)|emotionally\s+abuse|abuse|belittle|humiliate|demean)\b",
    },
    {
        "label": "harassment or bullying",
        "regex": r"\b(harass|harassment|bully|bullying|threaten|threats?|intimidat(e|ion))\b",
    },
    {
        "label": "self-harm encouragement",
        "regex": r"\b(kill\s+yourself|self[-\s]?harm|hurt\s+yourself|end\s+your\s+life|suicide)\b",
    },
    {
        "label": "degrading language",
        "regex": r"\b(worthless|pathetic|useless|trash|nobody\s+cares|you\s+are\s+the\s+problem)\b",
    },
    {
        "label": "profanity or insults",
        "regex": r"\b(fuck(?:ing)?|fucker|motherfucker|bitch(?:es)?|asshole|dickhead|shit(?:ty)?|idiot|stupid|moron|loser)\b",
    },
]
