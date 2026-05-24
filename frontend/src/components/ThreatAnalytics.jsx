import React from "react";
import IntentBadge from "./IntentBadge";
import EncodedThreatViewer from "./EncodedThreatViewer";
import OCRViewer from "./OCRViewer";

export default function ThreatAnalytics({ scanResult = {} }) {
  return (
    <div className="rounded-lg border border-slate-700 p-4 bg-slate-800">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Threat Analytics</h3>
        <IntentBadge intent={scanResult.intent} confidence={scanResult.intent_confidence} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <div className="text-sm text-slate-400">Risk Score</div>
          <div className="text-3xl font-bold text-white">{scanResult.risk_score ?? "-"}</div>
        </div>
        <div>
          <div className="text-sm text-slate-400">Risk Level</div>
          <div className="text-xl font-semibold text-white">{scanResult.risk_level ?? "-"}</div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <EncodedThreatViewer encoded={scanResult.encoded_threats || []} />
        <OCRViewer ocr={(scanResult.image_threats && scanResult.image_threats[0] && scanResult.image_threats[0].ocr_text) || ""} />
      </div>
    </div>
  );
}
