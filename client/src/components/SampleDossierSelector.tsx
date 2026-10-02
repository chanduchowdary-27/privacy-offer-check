import React from 'react';
import {
  SampleDossierSummary,
} from '../types.js';
import {
  FolderOpen,
  ArrowRight,
  AlertTriangle,
  FileText,
  CheckCircle,
  HelpCircle,
  X,
  Sparkles,
} from 'lucide-react';

interface SampleDossierSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  samples: SampleDossierSummary[];
  onSelectSample: (id: string) => void;
  isLoading: boolean;
}

export const SampleDossierSelector: React.FC<SampleDossierSelectorProps> = ({
  isOpen,
  onClose,
  samples,
  onSelectSample,
  isLoading,
}) => {
  if (!isOpen) return null;

  const getScenarioBadge = (type: SampleDossierSummary['scenarioType']) => {
    switch (type) {
      case 'bait_and_switch':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-3 h-3" />
            Bait & Switch Remote Offer
          </span>
        );
      case 'payment_red_flag':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3" />
            Advance Payment / Check Signal
          </span>
        );
      case 'opaque_startup':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <HelpCircle className="w-3 h-3" />
            Opaque Equity & IP Clauses
          </span>
        );
      case 'clean_offer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" />
            Transparent & Clean Offer
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Pre-Loaded Investigation Cases
              </h2>
              <p className="text-xs text-slate-400">
                Test OfferLens immediately with realistic multi-document job offer scenarios
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of sample dossiers */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {samples.map((sample) => (
            <div
              key={sample.id}
              onClick={() => onSelectSample(sample.id)}
              className="group p-5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-xl hover:shadow-emerald-950/20"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  {getScenarioBadge(sample.scenarioType)}
                  <span className="text-[11px] text-slate-400 font-mono bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-800">
                    {sample.docCount} documents
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors">
                    {sample.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {sample.role} • {sample.company}
                  </p>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {sample.summaryDescription}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium truncate max-w-[200px]">
                  {sample.keyDivergenceHint}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                  Load Case
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Each case contains authentic email threads, call notes, and formal legal contracts.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
