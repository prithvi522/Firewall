import { Eraser } from "lucide-react";

export default function SanitizedPreview({ sanitizedText = "", revealed = false, loading = false, onReveal }) {
  return (
    <section className="rounded-lg border border-slate-700 bg-slate-950 p-5 text-slate-100 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-400/10 text-emerald-300">
          <Eraser size={20} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Sanitized preview</h2>
          <p className="text-sm text-slate-400">Suspicious instructions are hidden only after you approve the preview.</p>
        </div>
      </div>

      {!revealed ? (
        <div className="mt-4 rounded-lg border border-dashed border-slate-700 bg-slate-900/60 p-4 text-sm leading-6 text-slate-300">
          <p>Redacted content is hidden until you choose to reveal it.</p>
          <button
            type="button"
            onClick={onReveal}
            disabled={loading}
            className="mt-3 rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-200"
          >
            {loading ? "Requesting approval..." : "Reveal redacted preview"}
          </button>
        </div>
      ) : (
        <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-800 bg-black/30 p-3 text-sm leading-6 text-slate-200">
          {sanitizedText || "No sanitized text is available yet."}
        </pre>
      )}
    </section>
  );
}
