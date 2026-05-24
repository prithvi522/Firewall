import React from "react";

export default function ConfidenceMeter({ value = 0 }) {
  const pct = Math.max(0, Math.min(100, value));
  const color = pct > 75 ? "bg-emerald-500" : pct > 40 ? "bg-amber-400" : "bg-rose-500";
  return (
    <div className="w-40">
      <div className="h-3 w-full rounded bg-slate-700">
        <div className={`${color} h-3 rounded`} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-xs text-slate-400">{pct}%</div>
    </div>
  );
}
