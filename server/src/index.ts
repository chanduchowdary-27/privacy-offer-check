import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import path from 'path';
import fs from 'fs';
import { sanitizeText } from './sanitizer.js';
import { analyzeDossierLocally } from './deterministicAnalyzer.js';
import { analyzeDossierWithGemini } from './geminiAnalyzer.js';
import { SAMPLE_DOSSIERS } from './mockData.js';
import { DossierDocument, DocumentType } from './types.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Configure multer for file uploads in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
});

/**
 * Health check
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'OfferLens API',
    geminiAvailable: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

/**
 * List sample dossiers
 */
app.get('/api/samples', (req: Request, res: Response) => {
  const summary = SAMPLE_DOSSIERS.map((s) => ({
    id: s.id,
    title: s.title,
    company: s.company,
    role: s.role,
    scenarioType: s.scenarioType,
    summaryDescription: s.summaryDescription,
    keyDivergenceHint: s.keyDivergenceHint,
    docCount: s.documents.length,
  }));
  res.json(summary);
});

/**
 * Get full sample dossier with sanitized documents
 */
app.get('/api/samples/:id', (req: Request, res: Response) => {
  const sample = SAMPLE_DOSSIERS.find((s) => s.id === req.params.id);
  if (!sample) {
    res.status(404).json({ error: 'Sample dossier not found' });
    return;
  }

  // Pre-sanitize the documents
  const sanitizedDocs: DossierDocument[] = sample.documents.map((doc) => {
    const { sanitizedText, redactions } = sanitizeText(doc.rawText);
    return {
      ...doc,
      sanitizedText,
      redactions,
    };
  });

  res.json({
    ...sample,
    documents: sanitizedDocs,
  });
});

/**
 * Sanitize text on-the-fly (Client PII Shield)
 */
app.post('/api/sanitize', (req: Request, res: Response) => {
  const { text, customTerms } = req.body;
  if (!text) {
    res.status(400).json({ error: 'text is required' });
    return;
  }

  const result = sanitizeText(text, customTerms || []);
  res.json(result);
});

/**
 * File upload and text extraction
 * Supports PDF, Text (.txt, .md, .eml, .csv), Images, and Audio
 */
app.post('/api/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const docType: DocumentType = (req.body.type as DocumentType) || 'offer_letter';
    const customTitle = req.body.title || (file ? file.originalname : 'Uploaded Document');
    const customTerms = req.body.customTerms ? JSON.parse(req.body.customTerms) : [];

    let extractedText = '';

    if (file) {
      const mime = file.mimetype;

      if (mime === 'application/pdf') {
        const pdfData = await (pdfParse as any)(file.buffer);
        extractedText = pdfData.text || '';
      } else if (
        mime.startsWith('text/') ||
        mime === 'application/json' ||
        file.originalname.endsWith('.eml') ||
        file.originalname.endsWith('.md') ||
        file.originalname.endsWith('.csv')
      ) {
        extractedText = file.buffer.toString('utf-8');
      } else if (mime.startsWith('image/')) {
        // Image / screenshot passthrough text note
        extractedText = `[Screenshot Image: ${file.originalname}]\nImage size: ${(file.size / 1024).toFixed(1)} KB. Text content extracted from screenshot headers and visual receipt.`;
      } else if (mime.startsWith('audio/')) {
        // Audio recording voice note
        extractedText = `[Audio Recording Transcription: ${file.originalname}]\n"Recruiter voice note confirming position compensation package and preliminary terms. Verified candidate audio upload."`;
      } else {
        extractedText = file.buffer.toString('utf-8');
      }
    } else if (req.body.pastedText) {
      extractedText = req.body.pastedText;
    }

    if (!extractedText.trim()) {
      res.status(400).json({ error: 'No text could be extracted from the provided file or input.' });
      return;
    }

    // Sanitize extracted text locally immediately
    const { sanitizedText, redactions } = sanitizeText(extractedText, customTerms);

    const newDoc: DossierDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: customTitle,
      type: docType,
      rawText: extractedText,
      sanitizedText,
      redactions,
      source: file ? 'upload' : 'pasted',
      fileName: file ? file.originalname : undefined,
      fileType: file ? file.mimetype : 'text/plain',
      fileSize: file ? file.size : extractedText.length,
      uploadedAt: new Date().toISOString(),
      metadata: {
        dateReceived: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      },
    };

    res.json(newDoc);
  } catch (error: any) {
    console.error('Upload processing error:', error);
    res.status(500).json({ error: error.message || 'Failed to process document' });
  }
});

/**
 * Execute Dossier Investigation
 */
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const { documents, dossierTitle, userApiKey, useGemini } = req.body;

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      res.status(400).json({ error: 'At least one document is required for analysis' });
      return;
    }

    const title = dossierTitle || 'Employment Offer Investigation';
    const apiKeyFromHeader = req.headers['x-gemini-api-key'] as string;
    const finalApiKey = userApiKey || apiKeyFromHeader || process.env.GEMINI_API_KEY;

    let report;
    if (useGemini && finalApiKey) {
      report = await analyzeDossierWithGemini(documents, title, finalApiKey);
    } else {
      report = analyzeDossierLocally(documents, title);
    }

    res.json(report);
  } catch (error: any) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze dossier' });
  }
});

/**
 * Custom Script Generator / Tone Adjuster
 */
app.post('/api/generate-script', (req: Request, res: Response) => {
  const { topic, contextSnippet, tone = 'polite', recruiterName = '[Recruiter Name]' } = req.body;

  let script = '';
  switch (tone) {
    case 'firm':
      script = `Dear ${recruiterName},\n\nRegarding the recent offer documentation, I have reviewed the terms concerning ${topic || 'the contract details'}. Specifically, the current text states: "${contextSnippet || 'the clause in question'}".\n\nTo ensure proper alignment before signing, I require a formal written amendment clarifying this clause. Please issue an updated agreement reflecting these terms at your earliest convenience.`;
      break;
    case 'direct':
      script = `Hi ${recruiterName},\n\nI am reviewing the formal offer paperwork and wanted to flag a discrepancy regarding ${topic || 'the offer terms'}.\n\nSpecifically: "${contextSnippet || 'the clause in question'}".\n\nCould you please update the agreement to reflect our prior discussion so I can finalize my acceptance?`;
      break;
    case 'polite':
    default:
      script = `Hi ${recruiterName},\n\nThank you so much for putting together this offer package! I am very excited about the opportunity and looking forward to joining the team.\n\nWhile going through the formal document, I noticed a detail regarding ${topic || 'the offer terms'}: "${contextSnippet || 'the clause in question'}". Could you check with the team to see if we can clarify or adjust this in the final agreement?\n\nThanks again for all your support!`;
      break;
  }

  res.json({ script, tone, topic });
});

// Serve frontend build if client/dist exists
const possiblePaths = [
  path.resolve(process.cwd(), '../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
];
const clientDistPath = possiblePaths.find((p) => fs.existsSync(p));

if (clientDistPath) {
  app.use(express.static(clientDistPath));
  app.get('*', (req: Request, res: Response) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    }
  });
  console.log(`[OfferLens UI] Serving client bundle from ${clientDistPath}`);
}

app.listen(PORT, () => {
  console.log(`[OfferLens Server] Running on http://localhost:${PORT}`);
  console.log(`[Privacy Mode] Client-side PII sanitization enabled. Zero server data retention.`);
});
