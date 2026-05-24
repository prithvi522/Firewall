import { useState, useEffect } from "react";
import { Activity, FileSearch, LockKeyhole } from "lucide-react";
import FileUpload from "../components/FileUpload.jsx";
import Navbar from "../components/Navbar.jsx";
import ResultPanel from "../components/ResultPanel.jsx";
import { scanFile, mlStatus } from "../services/api.js";

export default function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [mode, setMode] = useState("standard");
  const [mlAvailable, setMlAvailable] = useState(false);
  const [engineMode, setEngineMode] = useState("auto");
  const [uploadProgress, setUploadProgress] = useState(0);

  async function handleScan(file, progressCallback) {
    setLoading(true);
    setError("");
    setUploadProgress(0);

    try {
      const data = await scanFile(file, mode, engineMode, (p) => {
        setUploadProgress(p);
        if (typeof progressCallback === "function") progressCallback(p);
      });
      setResult(data);
      // History is local UI state so the backend remains unchanged and stateless.
      setHistory((items) => [
        {
          id: `${file.name}-${Date.now()}`,
          name: file.name,
          score: data.risk_score,
          level: data.risk_level,
          safe: data.safe,
        },
        ...items,
      ].slice(0, 5));
    } catch (requestError) {
      const message = requestError.response?.data?.detail || "Scan failed. Make sure the FastAPI backend is running.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    mlStatus()
      .then((d) => {
        if (mounted && d) setMlAvailable(Boolean(d.ml_available));
      })
      .catch(() => {});
    return () => (mounted = false);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="w-full px-0 py-8 sm:px-0 lg:px-0">
        <section className="mb-7 grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">AI document defense</p>
            <h1 className="mt-3 text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Scan files for hidden prompt injection attacks
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 muted">
              Upload PDFs, documents, and source files to detect instructions that try to override system prompts,
              bypass safeguards, exfiltrate confidential data, or hide attacks in encoded payloads.
            </p>
          </div>
              <div className="flex w-full items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMode("standard")}
                    className={`rounded px-3 py-2 text-sm font-semibold ${mode === "standard" ? "bg-cyan-400 text-slate-900" : "bg-slate-800 text-slate-200"}`}
                  >
                    Standard Scan
                  </button>
                  <button
                    onClick={() => setMode("dual_intent")}
                    className={`rounded px-3 py-2 text-sm font-semibold ${mode === "dual_intent" ? "bg-amber-400 text-slate-900" : "bg-slate-800 text-slate-200"}`}
                  >
                    Dual-Intent Mode
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {[
                    ["Rules", "Scanner", FileSearch],
                    ["Score", "Live meter", Activity],
                    ["Review", "Ask-first", LockKeyhole],
                  ].map(([label, value, Icon]) => (
                    <div key={label} className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 shadow-sm">
                      <Icon className="text-cyan-300" size={16} aria-hidden="true" />
                      <div className="text-left">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.10em] text-slate-500">{label}</p>
                        <p className="text-sm font-semibold text-white">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <FileUpload onScan={handleScan} loading={loading} mode={mode} />
            {error && (
              <div className="rounded-lg border border-red-500/25 bg-red-500/10 p-4 text-sm font-medium text-red-200">
                {error}
              </div>
            )}
            <section className="rounded-lg border border-slate-700 bg-slate-900 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-white">Upload history</h2>
              <div className="mt-4 space-y-2">
                {history.length ? (
                  history.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
                      <p className="truncate text-sm font-medium text-slate-200">{item.name}</p>
                      <span className={`shrink-0 rounded px-2 py-1 text-xs font-bold ${item.safe ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>
                        {item.level} {item.score}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-slate-400">
                    Recent scans will appear here.
                  </p>
                )}
              </div>
            </section>
          </div>
          <ResultPanel result={result} />
        </div>
      </main>
    </div>
  );
}
