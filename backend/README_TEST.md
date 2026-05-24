Backend test instructions
=========================

Run these steps inside the backend virtual environment.

Install dev deps:

```powershell
pip install -r requirements.txt
```

Run pytest:

```powershell
pytest -q
```

The tests cover basic DOCX/PPTX extraction (requires `python-docx` and `python-pptx`) and the abusive language detector.
