import { ShieldCheck, Siren } from "lucide-react";

export default function ThreatList({ threats = [] }) {
  // Threat cards stay compact so long scans remain easy to skim.
  const hasThreats = threats.length > 0;

  return (
    <section className="rounded-lg border border-slate-700 bg-slate-900 p-5 text-slate-100 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded-lg ${hasThreats ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
          {hasThreats ? <Siren size={20} aria-hidden="true" /> : <ShieldCheck size={20} aria-hidden="true" />}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Detected threats</h2>
          <p className="text-sm text-slate-400">{hasThreats ? `${threats.length} suspicious pattern(s)` : "No known injection patterns found"}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {hasThreats ? (
          threats.map((threat) => (
            <div key={threat} className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200">
              {threat}
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-3 text-sm font-medium text-emerald-200">
            This document looks clean against the current ruleset.
          </div>
        )}
      </div>
    </section>
  );
}
