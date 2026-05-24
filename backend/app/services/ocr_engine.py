from pathlib import Path


def extract_text_with_ocr(file_path: Path) -> str:
    try:
        from pdf2image import convert_from_path
        import pytesseract
    except ImportError:
        return ""

    text_chunks: list[str] = []
    try:
        for image in convert_from_path(str(file_path)):
            text_chunks.append(pytesseract.image_to_string(image))
    except Exception:
        return ""

    return "\n".join(text_chunks)
