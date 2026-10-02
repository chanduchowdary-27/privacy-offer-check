import {
  ClaimVsOfferItem,
  Contradiction,
  DossierDocument,
  InvestigationReport,
  MissingInformationItem,
  PotentiallyConcerningSignal,
  RecruiterQuestion,
  StructuredFacts,
} from './types.js';

/**
 * Deterministic Local Reality Check & Investigation Engine
 * 100% offline, privacy-first, zero external network dependency.
 */
export function analyzeDossierLocally(
  documents: DossierDocument[],
  dossierTitle: string = 'Job Offer Dossier'
): InvestigationReport {
  const docMap = new Map<string, DossierDocument>();
  for (const doc of documents) {
    docMap.set(doc.id, doc);
  }

  // 1. Group documents by primary roles
  const offerLetters = documents.filter((d) => d.type === 'offer_letter' || d.type === 'salary_breakup');
  const recruiterComms = documents.filter(
    (d) => d.type === 'recruiter_email' || d.type === 'recruiter_message' || d.type === 'voice_recording'
  );
  const candidateNotes = documents.filter((d) => d.type === 'candidate_notes');
  const jobDescriptions = documents.filter((d) => d.type === 'job_description');

  // Primary formal contract (if available)
  const formalDoc = offerLetters[0] || documents[0];
  // Primary recruiter promise doc (if available)
  const recruiterDoc = recruiterComms[0] || candidateNotes[0] || documents[1] || formalDoc;

  // 2. Extract facts from each document
  const consolidatedFacts: StructuredFacts = {};

  extractFactsFromDocs(documents, consolidatedFacts);

  // 3. Detect cross-document contradictions
  const contradictions: Contradiction[] = [];
  detectContradictions(documents, offerLetters, recruiterComms, candidateNotes, contradictions);

  // 4. Detect potentially concerning signals
  const signals: PotentiallyConcerningSignal[] = [];
  detectConcerningSignals(documents, signals);

  // 5. Audit missing information
  const missingInformation: MissingInformationItem[] = [];
  auditMissingInformation(documents, consolidatedFacts, missingInformation);

  // 6. Build side-by-side Claim vs Offer Matrix
  const claimVsOfferMatrix: ClaimVsOfferItem[] = buildClaimVsOfferMatrix(
    recruiterComms,
    offerLetters,
    candidateNotes,
    consolidatedFacts
  );

  // 7. Generate recruiter question scripts
  const recruiterQuestions: RecruiterQuestion[] = generateRecruiterQuestions(
    contradictions,
    signals,
    missingInformation,
    consolidatedFacts
  );

  // 8. Build Chronology Timeline
  const timelineChronology = buildTimeline(documents);

  // 9. Calculate alignment score and calibrated verdict
  const highSignals = signals.filter((s) => s.severity === 'high').length;
  const modSignals = signals.filter((s) => s.severity === 'moderate').length;
  const infoSignals = signals.filter((s) => s.severity === 'info').length;

  let alignmentScore = 100;
  // Penalize based on contradictions and signals
  alignmentScore -= contradictions.length * 14;
  alignmentScore -= highSignals * 20;
  alignmentScore -= modSignals * 8;
  alignmentScore -= missingInformation.filter((m) => m.importance === 'essential').length * 4;
  alignmentScore = Math.max(10, Math.min(98, Math.round(alignmentScore)));

  let uncertaintyRating: 'low' | 'moderate' | 'high' = 'moderate';
  if (documents.length >= 3 && offerLetters.length >= 1) {
    uncertaintyRating = 'low';
  } else if (documents.length === 1) {
    uncertaintyRating = 'high';
  }

  const calibratedVerdictSummary = buildCalibratedSummary(
    contradictions,
    signals,
    missingInformation,
    alignmentScore,
    uncertaintyRating
  );

  const candidateRole = consolidatedFacts.roleTitle?.value || 'Prospective Role';
  const companyName =
    consolidatedFacts.companyBrandName?.value || consolidatedFacts.companyLegalEntity?.value || 'Prospective Employer';

  const totalRedactions = documents.reduce((acc, d) => acc + (d.redactions?.length || 0), 0);

  return {
    id: `report-${Date.now()}`,
    dossierTitle,
    companyName,
    candidateRole,
    generatedAt: new Date().toISOString(),
    documentCount: documents.length,
    overallAlignmentScore: alignmentScore,
    uncertaintyRating,
    calibratedVerdictSummary,
    privacySummary: {
      piiTokensMasked: totalRedactions,
      processingMode: 'local_deterministic',
      zeroServerRetention: true,
    },
    signalsSummary: {
      highCount: highSignals,
      moderateCount: modSignals,
      infoCount: infoSignals,
    },
    contradictionsCount: contradictions.length,
    missingItemsCount: missingInformation.length,
    claimVsOfferMatrix,
    contradictions,
    signals,
    missingInformation,
    recruiterQuestions,
    consolidatedFacts,
    timelineChronology,
  };
}

/**
 * Fact Extraction Engine
 */
