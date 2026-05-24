from app.services.abusive_detector import detect_abusive


def test_detect_abusive_simple():
    text = "You are an idiot and a bitch"
    result = detect_abusive(text)
    assert result["abusive"] is True
    assert "idiot" in [m.lower() for m in result["matches"]]


def test_detect_abusive_none():
    text = "This is a friendly message with no insults"
    result = detect_abusive(text)
    assert result["abusive"] is False
    assert result["matches"] == []
*** End Patch