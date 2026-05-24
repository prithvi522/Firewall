import { Activity } from "lucide-react";

function getLevelStyle(level) {
  if (level === "HIGH") {
    return {
      label: "text-red-300",
      bar: "bg-red-500",
      track: "bg-red-950/50",
      glow: "shadow-[0_0_24px_rgba(239,68,68,0.35)]",
    };
  }

  if (level === "MEDIUM") {
    return {
      label: "text-amber-300",
      bar: "bg-amber-400",
      track: "bg-amber-950/40",
      glow: "shadow-[0_0_24px_rgba(251,191,36,0.25)]",
    };
  }

  return {
    label: "text-emerald-300",
    bar: "bg-emerald-400",
    track: "bg-emerald-950/40",
    glow: "shadow-[0_0_24px_rgba(52,211,153,0.25)]",
  };
}

export default function LiveRiskMeter({ score = 0, level = "LOW" }) {
  const width = `${Math.min(Math.max(score, 0), 100)}%`;
  const style = getLevelStyle(level);

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950/80 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="text-cyan-300" size={18} aria-hidden="true" />
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">Threat Level</p>
        </div>
        <p className={`text-sm font-bold ${style.label}`}>{level} {score}%</p>
      </div>

      {/* The width transition gives the dashboard a live scanning feel after each API response. */}
      <div className={`mt-4 h-4 overflow-hidden rounded-full ${style.track}`}>
        <div className={`h-full rounded-full transition-all duration-700 ease-out ${style.bar} ${style.glow}`} style={{ width }} />
      </div>
      <p className="mt-3 font-mono text-xs text-slate-400">
        {level} {"█".repeat(Math.round(score / 10)).padEnd(10, "░")} {score}%
      </p>
    </div>
  );
}
