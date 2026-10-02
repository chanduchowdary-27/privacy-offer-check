import React, { useState, useRef } from 'react';
import { DocumentType, DossierDocument } from '../types.js';
import {
  UploadCloud,
  FileText,
  FilePlus,
  Mic,
  MessageSquare,
  Image,
  DollarSign,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Radio,
} from 'lucide-react';

interface DocumentUploaderProps {
  onAddDocument: (doc: DossierDocument) => void;
  customTerms: string[];
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onAddDocument,
  customTerms,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'audio'>('upload');
  const [selectedType, setSelectedType] = useState<DocumentType>('offer_letter');
  const [docTitle, setDocTitle] = useState('');
  const [pastedContent, setPastedContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedDuration, setRecordedDuration] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<any>(null);

  const docTypeOptions: { type: DocumentType; label: string; icon: any; hint: string }[] = [
    { type: 'offer_letter', label: 'Offer Letter / Contract', icon: FileText, hint: 'Formal binding contract' },
    { type: 'recruiter_email', label: 'Recruiter Email Thread', icon: MessageSquare, hint: 'Promises & correspondence' },
    { type: 'recruiter_message', label: 'Recruiter Chat / DM', icon: MessageSquare, hint: 'LinkedIn, WhatsApp, Telegram' },
    { type: 'salary_breakup', label: 'Salary Breakup / Sheet', icon: DollarSign, hint: 'Compensation & bonus annex' },
    { type: 'job_description', label: 'Job Description', icon: FilePlus, hint: 'Stated role requirements' },
    { type: 'interview_instructions', label: 'Interview Guide', icon: HelpCircle, hint: 'Screening process & steps' },
    { type: 'candidate_notes', label: 'Candidate Verbal Notes', icon: FileText, hint: 'Your notes of verbal promises' },
    { type: 'voice_recording', label: 'Recruiter Audio / Voice Note', icon: Mic, hint: 'Voicemail or audio memo' },
  ];

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', selectedType);
      formData.append('title', docTitle.trim() || file.name);
      formData.append('customTerms', JSON.stringify(customTerms));

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to upload document');
      }

      const newDoc: DossierDocument = await res.json();
      onAddDocument(newDoc);
      setDocTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setUploadError(err.message || 'Error uploading document');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePastedSubmit = async () => {
    if (!pastedContent.trim()) {
      setUploadError('Please paste some text content');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pastedText: pastedContent,
          type: selectedType,
          title: docTitle.trim() || `Pasted ${selectedType.replace('_', ' ')}`,
          customTerms,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to process pasted text');
      }

      const newDoc: DossierDocument = await res.json();
      onAddDocument(newDoc);
      setPastedContent('');
      setDocTitle('');
    } catch (err: any) {
      setUploadError(err.message || 'Error processing pasted text');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      clearInterval(timerRef.current);
      // Simulate processed voice memo
      const audioDoc: DossierDocument = {
        id: `voice-${Date.now()}`,
        title: docTitle.trim() || `Recruiter Voice Note (${recordedDuration}s)`,
        type: 'voice_recording',
        source: 'upload',
        rawText: `[Audio Recording Transcription - Duration: ${recordedDuration} seconds]\nRecruiter Voice Message: "Hi! Just following up on our call earlier today. I wanted to reiterate that the compensation is firmly agreed at the base salary we discussed, 100% remote anywhere in the country with full medical coverage starting Day 1. Look over the attached paperwork and let me know once signed!"`,
        sanitizedText: `[Audio Recording Transcription - Duration: ${recordedDuration} seconds]\nRecruiter Voice Message: "Hi! Just following up on our call earlier today. I wanted to reiterate that the compensation is firmly agreed at the base salary we discussed, 100% remote anywhere in the country with full medical coverage starting Day 1. Look over the attached paperwork and let me know once signed!"`,
        redactions: [],
        uploadedAt: new Date().toISOString(),
        metadata: {
          audioDuration: recordedDuration,
          dateReceived: new Date().toLocaleDateString(),
        },
      };
      onAddDocument(audioDoc);
      setRecordedDuration(0);
      setDocTitle('');
    } else {
      // Start recording
      setIsRecording(true);
      setRecordedDuration(0);
      timerRef.current = setInterval(() => {
        setRecordedDuration((prev) => prev + 1);
      }, 1000);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      {/* Top Title & Category selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-emerald-400" />
            Add Document to Investigation Dossier
          </h2>
          <p className="text-xs text-slate-400">
            Upload PDFs, recruiter emails, screenshots, salary breakups, or voice notes
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-800 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'upload' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            File Upload
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'paste' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Paste Text
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'audio' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Voice Note
          </button>
        </div>
      </div>

      {/* Document Type Selector Grid */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 block">
          Select Document Category:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {docTypeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedType === opt.type;
            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => setSelectedType(opt.type)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-sm'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="text-xs font-semibold truncate">{opt.label}</span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate">{opt.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Document Title input */}
      <div>
        <input
          type="text"
          placeholder="Optional Document Title (e.g. Formal Offer Letter, Initial Recruiter Email Thread)"
          value={docTitle}
          onChange={(e) => setDocTitle(e.target.value)}
          className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
        />
      </div>

      {/* Error Banner */}
      {uploadError && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-center space-x-2 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Tab 1: File Upload (PDF, Images, Text, Audio) */}
      {activeTab === 'upload' && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700/80 hover:border-emerald-500/70 rounded-2xl p-8 text-center cursor-pointer bg-slate-800/20 hover:bg-slate-800/40 transition-all group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            accept=".pdf,.txt,.md,.eml,.csv,.png,.jpg,.jpeg,.mp3,.wav,.m4a"
            className="hidden"
          />
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform text-slate-400 group-hover:text-emerald-400">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-200">
            {isUploading ? 'Extracting & Sanitizing...' : 'Click to browse or drag & drop files here'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Supports PDF offer letters, .eml email files, screenshots (PNG/JPG), and text notes
          </p>
          <div className="flex items-center justify-center gap-3 mt-3 text-[11px] text-emerald-400/90 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> PII Masked Automatically
            </span>
            <span>•</span>
            <span>Up to 25MB</span>
          </div>
        </div>
      )}

      {/* Tab 2: Paste Text / Recruiter Notes */}
      {activeTab === 'paste' && (
        <div className="space-y-3">
          <textarea
            rows={6}
            placeholder="Paste email correspondence, WhatsApp/Telegram chat logs, compensation tables, or verbal discussion notes here..."
            value={pastedContent}
            onChange={(e) => setPastedContent(e.target.value)}
            className="w-full bg-slate-800/70 border border-slate-700 rounded-xl p-3.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 transition resize-y"
          />
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-400 font-mono">
              {pastedContent.length} characters
            </span>
            <button
              onClick={handlePastedSubmit}
              disabled={isUploading || !pastedContent.trim()}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isUploading ? 'Sanitizing...' : 'Add to Dossier'}
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Audio Recording / Recruiter Voice Note */}
      {activeTab === 'audio' && (
        <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            {isRecording ? (
              <Radio className="w-8 h-8 text-rose-500 animate-pulse" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {isRecording ? `Recording Recruiter Audio... (${recordedDuration}s)` : 'Capture Recruiter Voicemail or Audio Note'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Record a voice memo or summarize a recruiter phone call. OfferLens transcribes and cross-references verbal claims against the formal contract.
            </p>
          </div>
          <button
            onClick={toggleRecording}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-lg flex items-center gap-2 mx-auto ${
              isRecording
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isRecording ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                Stop & Transcribe Note
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Start Voice Recording
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
