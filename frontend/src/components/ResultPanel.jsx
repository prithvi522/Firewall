import { useEffect, useState } from "react";
import { Highlighter } from "lucide-react";
import DecodedViewer from "./DecodedViewer.jsx";
import RiskCard from "./RiskCard.jsx";
import SanitizedPreview from "./SanitizedPreview.jsx";
import ThreatExplanation from "./ThreatExplanation.jsx";
import ThreatDashboard from "./ThreatDashboard.jsx";
import ThreatList from "./ThreatList.jsx";
import DualIntentViz from "./DualIntentViz.jsx";
import { approveReview } from "../services/api.js";

function getSentimentCopy(result) {
  // Sentiment remains separate from prompt-injection risk so users can compare both signals.
  const label = result?.sentiment_label || "neutral";
  const score = result?.sentiment_score ?? 0;

  if (label === "positive") {
    return {
      tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
      title: "Positive sentiment",
      description: `The document reads as supportive or constructive (${score}).`,
    };
  }

  if (label === "negative") {
    return {
      tone: "border-rose-200 bg-rose-50 text-rose-700",
      title: "Negative sentiment",
      description: `The document contains more negative or harmful language (${score}).`,
    };
  }

  return {
    tone: "border-slate-200 bg-slate-50 text-slate-700",
    title: "Neutral sentiment",
    description: `The document is mostly balanced or neutral (${score}).`,
  };
}

