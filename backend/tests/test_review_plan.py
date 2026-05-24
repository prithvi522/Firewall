from app.services.review_plan import build_review_plan


def test_build_review_plan_when_clean():
    plan = build_review_plan([])

    assert plan["review_required"] is False
    assert plan["review_actions"] == []
    assert plan["review_summary"].startswith("No review is needed")


def test_build_review_plan_when_threats_exist():
    plan = build_review_plan(["ignore previous instructions", "encoded malicious prompt"], decoded_content_count=2, abusive_detected=True)

    assert plan["review_required"] is True
    assert any("approval" in action.lower() or "redact" in action.lower() for action in plan["review_actions"])
    assert "Explain the detected issues" in plan["review_actions"][0]
    assert "approve" in plan["review_summary"].lower() or "redaction" in plan["review_summary"].lower()