function extractFactsFromDocs(docs: DossierDocument[], facts: StructuredFacts) {
  for (const doc of docs) {
    const text = doc.rawText || doc.sanitizedText || '';

    // Role Title
    if (!facts.roleTitle) {
      const titleMatch = text.match(/(?:position of|role of|title of|Title:|Position:|Role:)\s+([A-Z][A-Za-z0-9\s/,-]{3,40})/i);
      if (titleMatch) {
        facts.roleTitle = {
          value: titleMatch[1].trim().replace(/[.,;]$/, ''),
          rawSnippet: titleMatch[0],
          sourceDocId: doc.id,
          sourceDocTitle: doc.title,
          confidence: 0.9,
        };
      }
    }

    // Company Entity
    if (!facts.companyLegalEntity) {
      const entityMatch = text.match(/\b([A-Z][A-Za-z0-9&.,\s]{2,40}\s+(?:LLC|Inc\.|Inc|Corp\.|Corporation|Ltd\.|Limited|Technologies Inc|Holdings LLC))\b/);
      if (entityMatch) {
        facts.companyLegalEntity = {
          value: entityMatch[1].trim(),
          rawSnippet: entityMatch[0],
          sourceDocId: doc.id,
          sourceDocTitle: doc.title,
          confidence: 0.88,
        };
      }
    }

    // Base Salary
    const salaryMatch = text.match(/(?:base salary|annual salary|starting salary|compensation of|base compensation|salary of|rate of)\s*(?:is|of|:)?\s*\$?([\d,]{4,9})(?:\s*(?:USD|\$|per year|\/year|annually))/i)
      || text.match(/\$([\d,]{5,8})(?:\s*(?:per year|\/year|annually|base))/i);
    
    if (salaryMatch) {
      const num = parseInt(salaryMatch[1].replace(/,/g, ''), 10);
      if (!isNaN(num) && num > 15000 && num < 2000000) {
        // If from an offer letter, it takes precedence
        if (!facts.baseSalary || doc.type === 'offer_letter') {
          facts.baseSalary = {
            value: {
              amount: num,
              currency: 'USD',
              period: 'annual',
              formatted: `$${num.toLocaleString('en-US')}`,
            },
            rawSnippet: salaryMatch[0],
            sourceDocId: doc.id,
            sourceDocTitle: doc.title,
            confidence: doc.type === 'offer_letter' ? 0.95 : 0.85,
          };
        }
      }
    }

    // Bonus Structure
    if (!facts.bonus || doc.type === 'offer_letter') {
      const discBonus = text.match(/(?:discretionary|annual incentive|performance bonus|target bonus|discretionary bonus)[\s\w,.$%]{0,60}?(?:up to\s*)?(\$?\d[\d,]*%?|\d{1,2}%)/i);
      const isDiscretionary = /discretionary|at the discretion of|sole discretion/i.test(text);
      if (discBonus) {
        facts.bonus = {
          value: {
            type: isDiscretionary ? 'discretionary' : 'performance_kpi',
            amountOrPercentage: discBonus[1],
            criteria: isDiscretionary ? 'Sole management discretion' : 'Company/Individual performance metrics',
          },
          rawSnippet: discBonus[0],
          sourceDocId: doc.id,
          sourceDocTitle: doc.title,
          confidence: 0.9,
        };
      }
    }

    // Work Location / Remote policy
    if (!facts.workLocation || doc.type === 'offer_letter') {
      if (/100%\s*remote|fully remote|remote work arrangement|work from home permanently/i.test(text)) {
        facts.workLocation = {
          value: {
            arrangement: 'remote',
            officeLocation: 'Remote (Home Office)',
          },
          rawSnippet: '100% remote / work from home arrangement',
          sourceDocId: doc.id,
          sourceDocTitle: doc.title,
          confidence: 0.92,
        };
      } else {
        const hybridMatch = text.match(/(?:hybrid|in-office|onsite)[\s\w,]{0,40}?(\d)\s*days?(?:\s*(?:per|\/)\s*week)?/i);
        const cityMatch = text.match(/(?:office in|located in|based in|premises in)\s+([A-Z][a-zA-Z\s]{2,20},\s*[A-Z]{2})/);
        if (hybridMatch) {
          facts.workLocation = {
            value: {
              arrangement: 'hybrid',
              requiredDaysInOffice: parseInt(hybridMatch[1], 10),
              officeLocation: cityMatch ? cityMatch[1] : undefined,
            },
            rawSnippet: hybridMatch[0],
            sourceDocId: doc.id,
            sourceDocTitle: doc.title,
            confidence: 0.9,
          };
        } else if (/in-person|mandatory onsite|in our office/i.test(text)) {
          facts.workLocation = {
            value: {
              arrangement: 'onsite',
              officeLocation: cityMatch ? cityMatch[1] : undefined,
            },
            rawSnippet: cityMatch ? cityMatch[0] : 'In-office requirement',
            sourceDocId: doc.id,
            sourceDocTitle: doc.title,
            confidence: 0.85,
          };
        }
      }
    }

    // Equity / Stock Options
    if (!facts.equity || doc.type === 'offer_letter') {
      const eqMatch = text.match(/(\d[\d,]*)\s*(?:stock options|options|shares|RSUs|restricted stock units)/i);
      if (eqMatch) {
        const vestingMatch = text.match(/(\d)\s*year(?:s)?\s*(?:vesting|period)[\w\s,]{0,30}?(?:(\d)\s*year\s*cliff)?/i);
        const strikeMatch = text.match(/(?:exercise price|strike price)[\s\w,:]*?\$?([\d.]+)/i);
        facts.equity = {
          value: {
            grantType: /rsu/i.test(eqMatch[0]) ? 'rsu' : 'options',
            amount: eqMatch[1],
            vestingSchedule: vestingMatch ? vestingMatch[0] : 'Standard 4-year schedule (unstated)',
            cliff: vestingMatch && vestingMatch[2] ? `${vestingMatch[2]}-year cliff` : '1-year cliff (standard)',
            strikePrice: strikeMatch ? `$${strikeMatch[1]}` : undefined,
          },
          rawSnippet: eqMatch[0],
          sourceDocId: doc.id,
          sourceDocTitle: doc.title,
          confidence: 0.9,
        };
      }
    }

    // Restrictive Covenants (Non-compete & IP)
    if (!facts.governance || doc.type === 'offer_letter') {
      const nonCompeteMatch = text.match(/(?:non-compete|covenant not to compete)[\s\w,]{0,50}?(\d{1,2})\s*(?:months?|years?)/i);
      const ipBroad = /all inventions|whether or not during working hours|moral rights|prior inventions automatically belong/i.test(text);
      const probationMatch = text.match(/(?:probationary period|probation)[\s\w,]{0,40}?(\d{1,3})\s*(?:days?|months?)/i);
      
      facts.governance = {
        value: {
          atWill: /at-will employment|employment at will/i.test(text),
          probationDays: probationMatch ? (probationMatch[0].includes('month') ? parseInt(probationMatch[1], 10) * 30 : parseInt(probationMatch[1], 10)) : undefined,
          nonCompeteMonths: nonCompeteMatch ? (nonCompeteMatch[0].includes('year') ? parseInt(nonCompeteMatch[1], 10) * 12 : parseInt(nonCompeteMatch[1], 10)) : undefined,
          ipAssignmentScope: ipBroad ? 'broad' : 'standard',
        },
        rawSnippet: nonCompeteMatch ? nonCompeteMatch[0] : 'Standard governance',
        sourceDocId: doc.id,
        sourceDocTitle: doc.title,
        confidence: 0.85,
      };
    }

    // Expiration / Urgency
    if (!facts.deadline || doc.type === 'offer_letter') {
      const deadlineMatch = text.match(/(?:expires on|valid until|acceptance deadline|return this agreement by)\s*([A-Za-z]+ \d{1,2}, \d{4}|\d{1,2}\/\d{1,2}\/\d{4})/i)
        || text.match(/(?:within\s*)(\d{1,2})\s*(?:hours?|business days?)/i);
      if (deadlineMatch) {
        facts.deadline = {
          value: {
            expirationDate: deadlineMatch[1],
            timeLimitHours: deadlineMatch[0].includes('hour') ? parseInt(deadlineMatch[1], 10) : undefined,
          },
          rawSnippet: deadlineMatch[0],
          sourceDocId: doc.id,
          sourceDocTitle: doc.title,
          confidence: 0.9,
        };
      }
    }
  }
}

/**
 * Cross-Document Contradiction & Delta Engine
 */
