import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { mlStatus } from "../services/api.js";

export default function Navbar() {
  const [mlAvailable, setMlAvailable] = useState(false);

  useEffect(() => {
    let mounted = true;
    mlStatus()
      .then((d) => mounted && setMlAvailable(Boolean(d.ml_available)))
      .catch(() => {});
    return () => (mounted = false);
  }, []);
  // The header anchors the dark cybersecurity dashboard across all views.
  return (
    <header className="border-b border-cyan-500/20 bg-slate-950/90 text-slate-100 backdrop-blur">
        <nav className="w-full flex items-center justify-between px-0 py-4 sm:px-0 lg:px-0">
         <div className="flex items-center gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-400/10 text-cyan-300">
            <ShieldCheck size={22} aria-hidden="true" />
          </div>
           <div>
             <p className="text-lg font-semibold text-white tracking-tight">AI Prompt Firewall</p>
             <p className="text-xs font-medium uppercase tracking-[0.18em] muted">Document threat scanner</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden rounded-full border border-cyan-400/20 bg-slate-900/40 px-3 py-1 text-sm font-medium text-cyan-200 sm:inline-flex no-select">FastAPI + React</span>
          <div>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${mlAvailable ? 'bg-emerald-600/10 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>{mlAvailable ? 'ML ready' : 'ML unavailable'}</span>
          </div>
        </div>
      </nav>
    </header>
  );
}
