from pathlib import Path
import sys
import site

if __name__ == "__main__" and __package__ is None:
    project_root = Path(__file__).resolve().parents[1]
    venv_site_packages = project_root / ".venv" / "Lib" / "site-packages"

    if venv_site_packages.exists():
        site.addsitedir(str(venv_site_packages))

    sys.path.insert(0, str(project_root))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import socket
import os
from datetime import datetime

from app.routes.scan import router as scan_router

app = FastAPI(
    title="AI Prompt Firewall API",
    description="Scans uploaded documents for prompt injection and malicious AI instructions.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan_router, prefix="/api/scan", tags=["scan"])


@app.get("/")
def root():
    return {"message": "AI Prompt Firewall API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


def _find_free_port(start: int = 5000, end: int = 5100) -> int:
    for p in range(start, end + 1):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("0.0.0.0", p))
                return p
            except OSError:
                continue
    return 0


if __name__ == "__main__":
    # Allow overriding preferred port via environment variable APP_PORT
    try:
        preferred = int(os.environ.get("APP_PORT", "5000"))
    except ValueError:
        preferred = 5000

    def _log_chosen_port(port: int):
        try:
            log_path = Path(__file__).resolve().parents[1] / "last_port.log"
            with open(log_path, "a", encoding="utf-8") as fh:
                fh.write(f"{datetime.utcnow().isoformat()}Z chosen_port={port}\n")
        except Exception:
            pass

    selected_port = preferred if _find_free_port(preferred, preferred) == preferred else _find_free_port(preferred, preferred + 100)
    if not selected_port:
        raise RuntimeError(f"No free port found starting at {preferred}")

    if selected_port != preferred:
        print(f"Port {preferred} busy — falling back to {selected_port}")

    _log_chosen_port(selected_port)
    uvicorn.run("app.main:app", host="0.0.0.0", port=selected_port, reload=False)

    
