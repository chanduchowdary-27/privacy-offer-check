import React from 'react';
import { MissingInformationItem } from '../types.js';
import {
  HelpCircle,
  AlertCircle,
  CheckCircle,
  Send,
  Info,
} from 'lucide-react';

interface MissingInfoTabProps {
  missingItems: MissingInformationItem[];
  onDraftQuestion: (topic: string) => void;
}

export const MissingInfoTab: React.FC<MissingInfoTabProps> = ({
  missingItems,
  onDraftQuestion,
}) => {
  if (missingItems.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">Comprehensive Documentation</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          All standard employment parameters (health insurance effective date, equity strike prices, severance, PTO) are documented in the dossier.
        </p>
      </div>
    );
  }

  const getImportanceBadge = (imp: MissingInformationItem['importance']) => {
    switch (imp) {
      case 'essential':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Essential Protection Missing
          </span>
        );
      case 'recommended':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            Recommended Clarity
          </span>
        );
      case 'beneficial':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            Beneficial Perk Detail
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          Missing Information & Blind-Spot Audit ({missingItems.length})
        </h3>
        <p className="text-xs text-slate-400">
          Standard contractual safeguards, valuation numbers, or benefit commencement dates omitted from the formal agreement
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {missingItems.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4 shadow-xl"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-base font-bold text-white">{item.topic}</h4>
                {getImportanceBadge(item.importance)}
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="font-semibold text-rose-300 block">What is Missing:</span>
                  <p className="text-slate-300 leading-relaxed">{item.whatIsMissing}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="font-semibold text-cyan-300 block">Why It Matters:</span>
                  <p className="text-slate-300 leading-relaxed">{item.whyItMatters}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2.5">
              <span className="text-[11px] font-semibold text-emerald-400 block uppercase tracking-wider">
                Suggested Recruiter Inquiry:
              </span>
              <p className="text-xs font-mono text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                "{item.suggestedQuestion}"
              </p>

              <button
                onClick={() => onDraftQuestion(item.topic)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                Customize Script in Negotiation Playbook
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
