import React from 'react';
import { PotentiallyConcerningSignal } from '../types.js';
import {
  ShieldAlert,
  AlertOctagon,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Clock,
  Briefcase,
  Globe,
  DollarSign,
} from 'lucide-react';

interface ConcerningSignalsTabProps {
  signals: PotentiallyConcerningSignal[];
  onInspectEvidence: (docId: string, snippet: string, title: string) => void;
}

export const ConcerningSignalsTab: React.FC<ConcerningSignalsTabProps> = ({
  signals,
  onInspectEvidence,
}) => {
  if (signals.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">No Concerning Signals Detected</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          No advance fee requests, communication domain anomalies, or high-risk contractual clauses were identified in this dossier.
        </p>
      </div>
    );
  }

  const getCategoryIcon = (cat: PotentiallyConcerningSignal['category']) => {
    switch (cat) {
      case 'financial_payment_request':
        return <DollarSign className="w-4 h-4 text-rose-400" />;
      case 'domain_communication_anomaly':
        return <Globe className="w-4 h-4 text-amber-400" />;
      case 'restrictive_contract_clause':
        return <Briefcase className="w-4 h-4 text-purple-400" />;
      case 'artificial_urgency':
        return <Clock className="w-4 h-4 text-amber-400" />;
      default:
        return <HelpCircle className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getSeverityBadge = (sev: PotentiallyConcerningSignal['severity']) => {
    switch (sev) {
      case 'high':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
            Elevated Signal (Action Recommended)
          </span>
        );
      case 'moderate':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Moderate Signal
          </span>
        );
      case 'info':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            Advisory Notice
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer / Calibration Banner */}
      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start space-x-3 text-xs text-slate-300 leading-relaxed">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white block mb-0.5">Objective Signal Analysis</span>
          OfferLens highlights atypical patterns, restrictive clauses, and requests for payment using calibrated evidence. OfferLens does not determine fraud or intent; the final decision always belongs to the user.
        </div>
      </div>

      <div className="space-y-5">
        {signals.map((sig) => (
          <div
            key={sig.id}
            className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition shadow-xl space-y-4"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <span className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                  {getCategoryIcon(sig.category)}
                </span>
                <h4 className="text-base font-bold text-white">{sig.title}</h4>
              </div>
              {getSeverityBadge(sig.severity)}
            </div>

            {/* Calibrated Language Callout */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-semibold text-emerald-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{sig.calibratedLanguage}</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              {sig.description}
            </p>

            {/* Evidence snippets */}
            {sig.evidence && sig.evidence.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Documented Evidence:
                </span>
                <div className="space-y-2">
                  {sig.evidence.map((ev, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs font-mono text-slate-200 space-y-2"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans">
                        <span className="font-semibold text-slate-300">{ev.docTitle}</span>
                        {ev.contextHint && (
                          <span className="text-slate-500 font-mono text-[10px]">{ev.contextHint}</span>
                        )}
                      </div>
                      <div className="text-amber-200/90 pl-2 border-l-2 border-amber-500/50">
                        "{ev.snippet}"
                      </div>
                      <button
                        onClick={() => onInspectEvidence(ev.docId, ev.snippet, ev.docTitle)}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-sans font-medium flex items-center gap-1 transition"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Inspect Snippet in Document
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Context & Action */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                <span className="font-semibold text-cyan-300 block">Industry Context:</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {sig.uncertaintyAndContext}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                <span className="font-semibold text-emerald-300 block">Recommended Due Diligence:</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {sig.suggestedAction}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
