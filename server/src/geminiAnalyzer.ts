import { GoogleGenAI } from '@google/genai';
import { DossierDocument, InvestigationReport } from './types.js';
import { analyzeDossierLocally } from './deterministicAnalyzer.js';

export async function analyzeDossierWithGemini(
  documents: DossierDocument[],
  dossierTitle: string,
  userApiKey?: string
): Promise<InvestigationReport> {
  const apiKey = userApiKey || process.env.GEMINI_API_KEY;

  // Always compute deterministic baseline report first!
  const baseReport = analyzeDossierLocally(documents, dossierTitle);

  // If no Gemini API key is available, return local report directly
  if (!apiKey || apiKey.trim().length === 0) {
    return baseReport;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Build privacy-safe prompt using ONLY sanitized text
    const docsSummary = documents.map((doc, idx) => {
      return `--- DOCUMENT ${idx + 1}: [${doc.type.toUpperCase()}] "${doc.title}" ---
${doc.sanitizedText || doc.rawText}
--- END DOCUMENT ${idx + 1} ---`;
    }).join('\n\n');

    const prompt = `You are OfferLens AI, an evidence-based, privacy-first job offer reality checker.
Analyze the following job-offer dossier documents. The candidate's personal identifying information has already been masked locally for privacy.

CRITICAL INSTRUCTIONS & CALIBRATION:
- Do NOT build a generic summary.
- NEVER say "This is definitely a scam" or accuse anyone definitively.
- Use calibrated, objective language:
  "Potential concern detected."
  "Information is inconsistent."
  "Additional verification recommended."
  "The document contains a request for payment."
  "The final decision always belongs to the user."
- Extract structured facts with exact evidence.
- Identify subtle contradictions between recruiter promises/emails and the formal employment contract.
- Highlight missing protections (equity strike price, health insurance start date, bonus criteria).
- Craft polite, direct, and firm recruiter inquiry scripts.

DOCUMENTS TO ANALYZE:
${docsSummary}

Return your findings in valid JSON adhering to this structure:
{
  "calibratedVerdictSummary": string,
  "overallAlignmentScore": number (10 to 100),
  "uncertaintyRating": "low" | "moderate" | "high",
  "additionalContradictions": [
    {
      "category": "compensation" | "work_location" | "benefits_pto" | "equipment_expenses" | "equity_vesting" | "role_responsibilities" | "probation_security",
      "title": string,
      "severity": "high" | "moderate" | "low",
      "summary": string,
      "claimA_snippet": string,
      "claimA_source": string,
      "claimB_snippet": string,
      "claimB_source": string,
      "impactAssessment": string,
      "uncertaintyExplanation": string,
      "recommendedVerification": string
    }
  ],
  "additionalSignals": [
    {
      "category": "financial_payment_request" | "domain_communication_anomaly" | "restrictive_contract_clause" | "artificial_urgency" | "ambiguous_entity_or_process",
      "severity": "high" | "moderate" | "info",
      "title": string,
      "description": string,
      "calibratedLanguage": string,
      "snippet": string,
      "suggestedAction": string
    }
  ],
  "additionalMissingInfo": [
    {
      "topic": string,
      "importance": "essential" | "recommended" | "beneficial",
      "whyItMatters": string,
      "whatIsMissing": string,
      "suggestedQuestion": string
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '';
    if (!responseText) {
      return baseReport;
    }

    const aiData = JSON.parse(responseText);

    // Merge AI insights with deterministic baseline
    const enrichedReport = { ...baseReport };
    enrichedReport.privacySummary.processingMode = 'local_with_gemini_ai';

    if (aiData.calibratedVerdictSummary) {
      enrichedReport.calibratedVerdictSummary = aiData.calibratedVerdictSummary;
    }
    if (typeof aiData.overallAlignmentScore === 'number') {
      enrichedReport.overallAlignmentScore = Math.min(100, Math.max(10, Math.round(aiData.overallAlignmentScore)));
    }
    if (aiData.uncertaintyRating) {
      enrichedReport.uncertaintyRating = aiData.uncertaintyRating;
    }

    // Add any unique AI contradictions
    if (Array.isArray(aiData.additionalContradictions)) {
      for (const ac of aiData.additionalContradictions) {
        if (!enrichedReport.contradictions.some((c) => c.title.toLowerCase() === ac.title?.toLowerCase())) {
          enrichedReport.contradictions.push({
            id: `ai-contra-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            category: ac.category || 'compensation',
            title: ac.title || 'Nuanced Discrepancy Detected',
            severity: ac.severity || 'moderate',
            summary: ac.summary || '',
            claimA: {
              docId: documents[0]?.id || '',
              docTitle: documents[0]?.title || 'Initial Communication',
              docType: documents[0]?.type || 'recruiter_email',
              snippet: ac.claimA_snippet || '',
              speakerOrChannel: ac.claimA_source || 'Recruiter Promise',
            },
            claimB: {
              docId: documents[documents.length - 1]?.id || '',
              docTitle: documents[documents.length - 1]?.title || 'Formal Agreement',
              docType: documents[documents.length - 1]?.type || 'offer_letter',
              snippet: ac.claimB_snippet || '',
              speakerOrChannel: ac.claimB_source || 'Contract Agreement',
            },
            impactAssessment: ac.impactAssessment || '',
            uncertaintyExplanation: ac.uncertaintyExplanation || 'Requires confirmation with hiring manager.',
            recommendedVerification: ac.recommendedVerification || '',
          });
        }
      }
    }

    // Add any unique AI signals
    if (Array.isArray(aiData.additionalSignals)) {
      for (const as of aiData.additionalSignals) {
        if (!enrichedReport.signals.some((s) => s.title.toLowerCase() === as.title?.toLowerCase())) {
          enrichedReport.signals.push({
            id: `ai-sig-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            category: as.category || 'restrictive_contract_clause',
            severity: as.severity || 'moderate',
            signalType: 'ai_detected_nuance',
            title: as.title || 'Potential Concern Detected',
            description: as.description || '',
            calibratedLanguage: as.calibratedLanguage || 'Potential concern detected. Additional verification recommended.',
            evidence: [
              {
                docId: documents[0]?.id || '',
                docTitle: documents[0]?.title || 'Document',
                snippet: as.snippet || '',
              },
            ],
            uncertaintyAndContext: 'Contextual review by candidate or employment counsel advised.',
            suggestedAction: as.suggestedAction || 'Request clarification in writing.',
          });
        }
      }
    }

    // Update counts
    enrichedReport.contradictionsCount = enrichedReport.contradictions.length;
    enrichedReport.signalsSummary = {
      highCount: enrichedReport.signals.filter((s) => s.severity === 'high').length,
      moderateCount: enrichedReport.signals.filter((s) => s.severity === 'moderate').length,
      infoCount: enrichedReport.signals.filter((s) => s.severity === 'info').length,
    };

    return enrichedReport;
  } catch (err) {
    console.error('Gemini API analysis failed or threw error, falling back cleanly to deterministic local report:', err);
    return baseReport;
  }
}
