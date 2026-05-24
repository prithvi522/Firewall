import React from "react";

export default function OCRViewer({ ocr = "" }) {
  return (
    <div className="rounded-lg border border-slate-700 p-3 bg-slate-800">
      <h4 className="font-semibold">OCR Preview</h4>
      <pre className="mt-2 text-sm bg-slate-900 p-2 rounded overflow-auto">{ocr || "No OCR text"}</pre>
    </div>
  );
}
