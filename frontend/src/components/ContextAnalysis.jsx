import React from "react";

export default function ContextAnalysis({ explanation }) {
  return (
    <div className="rounded-lg border border-slate-700 p-4 bg-slate-800 mt-4">
      <h4 className="font-semibold">Context Analysis</h4>
      <p className="mt-2 text-sm text-slate-300">{explanation || "No additional context provided."}</p>
    </div>
  );
}
