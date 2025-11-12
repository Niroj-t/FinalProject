import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';
import mongoose from 'mongoose';

interface MatchResult {
  submissionId: mongoose.Types.ObjectId;
  score: number;
}

export interface SimilarityReport {
  score: number;
  category: 'none' | 'low' | 'medium' | 'high';
  matches: MatchResult[];
  contentHash?: string;
  normalizedText?: string;
  extractedText?: string;
}

interface ExistingSubmission {
  _id: mongoose.Types.ObjectId | string;
  normalizedText?: string;
  contentHash?: string;
}

const TEXT_EXTENSIONS = new Set(['.txt', '.md', '.markdown', '.csv', '.tsv', '.json']);

const CATEGORY_THRESHOLDS: Record<'none' | 'low' | 'medium' | 'high', number> = {
  none: 0,
  low: 0.4,
  medium: 0.6,
  high: 0.8
};

export const bucketScore = (score: number): 'none' | 'low' | 'medium' | 'high' => {
  if (score >= CATEGORY_THRESHOLDS.high) return 'high';
  if (score >= CATEGORY_THRESHOLDS.medium) return 'medium';
  if (score >= CATEGORY_THRESHOLDS.low) return 'low';
  return 'none';
};

export const normalizeText = (input?: string | null): string | undefined => {
  if (!input) return undefined;

  const normalized = input
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return normalized.length > 0 ? normalized : undefined;
};

const buildVector = (normalized?: string): Map<string, number> => {
  const vector = new Map<string, number>();
  if (!normalized) {
    return vector;
  }

  for (const token of normalized.split(' ')) {
    if (!token) continue;
    vector.set(token, (vector.get(token) ?? 0) + 1);
  }

  return vector;
};

const cosineSimilarity = (a: Map<string, number>, b: Map<string, number>): number => {
  if (a.size === 0 || b.size === 0) return 0;

  let dot = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (const value of a.values()) {
    magnitudeA += value * value;
  }

  for (const value of b.values()) {
    magnitudeB += value * value;
  }

  const denom = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  if (denom === 0) return 0;

  const smaller = a.size < b.size ? a : b;
  const larger = a.size < b.size ? b : a;

  for (const [token, weight] of smaller.entries()) {
    const otherWeight = larger.get(token);
    if (otherWeight) {
      dot += weight * otherWeight;
    }
  }

  return Math.min(1, Math.max(0, dot / denom));
};

export const createContentHash = (normalized?: string): string | undefined => {
  if (!normalized) return undefined;
  return createHash('sha256').update(normalized).digest('hex');
};

const readTextFile = async (filePath: string): Promise<string | undefined> => {
  try {
    const buffer = await fs.readFile(filePath);
    return buffer.toString('utf-8');
  } catch (error) {
    console.warn(`Failed to read text file ${filePath}:`, error);
    return undefined;
  }
};

const readJsonFile = async (filePath: string): Promise<string | undefined> => {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
  } catch (error) {
    console.warn(`Failed to read JSON file ${filePath}:`, error);
    return undefined;
  }
};

const readPdfFile = async (filePath: string): Promise<string | undefined> => {
  try {
    const { default: pdfParse } = await import('pdf-parse');
    const data = await pdfParse(await fs.readFile(filePath));
    return data.text;
  } catch (error) {
    console.warn(`Failed to read PDF file ${filePath}:`, error);
    return undefined;
  }
};

const readDocxFile = async (filePath: string): Promise<string | undefined> => {
  try {
    const { default: mammoth } = await import('mammoth');
    const { value } = await mammoth.extractRawText({ path: filePath });
    return value;
  } catch (error) {
    console.warn(`Failed to read DOCX file ${filePath}:`, error);
    return undefined;
  }
};

const toObjectId = (value: mongoose.Types.ObjectId | string): mongoose.Types.ObjectId => {
  return typeof value === 'string' ? new mongoose.Types.ObjectId(value) : value;
};

export const extractSubmissionText = async (files: string[], providedText?: string): Promise<string | undefined> => {
  const chunks: string[] = [];

  if (providedText) {
    chunks.push(providedText);
  }

  for (const filePath of files) {
    const extension = path.extname(filePath).toLowerCase();

    if (TEXT_EXTENSIONS.has(extension)) {
      const content = extension === '.json'
        ? await readJsonFile(filePath)
        : await readTextFile(filePath);
      if (content) chunks.push(content);
      continue;
    }

    if (extension === '.pdf') {
      const content = await readPdfFile(filePath);
      if (content) chunks.push(content);
      continue;
    }

    if (extension === '.docx') {
      const content = await readDocxFile(filePath);
      if (content) chunks.push(content);
      continue;
    }
  }

  const combined = chunks.join('\n').trim();
  return combined.length > 0 ? combined : undefined;
};

export const buildSimilarityReport = (
  normalizedText: string | undefined,
  contentHash: string | undefined,
  peers: ExistingSubmission[]
): SimilarityReport => {
  if (!normalizedText) {
    return {
      score: 0,
      category: 'none',
      matches: [],
      contentHash,
      normalizedText
    };
  }

  const vector = buildVector(normalizedText);
  const matches: MatchResult[] = [];

  for (const peer of peers) {
    let score = 0;

    if (contentHash && peer.contentHash && contentHash === peer.contentHash) {
      score = 1;
    } else if (peer.normalizedText) {
      const peerVector = buildVector(peer.normalizedText);
      score = cosineSimilarity(vector, peerVector);
    }

    if (score > 0) {
      matches.push({
        submissionId: toObjectId(peer._id),
        score: Number(score.toFixed(4))
      });
    }
  }

  matches.sort((a, b) => b.score - a.score);
  const topScore = matches[0]?.score ?? 0;

  return {
    score: topScore,
    category: bucketScore(topScore),
    matches,
    contentHash,
    normalizedText
  };
};

