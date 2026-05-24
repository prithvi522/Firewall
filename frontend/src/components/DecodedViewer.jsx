import { Code2 } from "lucide-react";

export default function DecodedViewer({ decodedContent = [] }) {
  const hasDecodedContent = decodedContent.length > 0;

  return (
    <section className="rounded-lg border border-slate-700 bg-slate-950 p-5 text-slate-100 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-violet-400/10 text-violet-300">
          <Code2 size={20} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Decoded content</h2>
          <p className="text-sm text-slate-400">Base64, hex, and long encoded strings found in the file.</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {hasDecodedContent ? (
          decodedContent.map((item, index) => (
            <div key={`${item.original}-${index}`} className="rounded-lg border border-violet-500/20 bg-slate-900 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-violet-500/15 px-2 py-1 text-xs font-bold uppercase tracking-[0.14em] text-violet-200">
                  {item.type}
                </span>
                <span className="text-xs font-medium text-red-300">Decoded hidden instruction candidate</span>
              </div>
              <p className="mt-3 break-all font-mono text-xs text-slate-500">{item.original}</p>
              <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-slate-800 bg-black/30 p-3 text-sm leading-6 text-cyan-100">
                {item.decoded}
              </pre>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm font-medium text-emerald-200">
            No encoded prompt payloads were detected.
          </div>
        )}
      </div>
    </section>
  );
}
