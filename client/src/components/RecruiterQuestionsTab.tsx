import React, { useState } from 'react';
import { RecruiterQuestion } from '../types.js';
import {
  MessageSquare,
  Copy,
  Check,
  Send,
  Sparkles,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

interface RecruiterQuestionsTabProps {
  questions: RecruiterQuestion[];
}

export const RecruiterQuestionsTab: React.FC<RecruiterQuestionsTabProps> = ({
  questions,
}) => {
  const [tonePreferences, setTonePreferences] = useState<Record<string, 'polite' | 'direct' | 'firm'>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getTone = (id: string) => tonePreferences[id] || 'polite';

  const setTone = (id: string, tone: 'polite' | 'direct' | 'firm') => {
    setTonePreferences((prev) => ({ ...prev, [id]: tone }));
  };

  const getScript = (q: RecruiterQuestion) => {
    const tone = getTone(q.id);
    switch (tone) {
      case 'direct':
        return q.scriptDirect;
      case 'firm':
        return q.scriptFirm;
      case 'polite':
      default:
        return q.scriptPolite;
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            Recruiter Inquiries & Negotiation Playbook ({questions.length})
          </h3>
          <p className="text-xs text-slate-400">
            Copy-paste ready, calibrated email & message scripts tailored to clarify each discrepancy
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q) => {
          const currentTone = getTone(q.id);
          const currentScript = getScript(q);
          const isCopied = copiedId === q.id;

          return (
            <div
              key={q.id}
              className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition shadow-xl space-y-4"
            >
              {/* Card Header & Tone Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {q.category}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">
                    {q.targetDiscrepancyOrIssue}
                  </h4>
                </div>

                {/* Tone Switcher Tabs */}
                <div className="flex items-center bg-slate-800/80 p-1 rounded-xl text-xs self-start sm:self-auto border border-slate-700">
                  <button
                    onClick={() => setTone(q.id, 'polite')}
                    className={`px-3 py-1 rounded-lg transition font-medium ${
                      currentTone === 'polite'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Polite & Enthusiastic
                  </button>
                  <button
                    onClick={() => setTone(q.id, 'direct')}
                    className={`px-3 py-1 rounded-lg transition font-medium ${
                      currentTone === 'direct'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Direct & Professional
                  </button>
                  <button
                    onClick={() => setTone(q.id, 'firm')}
                    className={`px-3 py-1 rounded-lg transition font-medium ${
                      currentTone === 'firm'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Firm Due Diligence
                  </button>
                </div>
              </div>

              {/* Rationale callout */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start space-x-2.5 text-xs text-slate-300">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200 block mb-0.5">Strategic Intent:</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{q.rationale}</p>
                </div>
              </div>

              {/* Script Box */}
              <div className="relative rounded-xl bg-slate-950/90 border border-slate-800 p-4">
                <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 mb-2 border-b border-slate-800/60 font-mono">
                  <span>Selected Tone: {currentTone.toUpperCase()}</span>
                  <button
                    onClick={() => handleCopy(q.id, currentScript)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Script</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed select-text">
                  {currentScript}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
