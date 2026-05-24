import React from "react";

export default function ThreatTimeline({ events = [] }) {
  return (
    <div className="rounded-lg border border-slate-700 p-3 bg-slate-800 mt-4">
      <h4 className="font-semibold">Threat Timeline</h4>
      {events.length === 0 ? (
        <p className="text-sm text-slate-400">No events yet.</p>
      ) : (
        events.map((ev, i) => (
          <div key={i} className="text-sm text-slate-200 py-1">{ev}</div>
        ))
      )}
    </div>
  );
}
