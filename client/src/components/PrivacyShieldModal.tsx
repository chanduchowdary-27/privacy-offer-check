import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Key,
  EyeOff,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  Cpu,
  Info,
} from 'lucide-react';

interface PrivacyShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  customTerms: string[];
  onUpdateCustomTerms: (terms: string[]) => void;
  totalRedactions: number;
}

export const PrivacyShieldModal: React.FC<PrivacyShieldModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  customTerms,
  onUpdateCustomTerms,
  totalRedactions,
}) => {
  const [keyInput, setKeyInput] = useState(apiKey);
  const [newTerm, setNewTerm] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    onSaveApiKey(keyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddTerm = () => {
    if (newTerm.trim() && !customTerms.includes(newTerm.trim())) {
      onUpdateCustomTerms([...customTerms, newTerm.trim()]);
      setNewTerm('');
    }
  };

  const handleRemoveTerm = (termToRemove: string) => {
    onUpdateCustomTerms(customTerms.filter((t) => t !== termToRemove));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Privacy Shield & AI Configuration
              </h2>
              <p className="text-xs text-slate-400">
                Guaranteed zero server retention & client-side PII sanitization
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

        <div className="p-6 space-y-6">
          {/* Privacy Guarantee Card */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/30 space-y-2.5">
            <div className="flex items-center space-x-2 text-emerald-300 font-semibold text-sm">
              <Lock className="w-4 h-4" />
              <span>How OfferLens Protects Your Confidentiality</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Job offers and recruiter communications contain sensitive personal and financial data. OfferLens is built from the ground up on three non-negotiable principles:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                <span className="font-semibold text-emerald-400 block mb-0.5">1. Local-First Engine</span>
                <span className="text-slate-400 text-[11px]">Fact extraction and contradiction detection run 100% locally.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                <span className="font-semibold text-teal-400 block mb-0.5">2. PII Sanitizer</span>
                <span className="text-slate-400 text-[11px]">Names, SSNs, phone numbers, and addresses are automatically masked.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                <span className="font-semibold text-cyan-400 block mb-0.5">3. Zero Data Retention</span>
                <span className="text-slate-400 text-[11px]">Uploaded documents are stored in memory only and never saved to a database.</span>
              </div>
            </div>
            {totalRedactions > 0 && (
              <div className="flex items-center space-x-2 pt-2 text-xs font-mono text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>{totalRedactions} sensitive items masked in your active dossier.</span>
              </div>
            )}
          </div>

          {/* Custom Redaction Terms */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <EyeOff className="w-4 h-4 text-emerald-400" />
                Custom Redaction Words
              </label>
              <span className="text-[11px] text-slate-400">Add words you want masked (e.g. current company name)</span>
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="e.g. Acme Corp, Project X, Dr. Miller"
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTerm()}
                className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
              />
              <button
                onClick={handleAddTerm}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            {customTerms.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {customTerms.map((term) => (
                  <span
                    key={term}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-300"
                  >
                    <span>{term}</span>
                    <button
                      onClick={() => handleRemoveTerm(term)}
                      className="text-slate-400 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Gemini AI API Key (Optional) */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-amber-400" />
                Google Gemini API Key (Optional)
              </label>
              <span className="text-[11px] text-emerald-400 font-medium">Supports Gemini 3.8 Flash</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              OfferLens works completely offline using its deterministic rule engine. If you provide a Gemini API key, OfferLens can optionally leverage Gemini 3.8 Flash for deep contextual nuance and custom negotiation scripts. <strong>Only pre-sanitized text with personal info masked is ever sent.</strong>
            </p>
            <div className="flex space-x-2">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500 transition"
              />
              <button
                onClick={handleSaveKey}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-semibold shadow-md transition"
              >
                Save Key
              </button>
            </div>
            {savedSuccess && (
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Key saved securely to your browser local storage!
              </p>
            )}
          </div>

          {/* Model info banner */}
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-start space-x-2.5 text-xs text-slate-400">
            <Cpu className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-300 font-medium block">Privacy-First Architecture Notice</span>
              Your documents never touch a database or persistent server log. When you close or refresh this tab, all in-memory text is immediately discarded.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-xl transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
