import React, { useState, useEffect } from 'react';
import {
  DossierDocument,
  InvestigationReport,
  SampleDossierSummary,
} from './types.js';
import { Header } from './components/Header.js';
import { PrivacyShieldModal } from './components/PrivacyShieldModal.js';
import { SampleDossierSelector } from './components/SampleDossierSelector.js';
import { DocumentUploader } from './components/DocumentUploader.js';
import { DocumentShelf } from './components/DocumentShelf.js';
import { DocumentViewerModal } from './components/DocumentViewerModal.js';
import { ExecutiveScorecard } from './components/ExecutiveScorecard.js';
import { ContradictionsTab } from './components/ContradictionsTab.js';
import { ConcerningSignalsTab } from './components/ConcerningSignalsTab.js';
import { ClaimVsOfferMatrixTab } from './components/ClaimVsOfferMatrixTab.js';
import { MissingInfoTab } from './components/MissingInfoTab.js';
import { RecruiterQuestionsTab } from './components/RecruiterQuestionsTab.js';
import { StructuredFactsTab } from './components/StructuredFactsTab.js';
import { EvidenceDrawer } from './components/EvidenceDrawer.js';
import { ExportReportModal } from './components/ExportReportModal.js';
import {
  FileSearch,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FolderOpen,
  ArrowRight,
  AlertTriangle,
  Layers,
  Lock,
} from 'lucide-react';

