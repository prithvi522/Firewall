import React from "react";

export default function PersonaBadge({ persona }) {
  const color = persona === "student" ? "bg-cyan-500" : persona === "clinician" ? "bg-rose-500" : "bg-slate-600";
  return <div className={`inline-block px-3 py-1 rounded ${color} text-white font-semibold`}>{persona}</div>;
}
