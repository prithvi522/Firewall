from pathlib import Path
from uuid import uuid4


def save_upload_file(upload_dir: Path, filename: str, content: bytes) -> Path:
    upload_dir.mkdir(parents=True, exist_ok=True)
    safe_name = Path(filename).name.replace(" ", "_")
    saved_path = upload_dir / f"{uuid4().hex}_{safe_name}"
    saved_path.write_bytes(content)
    return saved_path
