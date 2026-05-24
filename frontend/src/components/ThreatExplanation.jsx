import { BrainCircuit } from "lucide-react";

const threatCopy = {
  "ignore previous instructions": "This tries to make an AI forget the rules it was given by its developer.",
  "reveal system prompt": "This attempts to expose hidden system instructions that should stay private.",
  "bypass safety": "This asks the AI to ignore safety controls or policy restrictions.",
  "act as admin": "This tries to make the AI pretend it has elevated permissions.",
  "send confidential data": "This attempts to move sensitive data outside the trusted workflow.",
  "reveal confidential data": "This asks the AI to expose private or secret information.",
  "developer mode jailbreak": "This uses common jailbreak language to weaken model safeguards.",
  "system instruction override": "This attempts to replace the AI's original system-level instructions.",
  "encoded malicious prompt": "This means hidden encoded text decoded into a dangerous instruction.",
};

export default function ThreatExplanation({ explanation, threats = [] }) {
  return (
    <section className="rounded-lg border border-cyan-500/25 bg-slate-950 p-5 text-slate-100 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-400/10 text-cyan-300">
          <BrainCircuit size={20} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">AI explanation</h2>
          <p className="text-sm text-slate-400">Plain-language reason for the risk score.</p>
        </div>
      </div>

      <p className="mt-4 rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm leading-6 text-slate-200">
        {explanation || "No risky behavior was detected by the current scanner rules."}
      </p>

      {threats.length > 0 && (
        <div className="mt-4 grid gap-2">
          {threats.map((threat) => (
            <div key={threat} className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
              <p className="text-sm font-semibold text-red-300">{threat}</p>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                {threatCopy[threat] || "This content matches a suspicious safety or abuse pattern."}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