function detectContradictions(
  allDocs: DossierDocument[],
  offerDocs: DossierDocument[],
  recruiterDocs: DossierDocument[],
  candidateNotes: DossierDocument[],
  contradictions: Contradiction[]
) {
  if (offerDocs.length === 0 || (recruiterDocs.length === 0 && candidateNotes.length === 0)) {
    return;
  }

  const contractDoc = offerDocs[0];
  const commsDoc = recruiterDocs[0] || candidateNotes[0];
  const contractText = contractDoc.rawText || contractDoc.sanitizedText;
  const commsText = commsDoc.rawText || commsDoc.sanitizedText;

  // 1. Compensation Contradiction (Base Salary)
  const salaryRegex = /\$?([\d,]{5,7})/g;
  const commsSalaries: number[] = [];
  const contractSalaries: number[] = [];

  let m: RegExpExecArray | null;
  while ((m = salaryRegex.exec(commsText)) !== null) {
    const val = parseInt(m[1].replace(/,/g, ''), 10);
    if (val >= 30000 && val <= 800000) commsSalaries.push(val);
  }
  while ((m = salaryRegex.exec(contractText)) !== null) {
    const val = parseInt(m[1].replace(/,/g, ''), 10);
    if (val >= 30000 && val <= 800000) contractSalaries.push(val);
  }

  const maxCommsBase = commsSalaries.length ? Math.max(...commsSalaries) : null;
  const maxContractBase = contractSalaries.length ? Math.max(...contractSalaries) : null;

  if (maxCommsBase && maxContractBase && Math.abs(maxCommsBase - maxContractBase) >= 5000) {
    // Found discrepancy!
    const diff = Math.abs(maxCommsBase - maxContractBase);
    const commsSnippetMatch = commsText.match(new RegExp(`[^.!?\\n]*\\$${maxCommsBase.toLocaleString()}[^.!?\\n]*`, 'i'));
    const contractSnippetMatch = contractText.match(new RegExp(`[^.!?\\n]*\\$${maxContractBase.toLocaleString()}[^.!?\\n]*`, 'i'));

    contradictions.push({
      id: `contra-salary-${Date.now()}`,
      category: 'compensation',
      title: 'Discrepancy in Stated Base Compensation',
      severity: 'high',
      summary: `Recruiter communication stated $${maxCommsBase.toLocaleString()}, but formal contract document specifies $${maxContractBase.toLocaleString()} (a divergence of $${diff.toLocaleString()}).`,
      claimA: {
        docId: commsDoc.id,
        docTitle: commsDoc.title,
        docType: commsDoc.type,
        snippet: commsSnippetMatch ? commsSnippetMatch[0].trim() : `Discussed compensation: $${maxCommsBase.toLocaleString()}`,
        speakerOrChannel: commsDoc.type === 'recruiter_email' ? 'Recruiter Email' : 'Recruiter Message',
      },
      claimB: {
        docId: contractDoc.id,
        docTitle: contractDoc.title,
        docType: contractDoc.type,
        snippet: contractSnippetMatch ? contractSnippetMatch[0].trim() : `Contract base salary: $${maxContractBase.toLocaleString()}`,
        speakerOrChannel: 'Formal Offer Agreement',
      },
      impactAssessment: 'Direct negative financial variance. If signed as-is, the lower contractual base salary is legally binding, overriding prior email assurances.',
      uncertaintyExplanation: 'The difference could represent an inadvertent clerical error by HR, or a base salary reduction offset by discretionary bonus components.',
      recommendedVerification: 'Ask the recruiter in writing to rectify the contract to match the agreed base figure before executing the agreement.',
    });
  }

  // 2. Work Location Contradiction (Remote vs In-Office)
  const commsIsRemote = /100%\s*remote|fully remote|work from anywhere|no in-office requirement/i.test(commsText);
  const contractIsInOffice = /(?:in-office|onsite|hybrid|mandatory attendance)[\s\w,]{0,30}?(\d)\s*days?(?:\s*(?:per|\/)\s*week)?/i.test(contractText)
    || /report in person to our (?:office|premises|headquarters)/i.test(contractText);

  if (commsIsRemote && contractIsInOffice) {
    const commsMatch = commsText.match(/[^.!?\n]*(?:100%\s*remote|fully remote|work from anywhere)[^.!?\n]*/i);
    const contractMatch = contractText.match(/[^.!?\n]*(?:in-office|onsite|hybrid|report in person)[^.!?\n]*/i);

    contradictions.push({
      id: `contra-location-${Date.now()}`,
      category: 'work_location',
      title: 'Contradiction in Work Location & Remote Flexibility',
      severity: 'high',
      summary: 'Recruiter stated the position is 100% remote, but the formal contract contains mandatory in-office or hybrid attendance clauses.',
      claimA: {
        docId: commsDoc.id,
        docTitle: commsDoc.title,
        docType: commsDoc.type,
        snippet: commsMatch ? commsMatch[0].trim() : 'Confirmed 100% remote position',
        speakerOrChannel: 'Recruiter Communication',
      },
      claimB: {
        docId: contractDoc.id,
        docTitle: contractDoc.title,
        docType: contractDoc.type,
        snippet: contractMatch ? contractMatch[0].trim() : 'Mandatory onsite attendance specified in contract',
        speakerOrChannel: 'Formal Employment Contract',
      },
      impactAssessment: 'Severe lifestyle and commute impact. Failure to report in-office could be treated as contractual job abandonment if the agreement is signed as-is.',
      uncertaintyExplanation: 'Standard boilerplate template may have been generated by legal counsel without the customized remote addendum attached.',
      recommendedVerification: 'Request a formal "Remote Work Addendum" explicitly overriding the standard office attendance clause in Section 3.',
    });
  }

  // 3. Paid Time Off / Vacation Contradiction
  const commsUnlimitedPTO = /unlimited\s*(?:pto|paid time off|vacation)/i.test(commsText);
  const contractFixedPTO = /(?:accrue|accrual of|entitled to)\s*(\d{1,2})\s*days?(?:\s*of\s*(?:paid time off|pto|vacation))/i.test(contractText);

  if (commsUnlimitedPTO && contractFixedPTO) {
    const commsPTOMatch = commsText.match(/[^.!?\n]*unlimited\s*(?:pto|paid time off|vacation)[^.!?\n]*/i);
    const contractPTOMatch = contractText.match(/[^.!?\n]*(?:accrue|accrual|entitled to)\s*\d{1,2}\s*days?[^.!?\n]*/i);

    contradictions.push({
      id: `contra-pto-${Date.now()}`,
      category: 'benefits_pto',
      title: 'Divergence in Paid Time Off (PTO) Policy',
      severity: 'moderate',
      summary: 'Recruiter communication promised an "Unlimited PTO" policy, while the written agreement prescribes a capped fixed accrual schedule.',
      claimA: {
        docId: commsDoc.id,
        docTitle: commsDoc.title,
        docType: commsDoc.type,
        snippet: commsPTOMatch ? commsPTOMatch[0].trim() : 'Unlimited PTO policy promised',
        speakerOrChannel: 'Recruiter Email',
      },
      claimB: {
        docId: contractDoc.id,
        docTitle: contractDoc.title,
        docType: contractDoc.type,
        snippet: contractPTOMatch ? contractPTOMatch[0].trim() : 'Fixed PTO days specified in contract',
        speakerOrChannel: 'Employment Agreement',
      },
      impactAssessment: 'Discrepancy in leave benefits. While fixed PTO often guarantees payout upon separation in certain states, unlimited PTO does not. Written terms govern.',
      uncertaintyExplanation: 'The company might have switched policies recently, or the recruiter summarized company culture rather than handbook legal policy.',
      recommendedVerification: 'Seek clarification on whether time off is governed by company handbook unlimited policy or the contract fixed days.',
    });
  }

  // 4. Equipment Stipend Contradiction
  const commsEquipmentStipend = /(?:equipment stipend|home office budget|laptop provided|hardware allowance)[\s\w,$]{0,30}?\$?([\d,]+)/i.test(commsText);
  const contractSelfEquipped = /employee shall (?:provide|supply|maintain) their own (?:equipment|computer|laptop|hardware)/i.test(contractText)
    || /purchase approved equipment from designated vendor/i.test(contractText);

  if (commsEquipmentStipend && contractSelfEquipped) {
    const commsEquipMatch = commsText.match(/[^.!?\n]*(?:equipment stipend|home office budget|hardware allowance)[^.!?\n]*/i);
    const contractEquipMatch = contractText.match(/[^.!?\n]*(?:provide their own equipment|designated vendor|hardware)[^.!?\n]*/i);

    contradictions.push({
      id: `contra-equip-${Date.now()}`,
      category: 'equipment_expenses',
      title: 'Inconsistent Equipment & Hardware Provision Terms',
      severity: 'moderate',
      summary: 'Recruiter indicated employer-funded hardware/stipend, but contract assigns hardware costs to the candidate or mandates third-party purchasing.',
      claimA: {
        docId: commsDoc.id,
        docTitle: commsDoc.title,
        docType: commsDoc.type,
        snippet: commsEquipMatch ? commsEquipMatch[0].trim() : 'Equipment budget promised',
        speakerOrChannel: 'Recruiter Pitch',
      },
      claimB: {
        docId: contractDoc.id,
        docTitle: contractDoc.title,
        docType: contractDoc.type,
        snippet: contractEquipMatch ? contractEquipMatch[0].trim() : 'Contract places equipment onus on employee',
        speakerOrChannel: 'Offer Agreement',
      },
      impactAssessment: 'Out-of-pocket setup costs of $2,000–$4,000 may fall onto the employee.',
      uncertaintyExplanation: 'Standard onboarding IT policies may operate under separate expense reimbursement policies not detailed in the core letter.',
      recommendedVerification: 'Clarify whether IT will ship a corporate laptop directly or provide an upfront corporate credit card reimbursement.',
    });
  }

  // 5. Probation Period Contradiction
  const commsNoProbation = /no probation(?:ary)? period|immediate standard status|no waiting period/i.test(commsText);
  const contractProbation = /(?:probationary period|probation) of (\d{1,3})\s*(?:days|months)/i.test(contractText);

  if (commsNoProbation && contractProbation) {
    const contractProbMatch = contractText.match(/[^.!?\n]*(?:probationary period|probation)[^.!?\n]*/i);

    contradictions.push({
      id: `contra-probation-${Date.now()}`,
      category: 'probation_security',
      title: 'Inconsistent Probationary Period Terms',
      severity: 'moderate',
      summary: 'Recruiter promised immediate permanent status with no probation, yet contract includes a formal probationary evaluation period.',
      claimA: {
        docId: commsDoc.id,
        docTitle: commsDoc.title,
        docType: commsDoc.type,
        snippet: 'Recruiter noted no probationary constraints',
        speakerOrChannel: 'Recruiter Notes',
      },
      claimB: {
        docId: contractDoc.id,
        docTitle: contractDoc.title,
        docType: contractDoc.type,
        snippet: contractProbMatch ? contractProbMatch[0].trim() : 'Formal probation period in contract',
        speakerOrChannel: 'Employment Agreement',
      },
      impactAssessment: 'Reduced job security and possible delay of medical benefit vesting during the probationary window.',
      uncertaintyExplanation: 'Probation clauses are often standard boilerplate even when managers verbally downplay them.',
      recommendedVerification: 'Ask HR to strike the probationary clause or clarify its impact on benefit commencement dates.',
    });
  }
}

