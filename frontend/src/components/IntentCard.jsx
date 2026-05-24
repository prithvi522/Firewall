import React from "react";
import ConfidenceMeter from "./ConfidenceMeter";

export default function IntentCard({ intent, confidence }) {
  return (
    <div className="rounded-lg border border-slate-700 p-4 bg-slate-800">
      <h4 className="font-semibold">Detected Intent</h4>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-lg font-bold text-white">{intent || "unknown"}</div>
        <ConfidenceMeter value={confidence || 0} />
      </div>
    </div>
  );
}
