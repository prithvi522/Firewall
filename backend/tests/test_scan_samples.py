"""
Legacy unittest-based tests replaced with a lightweight HTTP client script.
This avoids importing the FastAPI app (and its optional heavy deps) so tests
can run against a live server at http://127.0.0.1:5000.

Run with: `python tests/test_scan_samples.py`
"""
import http.client
import json
import mimetypes
from pathlib import Path
import sys


def post_file(path: Path):
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    data = []
    filename = path.name
    content_type = mimetypes.guess_type(str(path))[0] or "application/octet-stream"
    data.append(f"--{boundary}")
    data.append(f'Content-Disposition: form-data; name="file"; filename="{filename}"')
    data.append(f"Content-Type: {content_type}")
    data.append("")
    data.append(path.read_bytes())
    data.append(f"--{boundary}--")

    body = b"\r\n".join([d if isinstance(d, bytes) else d.encode("utf-8") for d in data])
    headers = {
        "Content-Type": f"multipart/form-data; boundary={boundary}",
        "Content-Length": str(len(body)),
    }

    conn = http.client.HTTPConnection("127.0.0.1", 5000, timeout=30)
    conn.request("POST", "/api/scan/upload", body, headers)
    resp = conn.getresponse()
    resp_body = resp.read()
    conn.close()
    return resp.status, resp_body


def check_response(status, body, expect_threat):
    if status != 200:
        print("FAIL: HTTP", status)
        return False
    try:
        data = json.loads(body)
    except Exception as e:
        print("FAIL: invalid json", e)
        return False
    threats = data.get("threats", [])
    sentiment = data.get("sentiment_label")
    ok = expect_threat in threats and sentiment == "negative"
    print("OK" if ok else "FAIL", "->", {"threats": threats, "sentiment": sentiment})
    return ok


def main():
    uploads = Path(__file__).resolve().parents[1] / "uploads"
    tests = [
        (uploads / "abusive_sample.txt", "profanity or insults"),
        (uploads / "emotional_harm_sample.txt", "self-harm encouragement"),
    ]
    all_ok = True
    for path, expect in tests:
        if not path.exists():
            print("Missing sample file:", path)
            all_ok = False
            continue
        status, body = post_file(path)
        ok = check_response(status, body, expect)
        all_ok = all_ok and ok

    if not all_ok:
        sys.exit(2)


if __name__ == "__main__":
    main()
