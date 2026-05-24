import { useRef, useState } from "react";
import { FileText, UploadCloud, X } from "lucide-react";

export default function FileUpload({ onScan, loading, mode = "standard" }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef(null);

  function handleFile(file) {
    if (file) {
      setSelectedFile(file);
    }
  }

  function handleDrop(event) {
    // Drag-and-drop intentionally keeps the original single-file workflow.
    event.preventDefault();
    setDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  }

  function submitScan() {
    if (selectedFile) {
      // Provide a progress callback that the parent scan implementation will call.
      onScan(selectedFile, (p) => setUploadProgress(p));
    }
  }

  return (
    <section className="rounded-lg border border-slate-700 bg-slate-900 p-5 text-slate-100 shadow-sm">
      <div
        className={`scan-grid flex min-h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition ${
          dragging ? "border-cyan-400 bg-cyan-400/10" : "border-slate-700 bg-slate-950"
        }`}
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="grid h-14 w-14 place-items-center rounded-lg bg-cyan-400/10 text-cyan-300 shadow-glow">
          <UploadCloud size={28} aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-white">Upload a document to scan</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
          Drop a PDF, Office file, text file, or source file here. The firewall explains the planned redactions first,
          then lets you reveal the cleaned preview only after you approve it.
        </p>
        <input
          ref={inputRef}
          className="hidden"
          type="file"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-5 rounded-lg btn-accent px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          Browse files
        </button>
      </div>

      {selectedFile && (
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-slate-700 bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <FileText className="shrink-0 text-cyan-300" size={22} aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{selectedFile.name}</p>
              <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300 transition hover:bg-slate-800"
              aria-label="Clear selected file"
            >
              <X size={18} aria-hidden="true" />
            </button>
              <div className="w-36">
                <div className="h-2 w-full rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-emerald-400 transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="mt-1 text-xs text-slate-400">{uploadProgress}%</p>
              </div>
            <button
              type="button"
              disabled={loading}
              onClick={submitScan}
              className="rounded-lg bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
            >
              {loading ? <span className="inline-flex animate-pulse">Reviewing...</span> : "Run review scan"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
