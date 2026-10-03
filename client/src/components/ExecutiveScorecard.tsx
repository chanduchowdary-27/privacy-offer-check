import React from 'react';
import { InvestigationReport } from '../types.js';
import {
  ShieldAlert,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Scale,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface ExecutiveScorecardProps {
  report: InvestigationReport;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const ExecutiveScorecard: React.FC<ExecutiveScorecardProps> = ({
  report,
  activeTab,
  setActiveTab,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30';
    if (score >= 50) return 'text-amber-400 border-amber-500/40 bg-amber-950/30';
    return 'text-rose-400 border-rose-500/40 bg-rose-950/30';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-teal-400';
    if (score >= 50) return 'from-amber-500 to-yellow-400';
    return 'from-rose-500 to-amber-500';
  };

  const getUncertaintyBadge = (rating: InvestigationReport['uncertaintyRating']) => {
    switch (rating) {
      case 'low':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Low Uncertainty (High Confidence)
          </span>
        );
      case 'moderate':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Moderate Uncertainty (Missing Corroboration)
          </span>
        );
      case 'high':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            High Uncertainty (Limited Dossier Evidence)
          </span>
        );
    }
  };

  const tabs = [
    {
      id: 'contradictions',
      label: 'Contradictions & Divergences',
      count: report.contradictionsCount,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      id: 'signals',
      label: 'Potentially Concerning Signals',
      count: report.signalsSummary.highCount + report.signalsSummary.moderateCount,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'matrix',
      label: 'Recruiter Claim vs Reality',
      count: report.claimVsOfferMatrix.length,
      badgeColor: 'bg-slate-700 text-slate-300 border-slate-600',
    },
    {
      id: 'missing',
      label: 'Missing Information Audit',
      count: report.missingItemsCount,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'questions',
      label: 'Recruiter Inquiries & Scripts',
      count: report.recruiterQuestions.length,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'facts',
      label: 'Structured Facts & Timeline',
      count: null,
      badgeColor: '',
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Title & Metadata */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Investigation Dossier
            </span>
            {getUncertaintyBadge(report.uncertaintyRating)}
            <span className="text-xs font-mono text-slate-400">
              Generated: {new Date(report.generatedAt).toLocaleTimeString()}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {report.candidateRole}
          </h2>
          <p className="text-sm font-medium text-slate-400">
            Employer / Entity: <span className="text-slate-200">{report.companyName}</span> • Cross-Referenced Across {report.documentCount} Documents
          </p>
        </div>

        {/* Alignment Gauge / Score Card */}
        <div className="flex items-center space-x-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 self-start lg:self-auto shadow-inner">
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* Circular representation */}
            <div className={`w-full h-full rounded-full border-4 flex items-center justify-center p-2 shadow-lg ${getScoreColor(report.overallAlignmentScore)}`}>
              <div className="text-center">
                <span className="text-2xl font-black tracking-tight text-white block">
                  {report.overallAlignmentScore}%
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                  Alignment
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-1 max-w-[170px]">
            <span className="text-xs font-bold text-white block">
              Reality Alignment Score
            </span>
            <p className="text-[11px] text-slate-400 leading-snug">
              Measures contractual consistency against recruiter claims.
            </p>
          </div>
        </div>
      </div>

      {/* Calibrated Objective Verdict Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            <span>Calibrated Investigation Finding</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {report.privacySummary.processingMode === 'local_with_gemini_ai' ? 'Analyzed via Gemini 3.8 Flash' : 'Analyzed via Offline Local Engine'}
          </span>
        </div>
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
          {report.calibratedVerdictSummary}
        </p>
        <p className="text-[11px] text-slate-400 border-t border-slate-800/60 pt-2 flex items-center gap-1.5 italic">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          Notice: OfferLens presents objective evidence and inconsistencies. The final decision always belongs to the user.
        </p>
      </div>

      {/* Quick Stat Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setActiveTab('contradictions')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'contradictions'
              ? 'bg-rose-950/50 border-rose-500/80 shadow-md'
              : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-rose-400 mb-1">
            <span className="font-semibold">Contradictions</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <span className="text-2xl font-black text-white">{report.contradictionsCount}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Recruiter vs Offer</span>
        </div>

        <div
          onClick={() => setActiveTab('signals')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'signals'
              ? 'bg-amber-950/50 border-amber-500/80 shadow-md'
              : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-400 mb-1">
            <span className="font-semibold">Concerning Signals</span>
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-white">
              {report.signalsSummary.highCount + report.signalsSummary.moderateCount}
            </span>
            {report.signalsSummary.highCount > 0 && (
              <span className="text-[10px] font-bold text-rose-400 bg-rose-950/80 px-1.5 rounded">
                {report.signalsSummary.highCount} high
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Requiring verification</span>
        </div>

        <div
          onClick={() => setActiveTab('missing')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'missing'
              ? 'bg-indigo-950/50 border-indigo-500/80 shadow-md'
              : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-indigo-400 mb-1">
            <span className="font-semibold">Missing Terms</span>
            <HelpCircle className="w-3.5 h-3.5" />
          </div>
          <span className="text-2xl font-black text-white">{report.missingItemsCount}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Omitted protections</span>
        </div>

        <div
          onClick={() => setActiveTab('questions')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'questions'
              ? 'bg-emerald-950/50 border-emerald-500/80 shadow-md'
              : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-emerald-400 mb-1">
            <span className="font-semibold">Recruiter Scripts</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-2xl font-black text-white">{report.recruiterQuestions.length}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Ready to copy & send</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto space-x-1.5 pt-2 border-b border-slate-800 pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-2 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono border ${
                    isActive
                      ? 'bg-emerald-700/80 text-white border-emerald-500/50'
                      : tab.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
