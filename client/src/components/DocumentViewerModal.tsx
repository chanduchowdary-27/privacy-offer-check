import React, { useState } from 'react';
import { DossierDocument } from '../types.js';
import {
  X,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
  FileText,
  Lock,
} from 'lucide-react';

interface DocumentViewerModalProps {
  document: DossierDocument | null;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document,
  onClose,
}) => {
  const [showSanitized, setShowSanitized] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!document) return null;

  const contentToDisplay = showSanitized
    ? document.sanitizedText || document.rawText
    : document.rawText;

  const handleCopy = () => {
    navigator.clipboard.writeText(contentToDisplay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white truncate max-w-md">
                  {document.title}
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  {document.type.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Uploaded: {new Date(document.uploadedAt).toLocaleString()} • {document.source}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Toggle Sanitized vs Raw */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl text-xs">
              <button
                onClick={() => setShowSanitized(true)}
                className={`px-3 py-1 rounded-lg transition font-medium flex items-center gap-1.5 ${
                  showSanitized
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Sanitized View
              </button>
              <button
                onClick={() => setShowSanitized(false)}
                className={`px-3 py-1 rounded-lg transition font-medium flex items-center gap-1.5 ${
                  !showSanitized
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Original View
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Copy Text"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Masking summary banner */}
        {document.redactions && document.redactions.length > 0 && (
          <div className="px-6 py-2 bg-emerald-950/40 border-b border-emerald-900/30 flex items-center justify-between text-xs text-emerald-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5" />
              {document.redactions.length} personal tokens masked locally (Names, contact info, SSN, addresses)
            </span>
            <span className="text-[11px] text-emerald-400/80 font-mono">
              Mode: {showSanitized ? 'Privacy Masking Active' : 'Unmasked Raw'}
            </span>
          </div>
        )}

        {/* Content Viewer Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-950/60 font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap select-text">
          {contentToDisplay}
        </div>

        {/* Redactions list if any */}
        {document.redactions && document.redactions.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/90 max-h-36 overflow-y-auto">
            <span className="text-xs font-semibold text-slate-300 block mb-2">
              Detected Personal Identifiers (PII) Audit Trail:
            </span>
            <div className="flex flex-wrap gap-2">
              {document.redactions.map((red, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] font-mono flex items-center gap-2"
                >
                  <span className="text-slate-400 line-through truncate max-w-[120px]">
                    {showSanitized ? '••••••' : red.original}
                  </span>
                  <span className="text-emerald-400 font-semibold">{red.masked}</span>
                  <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-slate-700 text-slate-300">
                    {red.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
