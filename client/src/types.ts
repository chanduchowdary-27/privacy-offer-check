export type DocumentType =
  | 'offer_letter'
  | 'job_description'
  | 'recruiter_email'
  | 'recruiter_message'
  | 'salary_breakup'
  | 'interview_instructions'
  | 'voice_recording'
  | 'candidate_notes';

export interface RedactionToken {
  original: string;
  masked: string;
  category: 'name' | 'email' | 'phone' | 'address' | 'financial' | 'custom';
  startIndex: number;
  endIndex: number;
}

export interface DossierDocument {
  id: string;
  title: string;
  type: DocumentType;
  rawText: string;
  sanitizedText: string;
  redactions: RedactionToken[];
  source: 'upload' | 'pasted' | 'sample';
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  uploadedAt: string;
  metadata?: {
    sender?: string;
    recipient?: string;
    dateReceived?: string;
    platform?: string;
    domain?: string;
    audioDuration?: number;
  };
}

export interface FactItem<T = string> {
  value: T;
  rawSnippet: string;
  sourceDocId: string;
  sourceDocTitle: string;
  confidence: number;
}

export interface StructuredFacts {
  roleTitle?: FactItem<string>;
  companyLegalEntity?: FactItem<string>;
  companyBrandName?: FactItem<string>;
  baseSalary?: FactItem<{
    amount: number;
    currency: string;
    period: 'annual' | 'monthly' | 'hourly';
    formatted: string;
  }>;
  bonus?: FactItem<{
    type: 'guaranteed' | 'discretionary' | 'performance_kpi' | 'none' | 'unspecified';
    amountOrPercentage: string;
    criteria?: string;
  }>;
  equity?: FactItem<{
    grantType: 'options' | 'rsu' | 'phantom' | 'none' | 'unspecified';
    amount: string;
    vestingSchedule: string;
    cliff: string;
    strikePrice?: string;
    shareCountTotal?: string;
    exerciseWindow?: string;
  }>;
  signingBonus?: FactItem<{
    amount: string;
    clawbackTerms?: string;
    clawbackMonths?: number;
  }>;
  workLocation?: FactItem<{
    arrangement: 'remote' | 'hybrid' | 'onsite' | 'unspecified';
    officeLocation?: string;
    requiredDaysInOffice?: number;
    travelRequirement?: string;
  }>;
  benefits?: FactItem<{
    healthInsurance: string;
    dentalVision: string;
    retirement401k: string;
    equipmentPolicy: string;
    ptoPolicy: string;
  }>;
  governance?: FactItem<{
    atWill: boolean;
    probationDays?: number;
    noticeDays?: number;
    nonCompeteMonths?: number;
    nonCompeteScope?: string;
    ipAssignmentScope: 'broad' | 'standard' | 'restricted' | 'unspecified';
    arbitrationMandatory?: boolean;
  }>;
  deadline?: FactItem<{
    expirationDate?: string;
    timeLimitHours?: number;
  }>;
  recruiterChannel?: FactItem<{
    emailAddress?: string;
    domain?: string;
    platform?: string;
    domainStatus?: 'legitimate' | 'mismatch' | 'free_webmail' | 'suspicious' | 'unverified';
  }>;
}

export interface Contradiction {
  id: string;
  category:
    | 'compensation'
    | 'work_location'
    | 'role_responsibilities'
    | 'benefits_pto'
    | 'probation_security'
    | 'equipment_expenses'
    | 'equity_vesting'
    | 'deadlines';
  title: string;
  severity: 'high' | 'moderate' | 'low';
  summary: string;
  claimA: {
    docId: string;
    docTitle: string;
    docType: DocumentType;
    snippet: string;
    speakerOrChannel: string;
  };
  claimB: {
    docId: string;
    docTitle: string;
    docType: DocumentType;
    snippet: string;
    speakerOrChannel: string;
  };
  impactAssessment: string;
  uncertaintyExplanation: string;
  recommendedVerification: string;
}

export interface PotentiallyConcerningSignal {
  id: string;
  category:
    | 'financial_payment_request'
    | 'domain_communication_anomaly'
    | 'restrictive_contract_clause'
    | 'artificial_urgency'
    | 'ambiguous_entity_or_process';
  severity: 'high' | 'moderate' | 'info';
  signalType: string;
  title: string;
  description: string;
  calibratedLanguage: string;
  evidence: Array<{
    docId: string;
    docTitle: string;
    snippet: string;
    contextHint?: string;
  }>;
  uncertaintyAndContext: string;
  suggestedAction: string;
}

export interface MissingInformationItem {
  id: string;
  topic: string;
  importance: 'essential' | 'recommended' | 'beneficial';
  whyItMatters: string;
  whatIsMissing: string;
  suggestedQuestion: string;
}

export interface RecruiterQuestion {
  id: string;
  targetDiscrepancyOrIssue: string;
  category: 'clarification' | 'due_diligence' | 'compensation' | 'timeline' | 'remote_policy' | 'contract';
  scriptPolite: string;
  scriptDirect: string;
  scriptFirm: string;
  rationale: string;
}

export interface ClaimVsOfferItem {
  parameter: string;
  category: string;
  recruiterStated: string;
  contractStated: string;
  alignmentStatus: 'matched' | 'contradicted' | 'unmentioned_in_offer' | 'unmentioned_by_recruiter' | 'partially_aligned';
  sourceClaimSnippet?: string;
  sourceContractSnippet?: string;
}

export interface InvestigationReport {
  id: string;
  dossierTitle: string;
  companyName: string;
  candidateRole: string;
  generatedAt: string;
  documentCount: number;
  overallAlignmentScore: number;
  uncertaintyRating: 'low' | 'moderate' | 'high';
  calibratedVerdictSummary: string;
  privacySummary: {
    piiTokensMasked: number;
    processingMode: 'local_deterministic' | 'local_with_gemini_ai';
    zeroServerRetention: boolean;
  };
  signalsSummary: {
    highCount: number;
    moderateCount: number;
    infoCount: number;
  };
  contradictionsCount: number;
  missingItemsCount: number;
  claimVsOfferMatrix: ClaimVsOfferItem[];
  contradictions: Contradiction[];
  signals: PotentiallyConcerningSignal[];
  missingInformation: MissingInformationItem[];
  recruiterQuestions: RecruiterQuestion[];
  consolidatedFacts: StructuredFacts;
  timelineChronology: Array<{
    date: string;
    docTitle: string;
    docType: DocumentType;
    eventSummary: string;
  }>;
}

export interface SampleDossierSummary {
  id: string;
  title: string;
  company: string;
  role: string;
  scenarioType: 'bait_and_switch' | 'payment_red_flag' | 'opaque_startup' | 'clean_offer';
  summaryDescription: string;
  keyDivergenceHint: string;
  docCount: number;
}
