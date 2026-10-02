import React from 'react';
import { Contradiction } from '../types.js';
import {
  AlertTriangle,
  ArrowRight,
  FileText,
  MessageSquare,
  HelpCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Send,
} from 'lucide-react';

interface ContradictionsTabProps {
  contradictions: Contradiction[];
  onInspectEvidence: (docId: string, snippet: string, title: string) => void;
  onDraftQuestion: (contraTitle: string) => void;
}

export const ContradictionsTab: React.FC<ContradictionsTabProps> = ({
  contradictions,
  onInspectEvidence,
  onDraftQuestion,
}) => {
  if (contradictions.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">No Contradictions Detected</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          The recruiter promises and written formal contract appear consistent across examined compensation, location, and benefit terms.
        </p>
      </div>
    );
  }

  const getSeverityBadge = (sev: Contradiction['severity']) => {
    switch (sev) {
      case 'high':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
            High Severity Divergence
          </span>
        );
      case 'moderate':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Moderate Divergence
          </span>
        );
      case 'low':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            Minor Variation
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            Cross-Document Contradictions ({contradictions.length})
          </h3>
          <p className="text-xs text-slate-400">
            Side-by-side comparison of promises made by the recruiter vs terms written in the binding offer letter
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {contradictions.map((c) => (
          <div
            key={c.id}
            className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition shadow-xl space-y-5"
          >
            {/* Top Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {c.category.replace('_', ' ')}
                </span>
                <h4 className="text-base font-bold text-white">{c.title}</h4>
              </div>
              {getSeverityBadge(c.severity)}
            </div>

            {/* Summary */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              {c.summary}
            </p>

            {/* Side-by-Side Comparison Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Claim A: Recruiter Promise */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {c.claimA.speakerOrChannel}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                    {c.claimA.docTitle}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 text-xs font-mono text-amber-200/90 leading-relaxed">
                  "{c.claimA.snippet}"
                </div>
                <button
                  onClick={() =>
                    onInspectEvidence(c.claimA.docId, c.claimA.snippet, c.claimA.docTitle)
                  }
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 pt-1 transition"
                >
                  <ExternalLink className="w-3 h-3" />
                  Inspect in Source Document
                </button>
              </div>

              {/* Claim B: Contract Reality */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs text-rose-400 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    {c.claimB.speakerOrChannel}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                    {c.claimB.docTitle}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 text-xs font-mono text-rose-200/90 leading-relaxed">
                  "{c.claimB.snippet}"
                </div>
                <button
                  onClick={() =>
                    onInspectEvidence(c.claimB.docId, c.claimB.snippet, c.claimB.docTitle)
                  }
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 pt-1 transition"
                >
                  <ExternalLink className="w-3 h-3" />
                  Inspect in Offer Letter
                </button>
              </div>
            </div>

            {/* Impact & Uncertainty Analysis Callouts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                <span className="font-semibold text-rose-300 block">Practical Risk & Impact:</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {c.impactAssessment}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                <span className="font-semibold text-cyan-300 block">Uncertainty Context:</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {c.uncertaintyExplanation}
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Recommended Action: </span>
                {c.recommendedVerification}
              </div>

              <button
                onClick={() => onDraftQuestion(c.title)}
                className="px-4 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5 self-start sm:self-auto shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                Draft Recruiter Question
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