export function App() {
  // Main state
  const [documents, setDocuments] = useState<DossierDocument[]>([]);
  const [report, setReport] = useState<InvestigationReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('contradictions');

  // Privacy & API settings
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('offerlens_gemini_api_key') || '';
  });
  const [useGemini, setUseGemini] = useState<boolean>(() => {
    return localStorage.getItem('offerlens_use_gemini') === 'true';
  });
  const [customTerms, setCustomTerms] = useState<string[]>(() => {
    const saved = localStorage.getItem('offerlens_custom_terms');
    return saved ? JSON.parse(saved) : [];
  });

  // Sample dossiers
  const [samples, setSamples] = useState<SampleDossierSummary[]>([]);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);

  // Modals state
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<DossierDocument | null>(null);

  // Evidence drawer state
  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false);
  const [evidenceSnippet, setEvidenceSnippet] = useState('');
  const [evidenceDocTitle, setEvidenceDocTitle] = useState('');
  const [evidenceDocId, setEvidenceDocId] = useState('');

  // Fetch sample metadata on initial load
  useEffect(() => {
    const fetchSamples = async () => {
      try {
        setIsLoadingSamples(true);
        const res = await fetch('/api/samples');
        if (res.ok) {
          const data = await res.json();
          setSamples(data);
          // If workspace is completely empty, auto-load the first realistic sample so the user is immediately greeted by a full investigation!
          if (data.length > 0 && documents.length === 0) {
            handleSelectSample(data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load sample dossiers:', err);
      } finally {
        setIsLoadingSamples(false);
      }
    };

    fetchSamples();
  }, []);

  // Save settings in localStorage
  const handleSaveApiKey = (key: string) => {
    setGeminiApiKey(key);
    localStorage.setItem('offerlens_gemini_api_key', key);
    if (key) {
      setUseGemini(true);
      localStorage.setItem('offerlens_use_gemini', 'true');
    }
  };

  const handleSetUseGemini = (val: boolean) => {
    setUseGemini(val);
    localStorage.setItem('offerlens_use_gemini', val ? 'true' : 'false');
  };

  const handleUpdateCustomTerms = (terms: string[]) => {
    setCustomTerms(terms);
    localStorage.setItem('offerlens_custom_terms', JSON.stringify(terms));
  };

  // Add document to dossier
  const handleAddDocument = (newDoc: DossierDocument) => {
    setDocuments((prev) => [newDoc, ...prev]);
    // Clear old report when docs change
    setReport(null);
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setReport(null);
  };

  const handleResetDossier = () => {
    setDocuments([]);
    setReport(null);
    setActiveTab('contradictions');
  };

  // Load sample case
  const handleSelectSample = async (id: string) => {
    setIsSampleModalOpen(false);
    setIsAnalyzing(true);
    try {
      const res = await fetch(`/api/samples/${id}`);
      if (res.ok) {
        const fullSample = await res.json();
        setDocuments(fullSample.documents);

        // Run analysis on the loaded sample immediately
        const analyzeRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(geminiApiKey ? { 'x-gemini-api-key': geminiApiKey } : {}),
          },
          body: JSON.stringify({
            documents: fullSample.documents,
            dossierTitle: fullSample.title,
            useGemini: useGemini && !!geminiApiKey,
            userApiKey: geminiApiKey,
          }),
        });

        if (analyzeRes.ok) {
          const reportData = await analyzeRes.json();
          setReport(reportData);
          setActiveTab('contradictions');
        }
      }
    } catch (err) {
      console.error('Error loading sample dossier:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run analysis on current documents
  const handleRunAnalysis = async () => {
    if (documents.length === 0) return;

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(geminiApiKey ? { 'x-gemini-api-key': geminiApiKey } : {}),
        },
        body: JSON.stringify({
          documents,
          dossierTitle: 'Job Offer Reality Check Investigation',
          useGemini: useGemini && !!geminiApiKey,
          userApiKey: geminiApiKey,
        }),
      });

      if (res.ok) {
        const reportData = await res.json();
        setReport(reportData);
        setActiveTab('contradictions');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to complete analysis');
      }
    } catch (err: any) {
      alert(`Error running analysis: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Open Evidence Drawer
  const handleInspectEvidence = (docId: string, snippet: string, title: string) => {
    setEvidenceDocId(docId);
    setEvidenceSnippet(snippet);
    setEvidenceDocTitle(title);
    setEvidenceDrawerOpen(true);
  };

  // Draft question navigation helper
  const handleDraftQuestion = (_topicOrTitle: string) => {
    setActiveTab('questions');
  };

  const totalRedactions = documents.reduce(
    (acc, d) => acc + (d.redactions ? d.redactions.length : 0),
    0
  );

  const targetDocForEvidence = documents.find((d) => d.id === evidenceDocId) || null;

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Header */}
      <Header
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        onOpenSampleModal={() => setIsSampleModalOpen(true)}
        onResetDossier={handleResetDossier}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        useGemini={useGemini}
        setUseGemini={handleSetUseGemini}
        hasApiKey={!!geminiApiKey}
        totalRedactions={totalRedactions}
        hasReport={!!report}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Hero / Context Banner if no documents */}
        {documents.length === 0 && (
          <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 shadow-2xl text-center space-y-5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Built for Job Seekers • 100% Privacy-First & Local-First</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight max-w-3xl mx-auto">
              Never get caught in a{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Job Offer Reality Gap
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Upload offer letters, recruiter emails, Slack/WhatsApp messages, or voice notes.
              OfferLens verifies recruiter promises against written contracts, detects concerning signals, and drafts tailored clarification scripts.
            </p>

            {/* Quick Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsSampleModalOpen(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition cursor-pointer"
              >
                <FolderOpen className="w-4 h-4" />
                Try Sample Realistic Offer Cases
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPrivacyModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-2 transition"
              >
                <Lock className="w-4 h-4 text-emerald-400" />
                Learn About Privacy & PII Masking
              </button>
            </div>
          </div>
        )}

        {/* Ingestion & Active Shelf Section */}
        <div className="space-y-6">
          <DocumentUploader
            onAddDocument={handleAddDocument}
            customTerms={customTerms}
          />

          <DocumentShelf
            documents={documents}
            onRemoveDocument={handleRemoveDocument}
            onViewDocument={(doc) => setViewingDoc(doc)}
            onRunAnalysis={handleRunAnalysis}
            isAnalyzing={isAnalyzing}
            useGemini={useGemini}
          />
        </div>

        {/* Investigation Report Dashboard */}
        {report && (
          <div className="space-y-6 animate-fadeIn">
            {/* Executive Scorecard */}
            <ExecutiveScorecard
              report={report}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            {/* Tab Body */}
            <div className="pt-2">
              {activeTab === 'contradictions' && (
                <ContradictionsTab
                  contradictions={report.contradictions}
                  onInspectEvidence={handleInspectEvidence}
                  onDraftQuestion={handleDraftQuestion}
                />
              )}

              {activeTab === 'signals' && (
                <ConcerningSignalsTab
                  signals={report.signals}
                  onInspectEvidence={handleInspectEvidence}
                />
              )}

              {activeTab === 'matrix' && (
                <ClaimVsOfferMatrixTab matrix={report.claimVsOfferMatrix} />
              )}

              {activeTab === 'missing' && (
                <MissingInfoTab
                  missingItems={report.missingInformation}
                  onDraftQuestion={handleDraftQuestion}
                />
              )}

              {activeTab === 'questions' && (
                <RecruiterQuestionsTab questions={report.recruiterQuestions} />
              )}

              {activeTab === 'facts' && (
                <StructuredFactsTab
                  facts={report.consolidatedFacts}
                  timeline={report.timelineChronology}
                  onInspectEvidence={handleInspectEvidence}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-400">OfferLens</span>
            <span>•</span>
            <span>Privacy-First Job Offer Reality Checker</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>Client-side PII Sanitizer</span>
            <span>•</span>
            <span>Zero Persistent Server Retention</span>
            <span>•</span>
            <span className="text-emerald-400">The final decision always belongs to the user</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <PrivacyShieldModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        apiKey={geminiApiKey}
        onSaveApiKey={handleSaveApiKey}
        customTerms={customTerms}
        onUpdateCustomTerms={handleUpdateCustomTerms}
        totalRedactions={totalRedactions}
      />

      <SampleDossierSelector
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        samples={samples}
        onSelectSample={handleSelectSample}
        isLoading={isLoadingSamples}
      />

      <DocumentViewerModal
        document={viewingDoc}
        onClose={() => setViewingDoc(null)}
      />

      <EvidenceDrawer
        isOpen={evidenceDrawerOpen}
        onClose={() => setEvidenceDrawerOpen(false)}
        docTitle={evidenceDocTitle}
        snippet={evidenceSnippet}
        targetDoc={targetDocForEvidence}
        onOpenFullDoc={(doc) => setViewingDoc(doc)}
      />

      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        report={report}
        documents={documents}
      />
    </div>
  );
}

export default App;
