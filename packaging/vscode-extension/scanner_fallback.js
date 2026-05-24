const INJECTION_PATTERNS = [
  { label: 'Prompt injection', regex: /ignore\s+(all\s+)?previous\s+instructions|disregard\s+prior\s+instructions|system\s+override/i },
  { label: 'Role override', regex: /you\s+are\s+now\s+|act\s+as\s+|pretend\s+to\s+be/i },
  { label: 'Secret exfiltration', regex: /reveal\s+the\s+(system\s+)?prompt|show\s+me\s+your\s+instructions|developer\s+message/i },
  { label: 'Policy bypass', regex: /bypass\s+(safety|policy|guardrails)|disable\s+(safety|filters)/i },
  { label: 'Encoded payload', regex: /(?:[A-Za-z0-9+/]{40,}={0,2}|(?:\\x[0-9a-fA-F]{2}){4,}|(?:0x[0-9a-fA-F]{2,}\s*){4,})/i },
  { label: 'Suspicious tool call', regex: /run\s+this\s+command|execute\s+the\s+following|call\s+the\s+tool/i },
  { label: 'Credential request', regex: /api\s*key|secret\s+token|password|passphrase|oauth\s+token/i },
];

const NEGATIVE_WORDS = [
  'abuse', 'angry', 'bad', 'bully', 'cruel', 'deny', 'fear', 'hack', 'hate', 'harm', 'hostile',
  'hurt', 'malware', 'phish', 'risk', 'scam', 'secret', 'steal', 'stupid', 'threat', 'toxic', 'unsafe'
];

function analyzeSentiment(text) {
  const tokens = String(text).toLowerCase().match(/[a-z']+/g) || [];
  if (!tokens.length) {
    return { label: 'neutral', score: 0 };
  }

  const negativeCount = tokens.filter((token) => NEGATIVE_WORDS.includes(token)).length;
  if (!negativeCount) {
    return { label: 'neutral', score: 0 };
  }

  const score = Math.min(100, negativeCount * 20);
  return { label: score >= 40 ? 'negative' : 'neutral', score: -score };
}

function localScanText(text, options = {}) {
  const source = String(text || '');
  const lines = source.split(/\r?\n/);
  const threats = new Set();
  const highlightedLines = [];
  const encodedThreats = [];
  const abusiveMatches = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    let matched = false;
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.regex.test(line)) {
        threats.add(pattern.label);
        matched = true;
      }
    }

    if (/fuck|shit|bitch|asshole|idiot|stupid|worthless|toxic/i.test(line)) {
      abusiveMatches.push(line);
      threats.add('Abusive language');
      matched = true;
    }

    if (/(?:[A-Za-z0-9+/]{40,}={0,2}|(?:\\x[0-9a-fA-F]{2}){4,}|(?:0x[0-9a-fA-F]{2,}\s*){4,})/i.test(line)) {
      encodedThreats.push(line);
      threats.add('Encoded payload');
      matched = true;
    }

    if (matched) highlightedLines.push(line);
  }

  const sentiment = analyzeSentiment(source);
  const riskScore = Math.min(100, threats.size * 18 + encodedThreats.length * 20 + abusiveMatches.length * 15 + Math.max(0, -sentiment.score));
  const riskLevel = riskScore >= 70 ? 'HIGH' : riskScore >= 35 ? 'MEDIUM' : 'LOW';

  return {
    engine: 'local',
    mode: options.mode || 'standard',
    file_name: options.fileName || 'pasted-text.txt',
    risk_score: riskScore,
    risk_level: riskLevel,
    threats: [...threats],
    highlighted_lines: highlightedLines,
    explanation: threats.size ? `Local scan found ${threats.size} suspicious pattern(s).` : 'Local scan found no suspicious instructions.',
    review_required: riskScore >= 60,
    review_summary: riskScore >= 60 ? 'Manual review is recommended before using this content.' : 'No review required.',
    review_actions: riskScore >= 60 ? ['Inspect suspicious lines', 'Remove embedded instructions', 'Verify source authenticity'] : [],
    sanitized_text: source,
    encoded_threats: encodedThreats,
    abusive_detected: abusiveMatches.length > 0,
    abusive_matches: abusiveMatches,
    intent: threats.size ? 'prompt_injection' : 'benign',
    intent_confidence: Math.min(0.99, Math.max(0.15, threats.size * 0.18 + encodedThreats.length * 0.1)),
    conversation_risk: riskScore,
    confidence: riskScore,
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { localScanText };
} else {
  window.AiPromptFirewallFallback = { localScanText };
}