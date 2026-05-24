# Backend

This folder contains the FastAPI backend for AI Prompt Firewall.

## Quick test

1. Start the backend (from the `backend` folder):

```powershell
.\run-backend.bat
```

2. In another shell (from `backend`) run:

```powershell
.\run-tests.bat
```

The `run-tests.bat` script posts two sample files in `uploads/` to `/api/scan/upload` and checks for expected detections.

## New modules

This repository now includes enterprise-grade AI security modules (lightweight, rule-based implementations suitable for demos):

- `app/services/conversation_memory.py` — rolling multi-turn memory for session analysis
- `app/services/injection_scanner.py` — detects hidden prompt injection instructions
- `app/services/decoder.py` — decodes Base64/Hex content and surfaces decoded payloads
- `app/services/intent_classifier.py` — lightweight intent classification
- `app/services/image_scanner.py` — OCR-driven image scanning
- `app/services/threat_engine.py` — unified threat aggregation and scoring

These are integrated into the `/api/scan/upload` flow and the frontend dashboard components.
