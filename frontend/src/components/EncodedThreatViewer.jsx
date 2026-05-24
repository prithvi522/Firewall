import React from "react";

export default function EncodedThreatViewer({ encoded = [] }) {
  return (
    <div className="rounded-lg border border-slate-700 p-3 bg-slate-800">
      <h4 className="font-semibold">Encoded Threats</h4>
      {encoded.length === 0 ? (
        <p className="text-sm text-slate-400">No encoded content detected.</p>
      ) : (
        encoded.map((e, i) => (
          <div key={i} className="mt-2">
            <div className="text-xs text-slate-400">{e.type}</div>
            <pre className="bg-slate-900 p-2 rounded text-sm overflow-auto">{e.decoded}</pre>
          </div>
        ))
      )}
    </div>
  );
}
