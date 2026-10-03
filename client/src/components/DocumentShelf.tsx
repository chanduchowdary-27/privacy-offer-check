import React from 'react';
import { DossierDocument } from '../types.js';
import {
  FileText,
  MessageSquare,
  DollarSign,
  Mic,
  Eye,
  Trash2,
  ShieldCheck,
  Search,
  Sparkles,
  ArrowRight,
  Layers,
} from 'lucide-react';

interface DocumentShelfProps {
  documents: DossierDocument[];
  onRemoveDocument: (id: string) => void;
  onViewDocument: (doc: DossierDocument) => void;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
  useGemini: boolean;
}

export const DocumentShelf: React.FC<DocumentShelfProps> = ({
  documents,
  onRemoveDocument,
  onViewDocument,
  onRunAnalysis,
  isAnalyzing,
  useGemini,
}) => {
  if (documents.length === 0) return null;

  const getTypeIcon = (type: DossierDocument['type']) => {
    switch (type) {
      case 'offer_letter':
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'salary_breakup':
        return <DollarSign className="w-4 h-4 text-cyan-400" />;
      case 'recruiter_email':
      case 'recruiter_message':
        return <MessageSquare className="w-4 h-4 text-amber-400" />;
      case 'voice_recording':
        return <Mic className="w-4 h-4 text-rose-400" />;
      default:
        return <FileText className="w-4 h-4 text-indigo-400" />;
    }
  };

  const getTypeBadgeClass = (type: DossierDocument['type']) => {
    switch (type) {
      case 'offer_letter':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50';
      case 'salary_breakup':
        return 'bg-cyan-950/60 text-cyan-400 border-cyan-800/50';
      case 'recruiter_email':
      case 'recruiter_message':
        return 'bg-amber-950/60 text-amber-400 border-amber-800/50';
      case 'voice_recording':
        return 'bg-rose-950/60 text-rose-400 border-rose-800/50';
      default:
        return 'bg-indigo-950/60 text-indigo-400 border-indigo-800/50';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Active Investigation Dossier
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {documents.length} {documents.length === 1 ? 'document' : 'documents'}
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Cross-referenced by OfferLens to detect divergences and missing clauses
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onRunAnalysis}
          disabled={isAnalyzing || documents.length === 0}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          {isAnalyzing ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>Running Reality Check...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Run Offer Reality Check</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition flex flex-col justify-between space-y-3 group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getTypeBadgeClass(
                    doc.type
                  )}`}
                >
                  {getTypeIcon(doc.type)}
                  {doc.type.replace('_', ' ').toUpperCase()}
                </span>

                {doc.redactions && doc.redactions.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-800/30">
                    <ShieldCheck className="w-3 h-3" />
                    {doc.redactions.length} masked
                  </span>
                )}
              </div>

              <h4 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                {doc.title}
              </h4>

              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {(doc.sanitizedText || doc.rawText).slice(0, 140)}...
              </p>
            </div>

            <div className="pt-2.5 border-t border-slate-700/40 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 font-mono">
                {Math.round((doc.rawText || '').split(/\s+/).length)} words
              </span>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onViewDocument(doc)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition"
                  title="View & Inspect Document"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onRemoveDocument(doc.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
                  title="Remove from Dossier"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
