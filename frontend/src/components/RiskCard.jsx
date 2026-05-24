import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import LiveRiskMeter from "./LiveRiskMeter.jsx";

export default function RiskCard({ result }) {
  // Fallback level keeps older API responses displayable during development.
  const score = result?.risk_score ?? 0;
  const safe = result?.safe ?? true;
  const level = result?.risk_level || (score >= 70 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW");
  const statusCopy = safe ? "Safe document" : "Unsafe document";
  const Icon = safe ? CheckCircle2 : score >= 70 ? ShieldAlert : AlertTriangle;

  return (
    <section className="rounded-lg border border-slate-700 bg-slate-900 p-5 text-slate-100 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] muted">Risk score</p>
            <p className="text-3xl font-extrabold">{score}</p>
            <p className="mt-1 text-xs muted">Intent</p>
            <p className="text-sm font-medium">{result?.intent ? `${result.intent} <span className="text-xs muted">(${Math.round((result.intent_confidence||0)*100)}%)</span>` : ''}</p>
        </div>
        <div className={`grid h-14 w-14 place-items-center rounded-lg ${safe ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
          <Icon size={28} aria-hidden="true" />
        </div>
      </div>
      <div className="mt-5">
        <LiveRiskMeter score={score} level={level} />
      </div>
      <p className={`mt-4 rounded-lg px-3 py-2 text-sm font-semibold ${safe ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>
        {statusCopy}
      </p>
    </section>
  );
}
