import React from 'react';
import { DossierDocument } from '../types.js';
import {
  X,
  FileSearch,
  ExternalLink,
  ShieldCheck,
  FileText,
  Copy,
  Check,
} from 'lucide-react';

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  docTitle: string;
  snippet: string;
  targetDoc: DossierDocument | null;
  onOpenFullDoc: (doc: DossierDocument) => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  isOpen,
  onClose,
  docTitle,
  snippet,
  targetDoc,
  onOpenFullDoc,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Find snippet context in document if available
  let beforeContext = '';
  let afterContext = '';
  if (targetDoc && snippet) {
    const fullText = targetDoc.sanitizedText || targetDoc.rawText;
    const cleanSnippet = snippet.trim();
    const idx = fullText.indexOf(cleanSnippet);
    if (idx !== -1) {
      beforeContext = fullText.slice(Math.max(0, idx - 180), idx);
      afterContext = fullText.slice(idx + cleanSnippet.length, idx + cleanSnippet.length + 180);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl text-slate-100 overflow-hidden space-y-0">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Verbatim Evidence Inspector</h3>
              <p className="text-xs text-slate-400">
                Source Document: <span className="text-slate-200 font-semibold">{docTitle}</span>
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

        {/* Snippet Card */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Flagged Text Snippet:</span>
            <button
              onClick={handleCopy}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono transition"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Quote'}
            </button>
          </div>

          {/* Context view */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 font-mono text-xs leading-relaxed">
            {beforeContext && (
              <span className="text-slate-500 opacity-60">...{beforeContext}</span>
            )}
            <mark className="bg-amber-500/25 text-amber-200 border-b-2 border-amber-400 px-1 py-0.5 rounded font-semibold">
              {snippet}
            </mark>
            {afterContext && (
              <span className="text-slate-500 opacity-60">{afterContext}...</span>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-300 space-y-1">
            <span className="font-semibold text-emerald-400 block">OfferLens Evidence Grounding</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Every contradiction and potentially concerning signal in OfferLens is directly grounded in literal text extracted from your uploaded documents. No hallucinations or ungrounded conclusions are permitted.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          {targetDoc ? (
            <button
              onClick={() => {
                onClose();
                onOpenFullDoc(targetDoc);
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1.5 transition"
            >
              <FileText className="w-4 h-4" />
              Open Full Document View
            </button>
          ) : (
            <div></div>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
