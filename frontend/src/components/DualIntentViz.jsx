export default function DualIntentViz({ intentLabel = 'unknown', intentConfidence = 0, persona = 'unknown', conversationRisk = 0 }) {
  const intentPct = Math.round((intentConfidence || 0) * 100);
  const convPct = Math.max(0, Math.min(100, conversationRisk));

  return (
    <section className="card">
      <h3 className="text-lg font-semibold">Dual-Intent Overview</h3>
      <p className="mt-2 text-sm muted">Intent: <span className="font-bold text-white">{intentLabel}</span></p>

      <div className="mt-3 space-y-3">
        <div>
          <p className="text-xs muted">Intent confidence</p>
          <div className="mt-1 h-3 w-full rounded-full bg-slate-800">
            <div className="h-3 rounded-full bg-cyan-400" style={{ width: `${intentPct}%` }} />
          </div>
        </div>

        <div>
          <p className="text-xs muted">Conversation risk</p>
          <div className="mt-1 h-3 w-full rounded-full bg-slate-800">
            <div className="h-3 rounded-full bg-rose-500" style={{ width: `${convPct}%` }} />
          </div>
        </div>

        <p className="text-sm muted">Persona: <span className="font-medium text-white">{persona}</span></p>
      </div>
    </section>
  );
}
