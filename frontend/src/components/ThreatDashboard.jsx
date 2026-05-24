import React from "react";
import ThreatAnalytics from "./ThreatAnalytics";
import ConversationMonitor from "./ConversationMonitor";
import ThreatHeatmap from "./ThreatHeatmap";

export default function ThreatDashboard({ scanResult }) {
  return (
    <section className="p-4 rounded-lg bg-slate-900 text-slate-100">
      <h2 className="text-2xl font-bold mb-4">Cybersecurity Dashboard</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="col-span-2">
          <ThreatAnalytics scanResult={scanResult} />
          <ThreatHeatmap scanResult={scanResult} />
        </div>
        <div>
          <ConversationMonitor />
        </div>
      </div>
    </section>
  );
}