/**
 * Potentially Concerning Signals Detector
 * Adheres strictly to calibrated, objective, neutral language.
 */
function detectConcerningSignals(allDocs: DossierDocument[], signals: PotentiallyConcerningSignal[]) {
  for (const doc of allDocs) {
    const text = doc.rawText || doc.sanitizedText;

    // SIGNAL 1: Request for Payment / Advance Check / Equipment Vendor
    const paymentRegex = /(?:cashier's check|wire transfer|western union|moneygram|deposit.*check|reimburse.*vendor|purchase.*equipment.*vendor|send.*funds|zelle|crypto|bitcoin|gift card)/i;
    if (paymentRegex.test(text)) {
      const match = text.match(/[^.!?\n]*(?:cashier's check|wire transfer|western union|moneygram|deposit.*check|reimburse.*vendor|purchase.*equipment.*vendor|send.*funds|zelle|crypto|gift card)[^.!?\n]*/i);
      
      signals.push({
        id: `sig-payment-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        category: 'financial_payment_request',
        severity: 'high',
        signalType: 'advance_payment_request',
        title: 'Document Contains Request for Financial Transaction or Advance Check',
        description: 'The correspondence contains instructions regarding cashing an upfront check, wiring funds, or purchasing equipment from a designated third-party supplier prior to onboarding.',
        calibratedLanguage: 'The document contains a request for payment. Additional verification recommended.',
        evidence: [
          {
            docId: doc.id,
            docTitle: doc.title,
            snippet: match ? match[0].trim() : 'Mention of check deposit or funds transfer for hardware procurement',
            contextHint: 'Financial and procurement instructions section',
          },
        ],
        uncertaintyAndContext: 'Legitimate employers almost universally ship configured corporate hardware directly or use corporate procurement systems without requiring candidate personal banking involvement.',
        suggestedAction: 'Do NOT deposit any cashier check or wire funds. Verify directly with the legitimate company main switchboard using a verified public phone number.',
      });
    }

    // SIGNAL 2: Free Email Provider or Domain Mismatch
    const emailHeaderMatch = text.match(/(?:From:|Sender:|Contact:)\s*([a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))/i);
    if (emailHeaderMatch) {
      const fullEmail = emailHeaderMatch[1];
      const domain = emailHeaderMatch[2].toLowerCase();
      const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'protonmail.com'];

      if (freeProviders.includes(domain)) {
        signals.push({
          id: `sig-freemail-${Date.now()}`,
          category: 'domain_communication_anomaly',
          severity: 'high',
          signalType: 'free_email_domain',
          title: 'Corporate Recruiter Communicating via Free Webmail Domain',
          description: `The communication originates from a free consumer email address (${domain}) rather than an authenticated corporate domain.`,
          calibratedLanguage: 'Information is inconsistent. Additional verification recommended.',
          evidence: [
            {
              docId: doc.id,
              docTitle: doc.title,
              snippet: emailHeaderMatch[0],
              contextHint: 'Sender address header',
            },
          ],
          uncertaintyAndContext: 'While rare freelance headhunters occasionally use personal accounts, enterprise hiring managers and internal corporate talent teams use official verified corporate email infrastructure.',
          suggestedAction: 'Cross-check the recruiter on LinkedIn and request they send the agreement from their official corporate email domain.',
        });
      } else if (domain.includes('-careers') || domain.includes('-jobs') || domain.includes('.cc') || domain.includes('.biz') || domain.includes('.site')) {
        signals.push({
          id: `sig-typodomain-${Date.now()}`,
          category: 'domain_communication_anomaly',
          severity: 'moderate',
          signalType: 'suspicious_domain_syntax',
          title: 'Communication Uses Non-Standard or Lookalike Domain Extension',
          description: `The email domain "${domain}" contains non-standard keywords (-careers, -jobs) or top-level extensions (.cc, .site, .biz) commonly associated with spoofed domains.`,
          calibratedLanguage: 'Potential concern detected. Additional verification recommended.',
          evidence: [
            {
              docId: doc.id,
              docTitle: doc.title,
              snippet: emailHeaderMatch[0],
              contextHint: 'Sender domain inspection',
            },
          ],
          uncertaintyAndContext: 'Some major staffing agencies do operate specialized careers portals, but lookalike domains are frequently utilized in domain impersonation.',
          suggestedAction: 'Perform a WHOIS domain lookup to check domain registration age. If registered within the last 6 months, treat with heightened scrutiny.',
        });
      }
    }

    // SIGNAL 3: Chat-Only Interview Process (Telegram, WhatsApp, Signal)
    const chatInterviewRegex = /(?:interview conducted via|conducted entirely through|interview via|message us on)\s*(?:Telegram|WhatsApp|Signal|Skype chat|Google Chat)/i;
    if (chatInterviewRegex.test(text) || (/Telegram/i.test(text) && /interview/i.test(text) && !/video call|zoom|google meet|teams/i.test(text))) {
      const match = text.match(/[^.!?\n]*(?:Telegram|WhatsApp|Signal|chat interview)[^.!?\n]*/i);
      signals.push({
        id: `sig-chatinterview-${Date.now()}`,
        category: 'ambiguous_entity_or_process',
        severity: 'high',
        signalType: 'chat_only_interview',
        title: 'Hiring Process Conducted Solely via Encrypted Chat Messaging',
        description: 'The candidate interview or screening occurred strictly through a text chat platform without face-to-face video conferencing or telephone verification.',
        calibratedLanguage: 'Potential concern detected. The interview process deviates from industry norms.',
        evidence: [
          {
            docId: doc.id,
            docTitle: doc.title,
            snippet: match ? match[0].trim() : 'Recruiter utilized Telegram/WhatsApp chat messaging for interview instructions',
            contextHint: 'Interview protocol instructions',
          },
        ],
        uncertaintyAndContext: 'Standard professional hiring protocols require at least one live video conference or in-person panel with team members and hiring managers.',
        suggestedAction: 'Request a 15-minute video call with the hiring manager or department head to review team expectations before signing.',
      });
    }

    // SIGNAL 4: Extreme Artificial Urgency / Exploding Offer
    const urgencyRegex = /(?:within 24 hours|within 48 hours|expires in 24 hours|exploding offer|void if not returned within \d{1,2} hours|immediate acceptance required)/i;
    if (urgencyRegex.test(text)) {
      const match = text.match(/[^.!?\n]*(?:within \d{1,2} hours|expires in \d{1,2} hours|immediate acceptance)[^.!?\n]*/i);
      signals.push({
        id: `sig-urgency-${Date.now()}`,
        category: 'artificial_urgency',
        severity: 'moderate',
        signalType: 'exploding_deadline',
        title: 'High-Pressure Decision Window / Exploding Offer Clause',
        description: 'The offer mandates execution within an unusually tight timeframe (24 to 48 hours), limiting the candidate\'s capacity to review terms with legal counsel or advisors.',
        calibratedLanguage: 'Potential concern detected. Timeframe creates artificial urgency.',
        evidence: [
          {
            docId: doc.id,
            docTitle: doc.title,
            snippet: match ? match[0].trim() : 'Short 24-48 hour response deadline',
            contextHint: 'Acceptance deadline clause',
          },
        ],
        uncertaintyAndContext: 'While some competitive tech firms impose deadlines, reputable employers typically grant 3 to 7 business days upon request for substantive legal and financial review.',
        suggestedAction: 'Send a professional extension request asking for 3 to 5 business days to review the documentation with family or financial advisors.',
      });
    }

    // SIGNAL 5: Overly Broad IP Assignment & Personal Project Claim
    const broadIpRegex = /(?:all inventions|whether or not during normal working hours|all ideas, discoveries|moral rights|prior inventions unless disclosed|personal time and equipment)/i;
    if (doc.type === 'offer_letter' && broadIpRegex.test(text)) {
      const match = text.match(/[^.!?\n]*(?:all inventions|whether or not during normal working hours|prior inventions)[^.!?\n]*/i);
      signals.push({
        id: `sig-ip-${Date.now()}`,
        category: 'restrictive_contract_clause',
        severity: 'moderate',
        signalType: 'broad_ip_covenant',
        title: 'Broad Intellectual Property Assignment Covering Outside Hours',
        description: 'Contract language purports to assign ownership to the company for inventions or works created outside working hours or on personal devices.',
        calibratedLanguage: 'Information is inconsistent with standard employee IP protections.',
        evidence: [
          {
            docId: doc.id,
            docTitle: doc.title,
            snippet: match ? match[0].trim() : 'Broad IP assignment clause extending beyond company time/resources',
            contextHint: 'Proprietary Information and Inventions Agreement (PIIA)',
          },
        ],
        uncertaintyAndContext: 'State statutes (such as California Labor Code § 2870, Washington, and Illinois) legally protect inventions created entirely on employee own time without company assets.',
        suggestedAction: 'Attach a Prior Inventions Disclosure Schedule (Exhibit A) explicitly carving out pre-existing open-source repositories and personal hobby projects.',
      });
    }

    // SIGNAL 6: Severe Clawback & Repayment Penalties
    const clawbackRegex = /(?:repay.*signing bonus|100% repayment|reimburse training expenses|liquidated damages|attorney's fees in collecting)/i;
    if (doc.type === 'offer_letter' && clawbackRegex.test(text)) {
      const match = text.match(/[^.!?\n]*(?:repay.*signing bonus|reimburse training|liquidated damages)[^.!?\n]*/i);
      signals.push({
        id: `sig-clawback-${Date.now()}`,
        category: 'restrictive_contract_clause',
        severity: 'moderate',
        signalType: 'harsh_clawback_terms',
        title: 'Comprehensive Clawback Obligation on Departure',
        description: 'The agreement mandates complete 100% repayment of bonus, relocation, or training expenses if departure occurs within 12 to 24 months, without proration.',
        calibratedLanguage: 'Potential concern detected. Repayment terms lack customary pro-rata scaling.',
        evidence: [
          {
            docId: doc.id,
            docTitle: doc.title,
            snippet: match ? match[0].trim() : 'Full repayment requirement upon resignation',
            contextHint: 'Bonus / Relocation Repayment Terms',
          },
        ],
        uncertaintyAndContext: 'Standard market practice provides for linear pro-rata repayment (e.g. 1/12th forgiven per month worked) rather than an all-or-nothing clawback.',
        suggestedAction: 'Negotiate for monthly pro-rata forgiveness and ensure the clawback applies only to voluntary resignation, excluding termination without cause.',
      });
    }
  }
}

/**
 * Missing Information & Blind-Spot Audit
 */
function auditMissingInformation(
  docs: DossierDocument[],
  facts: StructuredFacts,
  missing: MissingInformationItem[]
) {
  const hasOfferLetter = docs.some((d) => d.type === 'offer_letter');
  if (!hasOfferLetter) {
    missing.push({
      id: 'miss-formal-letter',
      topic: 'Formal Written Offer Agreement',
      importance: 'essential',
      whyItMatters: 'Verbal, email, or chat promises are rarely legally enforceable if not incorporated into an executed employment contract with an integration clause.',
      whatIsMissing: 'No formal written employment agreement or signed offer letter was provided in the dossier.',
      suggestedQuestion: 'When can I expect the formal written offer documentation and benefits packet for review?',
    });
    return;
  }

  // 1. Equity Strike Price & Share Pool Denominator
  if (facts.equity) {
    if (!facts.equity.value.strikePrice) {
      missing.push({
        id: 'miss-strike-price',
        topic: 'Option Strike Price / 409A Valuation',
        importance: 'essential',
        whyItMatters: 'Without an exercise strike price and 409A valuation, the financial value of stock options cannot be calculated.',
        whatIsMissing: 'The grant lists an option share count, but omits the current strike price per share and latest 409A company valuation.',
        suggestedQuestion: 'What is the current exercise (strike) price per share, and what was the valuation determined in the most recent 409A appraisal?',
      });
    }
    if (!facts.equity.value.shareCountTotal) {
      missing.push({
        id: 'miss-total-shares',
        topic: 'Total Fully Diluted Share Count',
        importance: 'recommended',
        whyItMatters: 'A raw number of options (e.g. 20,000) has no context without knowing what percentage of the total company capitalization it represents.',
        whatIsMissing: 'Total outstanding shares on a fully diluted basis is not specified.',
        suggestedQuestion: 'What percentage of the fully diluted capitalization do these options represent?',
      });
    }
  }

  // 2. Healthcare Coverage Effective Date
  const allText = docs.map((d) => d.rawText).join(' ');
  const hasHealthDate = /health(?:care)?.*(?:day 1|first day of the month|after 30 days|after 90 days|eligible immediately)/i.test(allText);
  if (!hasHealthDate) {
    missing.push({
      id: 'miss-health-date',
      topic: 'Health Insurance Commencement Date',
      importance: 'essential',
      whyItMatters: 'If coverage begins only after a 60 or 90-day waiting period, the candidate may experience a lapse in coverage or need COBRA bridging.',
      whatIsMissing: 'Effective start date of medical, dental, and vision insurance coverage is unstated.',
      suggestedQuestion: 'Does healthcare coverage take effect on Day 1 of employment, or is there a waiting period?',
    });
  }

  // 3. Bonus KPI Criteria vs Discretionary
  if (facts.bonus && facts.bonus.value.type === 'discretionary') {
    missing.push({
      id: 'miss-bonus-kpis',
      topic: 'Incentive Bonus Performance Criteria',
      importance: 'recommended',
      whyItMatters: 'Discretionary bonuses provide zero contractual payment guarantee, even if individual deliverables are exceeded.',
      whatIsMissing: 'No objective formula or milestone criteria are established in the contract.',
      suggestedQuestion: 'Can you share the historical payout rates and the key performance indicators (KPIs) used to evaluate the annual bonus?',
    });
  }

  // 4. Remote Expense / Office Stipend Policy
  if (facts.workLocation && facts.workLocation.value.arrangement === 'remote') {
    const hasStipend = /stipend|reimbursement|internet|cell phone|utilities/i.test(allText);
    if (!hasStipend) {
      missing.push({
        id: 'miss-remote-stipend',
        topic: 'Remote Work Utility & Equipment Stipend',
        importance: 'beneficial',
        whyItMatters: 'Home office expenses (high-speed internet, monitor, ergonomic desk) can be eligible for tax-free monthly employer stipends.',
        whatIsMissing: 'Contract does not mention monthly internet or home workspace reimbursement.',
        suggestedQuestion: 'Does the company provide a monthly remote work or internet connectivity stipend?',
      });
    }
  }

  // 5. Prior Inventions Schedule (Exhibit A)
  const mentionsExhibitA = /Exhibit A|Schedule 1|Prior Inventions/i.test(allText);
  if (!mentionsExhibitA) {
    missing.push({
      id: 'miss-exhibit-a',
      topic: 'Prior Inventions & Open Source Carve-Out Schedule',
      importance: 'recommended',
      whyItMatters: 'Without an attached disclosure exhibit, pre-existing code, personal side projects, or open-source libraries could be claimed by the employer.',
      whatIsMissing: 'No Prior Inventions Disclosure form or Exhibit is attached to exclude personal intellectual property.',
      suggestedQuestion: 'Could you provide the Exhibit A / Prior Inventions form so I can record pre-existing personal projects and repositories?',
    });
  }
}

/**
 * Recruiter Claim vs Offer Reality Matrix
 */
function buildClaimVsOfferMatrix(
  recruiterDocs: DossierDocument[],
  offerDocs: DossierDocument[],
  candidateNotes: DossierDocument[],
  facts: StructuredFacts
): ClaimVsOfferItem[] {
  const commsText = [...recruiterDocs, ...candidateNotes].map((d) => d.rawText).join('\n');
  const offerText = offerDocs.map((d) => d.rawText).join('\n');

  const matrix: ClaimVsOfferItem[] = [];

  // Parameter 1: Base Salary
  const recSalMatch = commsText.match(/\$([\d,]{5,7})/);
  const offSalMatch = offerText.match(/\$([\d,]{5,7})/);
  matrix.push({
    parameter: 'Base Salary',
    category: 'Compensation',
    recruiterStated: recSalMatch ? `$${recSalMatch[1]}` : (facts.baseSalary ? facts.baseSalary.value.formatted : 'Not explicitly stated'),
    contractStated: offSalMatch ? `$${offSalMatch[1]}` : (facts.baseSalary ? facts.baseSalary.value.formatted : 'Not documented'),
    alignmentStatus: (recSalMatch && offSalMatch && recSalMatch[1] !== offSalMatch[1]) ? 'contradicted' : 'matched',
    sourceClaimSnippet: recSalMatch ? `Recruiter noted: $${recSalMatch[1]}` : undefined,
    sourceContractSnippet: offSalMatch ? `Offer contract states: $${offSalMatch[1]}` : undefined,
  });

  // Parameter 2: Work Location
  const recRemote = /100%\s*remote|fully remote/i.test(commsText);
  const offRemote = /100%\s*remote|fully remote/i.test(offerText);
  const offInOffice = /(?:in-office|onsite|hybrid)[\s\w,]{0,20}?(\d)\s*days/i.test(offerText);
  matrix.push({
    parameter: 'Work Location & Remote Status',
    category: 'Work Arrangement',
    recruiterStated: recRemote ? '100% Remote (Work from home)' : 'Flexible / Hybrid',
    contractStated: offInOffice ? 'Mandatory In-Office / Hybrid attendance' : (offRemote ? '100% Remote' : 'Subject to company discretion'),
    alignmentStatus: (recRemote && offInOffice) ? 'contradicted' : (offRemote ? 'matched' : 'partially_aligned'),
  });

  // Parameter 3: Bonus Structure
  const recBonus = commsText.match(/(?:bonus of|target bonus)\s*(\$?\d[\d,]*%?|\d{1,2}%)/i);
  const offBonus = offerText.match(/(?:discretionary|bonus of)\s*(\$?\d[\d,]*%?|\d{1,2}%)/i);
  matrix.push({
    parameter: 'Annual Bonus',
    category: 'Compensation',
    recruiterStated: recBonus ? recBonus[0] : 'Described in verbal discussions',
    contractStated: offBonus ? (offerText.includes('discretionary') ? `${offBonus[0]} (Subject to sole discretion)` : offBonus[0]) : 'Not specified in offer',
    alignmentStatus: offBonus ? (offerText.includes('discretionary') ? 'partially_aligned' : 'matched') : 'unmentioned_in_offer',
  });

  // Parameter 4: Equity & Stock Options
  const recEq = commsText.match(/(\d[\d,]*)\s*(?:options|shares|stock)/i);
  const offEq = offerText.match(/(\d[\d,]*)\s*(?:options|shares|stock)/i);
  matrix.push({
    parameter: 'Equity Grant',
    category: 'Long-Term Incentive',
    recruiterStated: recEq ? `${recEq[1]} options` : 'Discussed during interviews',
    contractStated: offEq ? `${offEq[1]} options` : (facts.equity ? `${facts.equity.value.amount} options` : 'Not detailed in letter'),
    alignmentStatus: (recEq && offEq && recEq[1] !== offEq[1]) ? 'contradicted' : (offEq ? 'matched' : 'unmentioned_in_offer'),
  });

  // Parameter 5: Paid Time Off (PTO)
  const recPTO = /unlimited/i.test(commsText);
  const offPTO = offerText.match(/(\d{1,2})\s*days?(?:\s*of\s*pto|\s*paid time off)/i);
  matrix.push({
    parameter: 'Paid Time Off',
    category: 'Benefits',
    recruiterStated: recPTO ? 'Unlimited Paid Time Off' : 'Standard paid leave',
    contractStated: offPTO ? `${offPTO[1]} days accrued annually` : (offerText.includes('unlimited') ? 'Unlimited PTO' : 'Per employee handbook'),
    alignmentStatus: (recPTO && offPTO) ? 'contradicted' : 'matched',
  });

  // Parameter 6: Equipment Provision
  const recEquip = /stipend|\$3,\d00|laptop provided/i.test(commsText);
  const offEquip = /employee.*provide.*equipment|vendor/i.test(offerText);
  matrix.push({
    parameter: 'Workstation & Equipment',
    category: 'IT & Tools',
    recruiterStated: recEquip ? 'Company provided hardware / upfront stipend' : 'Standard corporate setup',
    contractStated: offEquip ? 'Employee responsibility / third-party vendor' : 'Company provided setup',
    alignmentStatus: offEquip ? 'contradicted' : 'matched',
  });

  return matrix;
}

/**
 * Recruiter Inquiries & Negotiation Playbook Generator
 */
function generateRecruiterQuestions(
  contradictions: Contradiction[],
  signals: PotentiallyConcerningSignal[],
  missing: MissingInformationItem[],
  facts: StructuredFacts
): RecruiterQuestion[] {
  const questions: RecruiterQuestion[] = [];

  // Question 1: If base salary contradiction exists
  const salaryContra = contradictions.find((c) => c.category === 'compensation');
  if (salaryContra) {
    questions.push({
      id: 'q-salary',
      targetDiscrepancyOrIssue: 'Base Salary Discrepancy',
      category: 'compensation',
      rationale: 'Addresses the mathematical gap between email promises and the formal contract in a courteous, non-accusatory tone.',
      scriptPolite: `Hi [Recruiter Name],\n\nThank you so much for putting together this offer package! I'm really excited about the team and the opportunity. While reviewing the formal agreement, I noticed the base salary is listed as ${facts.baseSalary?.value.formatted || '[Lower Amount]'}, whereas our prior email confirmed ${salaryContra.claimA.snippet.slice(0, 30) || '[Agreed Amount]'}. Could you check with the compensation team to see if this was a clerical oversight and provide an updated letter?`,
      scriptDirect: `Hi [Recruiter Name],\n\nI reviewed the formal offer letter and noticed a discrepancy in the base compensation. Section 2 lists the base salary as ${facts.baseSalary?.value.formatted || '[Lower Amount]'}, but our written agreement via email was ${salaryContra.claimA.snippet.slice(0, 30) || '[Agreed Amount]'}. Please issue a revised offer reflecting the agreed base figure so I can proceed with signing.`,
      scriptFirm: `Dear [Recruiter Name],\n\nBefore executing the offer agreement, I require confirmation regarding the base compensation figure. The current document specifies ${facts.baseSalary?.value.formatted || '[Lower Amount]'}, which diverges from the ${salaryContra.claimA.snippet.slice(0, 30) || '[Agreed Amount]'} previously agreed upon in writing. I cannot sign the contract in its current form and look forward to receiving the corrected documentation.`,
    });
  }

  // Question 2: If remote work location contradiction exists
  const locationContra = contradictions.find((c) => c.category === 'work_location');
  if (locationContra) {
    questions.push({
      id: 'q-location',
      targetDiscrepancyOrIssue: 'Remote Work vs In-Office Requirement',
      category: 'remote_policy',
      rationale: 'Secures binding written confirmation of permanent remote status before execution, preventing unexpected relocation demands.',
      scriptPolite: `Hi [Recruiter Name],\n\nI'm reviewing the offer terms and noticed Section 3 includes standard language regarding in-office attendance in [City]. As we discussed earlier that this position is 100% remote, could we add a brief Remote Work Addendum confirming my home office as the permanent duty station?`,
      scriptDirect: `Hi [Recruiter Name],\n\nOur interview discussions confirmed this role is 100% remote, but Section 3 of the contract outlines mandatory onsite attendance. Could you adjust this clause to explicitly state that the position is permanently remote with no mandatory in-office days?`,
      scriptFirm: `Dear [Recruiter Name],\n\nThe current agreement specifies required office attendance, conflicting with our documented understanding of a permanent remote arrangement. Please provide an updated contract or formal addendum stating 100% remote employment prior to execution.`,
    });
  }

  // Question 3: If advance check / payment signal exists
  const paymentSignal = signals.find((s) => s.category === 'financial_payment_request');
  if (paymentSignal) {
    questions.push({
      id: 'q-payment',
      targetDiscrepancyOrIssue: 'Equipment Payment / Check Cashing Request',
      category: 'due_diligence',
      rationale: 'Establishes professional boundaries regarding personal financial accounts while verifying corporate authenticity.',
      scriptPolite: `Hi [Recruiter Name],\n\nRegarding the hardware setup, my bank and financial advisor advise against processing third-party cashier checks or personal reimbursements for corporate IT. Would IT be able to ship pre-configured hardware directly to my address, or provide a corporate procurement portal?`,
      scriptDirect: `Hi [Recruiter Name],\n\nI do not conduct company hardware purchases or check cashing through my personal bank accounts. Please confirm whether company IT will ship standard equipment directly, or if this can be handled via direct corporate procurement.`,
      scriptFirm: `Dear [Recruiter Name],\n\nI require formal written confirmation from corporate IT regarding hardware distribution. I will not accept or deposit checks for equipment reimbursement. Please provide the contact information for your internal IT director and HR department.`,
    });
  }

  // Question 4: Missing Equity Strike Price or Dilution
  const strikeMissing = missing.find((m) => m.id === 'miss-strike-price' || m.id === 'miss-total-shares');
  if (strikeMissing) {
    questions.push({
      id: 'q-equity',
      targetDiscrepancyOrIssue: 'Equity Valuation & Strike Price Dilution',
      category: 'compensation',
      rationale: 'Gathers essential financial parameters to calculate the true present and prospective value of stock options.',
      scriptPolite: `Hi [Recruiter Name],\n\nI'm very excited about the equity package! To help me understand the grant structure, could you provide the current strike price per share, the latest 409A valuation, and the total fully diluted share count?`,
      scriptDirect: `Hi [Recruiter Name],\n\nTo complete my review of the equity component, please confirm the current option strike price, the company's latest 409A valuation, and what percentage of fully diluted shares this grant represents.`,
      scriptFirm: `Dear [Recruiter Name],\n\nBefore I can evaluate the total compensation package, I need the standard equity details: current 409A strike price, latest preferred share valuation, and total shares outstanding on a fully diluted basis.`,
    });
  }

  // Question 5: Tight Decision Window / Exploding Offer
  const deadlineSignal = signals.find((s) => s.signalType === 'exploding_deadline');
  if (deadlineSignal) {
    questions.push({
      id: 'q-deadline',
      targetDiscrepancyOrIssue: 'Offer Expiration Extension Request',
      category: 'timeline',
      rationale: 'Professionally secures additional business days to conduct legal and financial review without forfeiting the opportunity.',
      scriptPolite: `Hi [Recruiter Name],\n\nThank you for extending this offer! I am very keen on this role and want to ensure I give the agreement the thorough review it deserves with my family and legal advisor. Would it be possible to extend the decision deadline to [Date, e.g. next Friday]?`,
      scriptDirect: `Hi [Recruiter Name],\n\nI received the offer package today. Given the complexity of the agreement, the 48-hour window is tight. Could we extend the acceptance deadline to [Date, 5 business days out] so I can complete a proper review?`,
      scriptFirm: `Dear [Recruiter Name],\n\nTo conduct a prudent review of the employment agreement and restrictive covenants, I request an extension of the acceptance deadline to [Date]. Please confirm this updated date at your earliest convenience.`,
    });
  }

  // Fallback general question if list is small
  if (questions.length < 2) {
    questions.push({
      id: 'q-general-clarification',
      targetDiscrepancyOrIssue: 'Health Benefits & Standard Onboarding Details',
      category: 'clarification',
      rationale: 'Verifies Day 1 coverage and employee handbook details before committing.',
      scriptPolite: `Hi [Recruiter Name],\n\nCould you please share the comprehensive employee benefits guide, specifically highlighting when medical and dental coverage takes effect (Day 1 vs waiting period) and the company 401(k) matching schedule?`,
      scriptDirect: `Hi [Recruiter Name],\n\nPlease provide the full benefits summary document with effective dates for medical coverage and 401(k) vesting terms.`,
      scriptFirm: `Dear [Recruiter Name],\n\nKindly supply the formal benefits booklet detailing insurance effective dates, copays, and retirement matching schedules prior to signing.`,
    });
  }

  return questions;
}

/**
 * Builds chronological timeline of events across documents
 */
function buildTimeline(docs: DossierDocument[]): Array<{
  date: string;
  docTitle: string;
  docType: DossierDocument['type'];
  eventSummary: string;
}> {
  return docs.map((doc, idx) => {
    let dateStr = doc.metadata?.dateReceived || 'Recent';
    let summary = '';

    switch (doc.type) {
      case 'recruiter_message':
        summary = 'Initial recruiter outreach and candidate screening';
        break;
      case 'recruiter_email':
        summary = 'Formal email correspondence detailing compensation expectations';
        break;
      case 'interview_instructions':
        summary = 'Interview format instructions and screening protocol';
        break;
      case 'offer_letter':
        summary = 'Execution draft of employment agreement received';
        break;
      case 'salary_breakup':
        summary = 'Detailed compensation breakdown and benefits schedule';
        break;
      case 'voice_recording':
        summary = 'Recruiter voicemail or audio recording detailing role terms';
        break;
      case 'candidate_notes':
        summary = 'Candidate personal notes of verbal discussions';
        break;
      default:
        summary = 'Job and company document review';
    }

    return {
      date: dateStr,
      docTitle: doc.title,
      docType: doc.type,
      eventSummary: summary,
    };
  });
}

/**
 * Builds calibrated, objective summary verdict strictly without accusatory language
 */
function buildCalibratedSummary(
  contradictions: Contradiction[],
  signals: PotentiallyConcerningSignal[],
  missing: MissingInformationItem[],
  score: number,
  uncertainty: string
): string {
  const parts: string[] = [];

  if (signals.some((s) => s.category === 'financial_payment_request')) {
    parts.push('The document contains a request for payment or financial check handling, which deviates from standard hiring procedures.');
  }

  if (contradictions.length > 0) {
    parts.push(`Information is inconsistent across ${contradictions.length} critical terms (including ${contradictions.map((c) => c.title).slice(0, 2).join(' and ')}).`);
  }

  if (signals.some((s) => s.category === 'domain_communication_anomaly')) {
    parts.push('Communication domain anomalies were detected.');
  }

  if (missing.filter((m) => m.importance === 'essential').length > 0) {
    parts.push('Essential compensation and protection details are absent from the formal documents.');
  }

  if (parts.length === 0) {
    return 'Terms are largely consistent across uploaded documents. Standard due diligence questions recommended to clarify minor ambiguities before signing.';
  }

  parts.push('Additional verification recommended before taking financial or career decisions. The final decision always belongs to the user.');
  return parts.join(' ');
}
