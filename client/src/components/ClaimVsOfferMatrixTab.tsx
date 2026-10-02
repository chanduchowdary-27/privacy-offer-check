import React from 'react';
import { ClaimVsOfferItem } from '../types.js';
import {
  Scale,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface ClaimVsOfferMatrixTabProps {
  matrix: ClaimVsOfferItem[];
}

export const ClaimVsOfferMatrixTab: React.FC<ClaimVsOfferMatrixTabProps> = ({ matrix }) => {
  const getStatusBadge = (status: ClaimVsOfferItem['alignmentStatus']) => {
    switch (status) {
      case 'matched':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Matched
          </span>
        );
      case 'contradicted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            Contradicted
          </span>
        );
      case 'partially_aligned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            Partially Aligned
          </span>
        );
      case 'unmentioned_in_offer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <HelpCircle className="w-3.5 h-3.5" />
            Omitted in Offer Letter
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            Unverified
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-400" />
            Recruiter Claims vs Offer Contract Reality Matrix
          </h3>
          <p className="text-xs text-slate-400">
            Detailed side-by-side verification across core compensation and working condition parameters
          </p>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Parameter</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-amber-300">Recruiter Pitch / Discussed</th>
                <th className="py-3.5 px-4 text-emerald-300">Formal Contract Terms</th>
                <th className="py-3.5 px-4 text-right">Alignment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {matrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-4 font-semibold text-white whitespace-nowrap">
                    {row.parameter}
                  </td>
                  <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                    {row.category}
                  </td>
                  <td className="py-4 px-4 text-slate-300 max-w-xs leading-relaxed">
                    <span className="font-medium text-amber-200/90">{row.recruiterStated}</span>
                    {row.sourceClaimSnippet && (
                      <span className="block text-[10px] font-mono text-slate-400 mt-1 line-clamp-1 italic">
                        "{row.sourceClaimSnippet}"
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-slate-300 max-w-xs leading-relaxed">
                    <span className="font-medium text-emerald-200/90">{row.contractStated}</span>
                    {row.sourceContractSnippet && (
                      <span className="block text-[10px] font-mono text-slate-400 mt-1 line-clamp-1 italic">
                        "{row.sourceContractSnippet}"
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    {getStatusBadge(row.alignmentStatus)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