export default function ResultPanel({ result }) {
  const [showSanitizedPreview, setShowSanitizedPreview] = useState(false);
  const [sanitizedText, setSanitizedText] = useState(result?.sanitized_text || "");
  const [reviewPending, setReviewPending] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    setShowSanitizedPreview(!result?.review_required);
    setSanitizedText(result?.sanitized_text || "");
    setReviewError("");
    setReviewPending(false);
  }, [result]);

  if (!result) {
    return (
      <section className="card text-center text-slate-100">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-slate-800 text-cyan-300">
          <Highlighter size={24} aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">Awaiting scan</h2>
        <p className="mt-2 text-sm leading-6 muted">Upload a file to see risk scoring, threat labels, and highlighted suspicious lines.</p>
      </section>
    );
  }

  const hasAbusive = (r) => {
    if (!r) return false;
    const text = [r.sanitized_text, ...(r.highlighted_lines || []), ...(r.threats || [])].join(" ") || "";
    return /\b(abuse|harass|insult|bully|profanit|slur|suicid|self-?harm|kill)\b/i.test(text);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div />
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-slate-700/50 bg-slate-800/60 px-3 py-1 text-sm font-semibold text-slate-200">Engine: {result.engine || 'auto'}</div>
          <div className="rounded-full border border-slate-700/40 bg-slate-800/40 px-3 py-1 text-sm font-medium text-slate-200">Intent: <span className="font-bold text-white">{result.intent || 'unknown'}</span></div>
          <div className="rounded-full border border-slate-700/30 bg-slate-800/20 px-2 py-1 text-xs font-medium muted">{Math.round((result.intent_confidence||0)*100)}%</div>
          {hasAbusive(result) && (
            <div className="rounded-full border border-rose-600/20 bg-rose-600/8 px-3 py-1 text-sm font-semibold text-rose-700">Abusive language detected</div>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${result?.decoded_content?.[0]?.type || 'scan'}-report.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="rounded-md border border-slate-700 px-3 py-1 bg-slate-800 text-sm font-medium"
        >
          Download JSON
        </button>
        <button onClick={() => window.print()} className="rounded-md border border-slate-700 px-3 py-1 bg-slate-800 text-sm font-medium">Print report</button>
      </div>

      <section className="rounded-lg border border-amber-500/25 bg-amber-500/10 p-5 text-slate-100 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-200">Review before redaction</p>
            <h2 className="mt-2 text-xl font-semibold text-white">{result.review_required ? "I will explain the cleanup before hiding anything." : "No cleanup is required for this file."}</h2>
            <p className="mt-2 text-sm leading-6 text-amber-50/90">{result.review_summary || "The firewall will only redact content after you confirm the preview."}</p>
          </div>
          <button
            type="button"
            onClick={async () => {
              if (!result?.review_required || showSanitizedPreview) {
                setShowSanitizedPreview((current) => !current);
                return;
              }

              if (!result?.review_token) {
                setReviewError("No review token was issued for this file.");
                return;
              }

              setReviewPending(true);
              setReviewError("");

              try {
                const approval = await approveReview(result.review_token);
                setSanitizedText(approval.sanitized_text || "");
                setShowSanitizedPreview(true);
              } catch (requestError) {
                setReviewError(requestError.response?.data?.detail || "Approval failed. Please scan the file again.");
              } finally {
                setReviewPending(false);
              }
            }}
            className="rounded-md border border-amber-200/30 bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
          >
            {showSanitizedPreview ? "Hide sanitized preview" : reviewPending ? "Requesting approval..." : "Show sanitized preview"}
          </button>
        </div>

        {reviewError && <p className="mt-3 text-sm font-medium text-rose-200">{reviewError}</p>}

        {result.review_actions?.length > 0 && (
          <ul className="mt-4 grid gap-2 text-sm text-amber-50/90 lg:grid-cols-2">
            {result.review_actions.map((action) => (
              <li key={action} className="rounded-md border border-amber-200/20 bg-slate-950/40 px-3 py-2">
                {action}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <RiskCard result={result} />
        <div>
          <ThreatList threats={result.threats} />
          {/* Abusive language badge: shows when profanity/insults or degrading language detected */}
          {result.threats?.some((t) => /profanity|degrad|harass|bully|abuse|insult|profanity or insults/i.test(t)) && (
            <div className="mt-3 flex items-center gap-2">
              <div className="rounded-full border border-rose-600/20 bg-rose-600/8 px-3 py-1 text-sm font-semibold text-rose-700">Abusive language detected</div>
            </div>
          )}
        </div>
      </div>

      <ThreatExplanation explanation={result.explanation} threats={result.threats} />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <DualIntentViz intentLabel={result.intent} intentConfidence={result.intent_confidence} persona={result.persona} conversationRisk={result.conversation_risk} />
        <section className="card">
          <h3 className="text-lg font-semibold">Quick stats</h3>
          <div className="mt-3 grid gap-2">
            <div className="flex items-center justify-between">
              <p className="muted">Risk score</p>
              <p className="font-bold">{result.risk_score}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="muted">Intent</p>
              <p className="font-bold">{result.intent}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="muted">Abusive</p>
              <p className="font-bold">{result.abusive_detected ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <DecodedViewer decodedContent={result.decoded_content || []} />
        <SanitizedPreview
          sanitizedText={sanitizedText}
          revealed={showSanitizedPreview}
          loading={reviewPending}
          onReveal={async () => {
            if (!result?.review_required || showSanitizedPreview) {
              setShowSanitizedPreview(true);
              return;
            }

            if (!result?.review_token) {
              setReviewError("No review token was issued for this file.");
              return;
            }

            setReviewPending(true);
            setReviewError("");

            try {
              const approval = await approveReview(result.review_token);
              setSanitizedText(approval.sanitized_text || "");
              setShowSanitizedPreview(true);
            } catch (requestError) {
              setReviewError(requestError.response?.data?.detail || "Approval failed. Please scan the file again.");
            } finally {
              setReviewPending(false);
            }
          }}
        />
      </div>

      <section className={`card ${getSentimentCopy(result).tone}`}>
        <h2 className="text-lg font-semibold">Sentiment analysis</h2>
        <p className="mt-2 text-sm leading-6 muted">{getSentimentCopy(result).description}</p>
      </section>

      <section className="card text-slate-100">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-800 text-cyan-300">
            <Highlighter size={20} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Highlighted lines</h2>
            <p className="text-sm text-slate-400">Suspicious document lines are shown in red.</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {result.highlighted_lines?.length ? (
            result.highlighted_lines.map((line, index) => (
              <pre key={`${line}-${index}`} className="whitespace-pre-wrap rounded-md border border-red-500/25 bg-red-500/8 p-3 text-sm leading-6 text-red-200">{line}</pre>
            ))
          ) : (
            <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm font-medium text-emerald-200">
              No risky lines were highlighted.
            </div>
          )}
        </div>
      </section>

      <ThreatDashboard scanResult={result} />
    </div>
  );
}
