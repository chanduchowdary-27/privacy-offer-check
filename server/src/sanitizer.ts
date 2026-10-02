import { RedactionToken } from './types.js';

export interface SanitizationResult {
  sanitizedText: string;
  redactions: RedactionToken[];
}

export function sanitizeText(rawText: string, customTerms: string[] = []): SanitizationResult {
  if (!rawText) {
    return { sanitizedText: '', redactions: [] };
  }

  const redactions: RedactionToken[] = [];
  let result = rawText;

  // Helper to replace and record
  const applyRegex = (
    regex: RegExp,
    category: RedactionToken['category'],
    maskPrefix: string,
    filterFn?: (match: string) => boolean
  ) => {
    let match: RegExpExecArray | null;
    let offsetAdjustment = 0;
    
    // We clone the regex to avoid global state issues
    const re = new RegExp(regex.source, regex.flags);
    
    while ((match = re.exec(rawText)) !== null) {
      const original = match[0];
      if (filterFn && !filterFn(original)) {
        continue;
      }
      
      const mask = `[${maskPrefix}_REDACTED]`;
      const originalStart = match.index;
      const originalEnd = originalStart + original.length;

      redactions.push({
        original,
        masked: mask,
        category,
        startIndex: originalStart,
        endIndex: originalEnd,
      });
    }
  };

  // 1. Social Security Numbers / Tax IDs (e.g. 123-45-6789 or 9-digit Tax ID)
  applyRegex(/\b\d{3}-\d{2}-\d{4}\b/g, 'financial', 'SSN');

  // 2. Phone Numbers (US & International formats)
  applyRegex(/(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/g, 'phone', 'PHONE', (match) => {
    // avoid matching simple 4-digit numbers or salaries like 2026 or 150000
    const clean = match.replace(/[-.\s()+]/g, '');
    return clean.length >= 10 && clean.length <= 15;
  });

  // 3. Bank Account / Routing Numbers in context
  applyRegex(/(?:Routing|Account|Direct Deposit|IBAN|SWIFT|ABA)[:#\s]+([0-9A-Z]{8,24})/gi, 'financial', 'BANK_ACCOUNT');

  // 4. Personal Email Addresses (specifically personal webmail or explicit candidate email)
  applyRegex(/\b[A-Za-z0-9._%+-]+@(gmail|yahoo|hotmail|outlook|icloud|protonmail|aol|me|live)\.[A-Za-z]{2,}\b/gi, 'email', 'PERSONAL_EMAIL');

  // 5. Explicit candidate identity lines
  // e.g. "Candidate: John Doe", "Prepared for: Jane Smith", "Dear Alex Johnson,"
  applyRegex(/(?:Candidate:?|Employee:?|Applicant:?|Prepared for:?|Offered to:?|Attention:?|Dear|Dear Mr\.|Dear Ms\.|Dear Dr\.)[^\S\r\n]+([A-Z][a-z]+(?:[^\S\r\n]+[A-Z][a-z]+){1,2})/gi, 'name', 'CANDIDATE_NAME');

  // 6. Street Addresses (e.g. 742 Evergreen Terrace, Apt 3B, Austin, TX 78704)
  applyRegex(/\b\d{1,5}[^\S\r\n]+[^\r\n,]{2,35}(?:Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Boulevard|Blvd\.?|Lane|Ln\.?|Drive|Dr\.?|Terrace|Ter\.?|Place|Pl\.?|Way|Court|Ct\.?|Circle|Cir\.?)[^\r\n]{0,45}(?:\b\d{5}(?:-\d{4})?\b)?/gi, 'address', 'ADDRESS');

  // 7. Custom terms requested by user
  for (const term of customTerms) {
    if (!term || term.trim().length < 2) continue;
    const escaped = term.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const termRegex = new RegExp(`\\b${escaped}\\b`, 'gi');
    applyRegex(termRegex, 'custom', 'CONFIDENTIAL');
  }

  // Now replace all detected redactions in descending order of startIndex to preserve indices
  redactions.sort((a, b) => b.startIndex - a.startIndex);

  // Eliminate overlaps
  const cleanRedactions: RedactionToken[] = [];
  let lastStart = Infinity;

  for (const red of redactions) {
    if (red.endIndex <= lastStart) {
      cleanRedactions.unshift(red);
      lastStart = red.startIndex;
    }
  }

  // Construct sanitized string
  let sanitized = rawText;
  for (let i = cleanRedactions.length - 1; i >= 0; i--) {
    const item = cleanRedactions[i];
    sanitized = sanitized.slice(0, item.startIndex) + item.masked + sanitized.slice(item.endIndex);
  }

  return {
    sanitizedText: sanitized,
    redactions: cleanRedactions,
  };
}
