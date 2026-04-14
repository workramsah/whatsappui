/**
 * OCR Quality Analysis Module
 */

export interface OcrQualityReport {
  quality?: number;
  confidence?: number;
  issues?: string[];
  avgConfidence?: number | null;
  wordCount?: number;
  garbageRatio?: number;
  isLowQuality?: boolean;
  reason?: string;
}

export function computeOcrQuality(result: any, text: string): OcrQualityReport {
  return {
    quality: 0.8,
    confidence: 0.9,
    issues: [],
  };
}
