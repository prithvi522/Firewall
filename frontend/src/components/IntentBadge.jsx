import React from "react";

export default function IntentBadge({ intent, confidence }) {
  const color = intent === "malicious" ? "bg-rose-600" : "bg-emerald-600";
  return (
    <div className={`inline-block px-3 py-1 rounded ${color} text-white font-semibold`}>
      {intent} ({Math.round((confidence || 0) * 100)}%)
    </div>
  );
}
