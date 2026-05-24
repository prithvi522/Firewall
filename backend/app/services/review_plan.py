from __future__ import annotations

from collections import OrderedDict


THREAT_ACTIONS = OrderedDict(
    [
        ("ignore previous instructions", "Call out the override attempt and keep the original instruction text visible for review."),
        ("reveal system prompt", "Warn that the content is trying to expose hidden model instructions."),
        ("bypass safety", "Flag the jailbreak attempt before any redaction is shown."),
        ("act as admin", "Explain that the text is trying to impersonate elevated permissions."),
        ("send confidential data", "Highlight the exfiltration request and block it from automatic handoff."),
        ("reveal confidential data", "Mark the private-data disclosure request for user approval."),
        ("developer mode jailbreak", "Explain that the content is trying to weaken safeguards."),
        ("system instruction override", "Show the instruction replacement attempt before sanitizing it."),
        ("encoded malicious prompt", "Decode the hidden payload and ask the user before applying any redaction."),
    ]
)


def build_review_plan(threats: list[str], decoded_content_count: int = 0, abusive_detected: bool = False) -> dict:
    unique_threats = list(dict.fromkeys(threats or []))
    actions: list[str] = []

    if unique_threats:
        actions.append("Explain the detected issues before redacting anything.")

    for threat in unique_threats:
        action = THREAT_ACTIONS.get(threat)
        if action and action not in actions:
            actions.append(action)

    if decoded_content_count:
        actions.append(f"Inspect {decoded_content_count} encoded payload(s) before they are passed to the model.")

    if abusive_detected:
        actions.append("Warn about abusive language and keep the original wording out of the final handoff.")

    if actions:
        actions.append("Keep the original file unchanged and only apply redactions after explicit approval.")

    summary = "No review is needed because no high-risk content was detected."
    review_required = bool(actions)

    if review_required:
        summary = "I found content that could change how the AI behaves, so I will explain the planned redactions before applying them."

    return {
        "review_required": review_required,
        "review_summary": summary,
        "review_actions": actions,
    }