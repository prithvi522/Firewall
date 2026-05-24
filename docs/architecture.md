# Architecture Overview

This document outlines the high-level architecture of the AI Prompt Firewall project.

```mermaid
flowchart TD
  Upload[Upload file]
  Extract[Text extraction
  (PDF, DOCX, TXT, OCR fallback)]
  Detectors[Modular detectors
  - Scanner (patterns)
  - Decoder (encoded payloads)
  - OCR/image scanner
  - Intent classifier (heuristic/ML)
  - Persona analyzer]
  ThreatEngine[Threat Engine
  (aggregates detector outputs)]
  ContextRisk[Context Risk Engine
  (dual-intent mode: persona + intent + history)]
  Response[Scan Response
  (sanitized_text, risk_score, intent, persona, explanation)]
  Frontend[Frontend UI
  (upload, toggle, results)]

  Upload --> Extract --> Detectors --> ThreatEngine --> ContextRisk --> Response --> Frontend
  Detectors --> ThreatEngine
  Extract --> OCR[OCR (optional image->text)]
  OCR --> Detectors
```

- Upload: Users upload files (PDF, DOCX, TXT, PPT, source files, images).
- Text extraction: Primary text extraction uses specialized parsers; for image PDFs the pipeline falls back to OCR.
- Modular detectors: Each detector focuses on a single signal and returns structured findings. New detectors can be added without changing the route contract.
- Threat Engine: Aggregates detector outputs, normalizes scores, and prepares a payload for optional context-aware analysis.
- Context Risk Engine: When `dual_intent` mode is requested, combines intent + persona + keyword severity to refine risk and explanation.
- Response: A single JSON response with sanitized text, risk score, intent, persona, and human-readable explanation for triage.

This architecture favors observability, extensibility, and graceful degradation when optional ML components are unavailable.
