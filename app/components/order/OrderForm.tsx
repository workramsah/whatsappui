'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Mic, UploadCloud, Camera, ChevronDown, ChevronUp, HelpCircle, X } from 'lucide-react';
import {
  computeOcrQuality,
  type OcrQualityReport,
} from '@/lib/ocr/quality';
import { detectScript, type ScriptType } from '@/lib/text/scriptDetect';
import { hasDevanagari } from '@/lib/text/detectScript';

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

type BillPhotoState = {
  previewUrl: string;
  fileId: string;
  fileUrl: string;
  fileName: string;
};

type VoiceNoteState = {
  fileId: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
};

interface OrderFormProps {
  redirectBase: string; // e.g., "/try/preview" or "/order-input/preview"
}

export function OrderForm({ redirectBase }: OrderFormProps) {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [ocrText, setOcrText] = useState('');
  const [showOcrSection, setShowOcrSection] = useState(false);
  const [loadingOcr, setLoadingOcr] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrQuality, setOcrQuality] = useState<OcrQualityReport | null>(null);
  const [aiOcrLoading, setAiOcrLoading] = useState(false);
  const [aiOcrError, setAiOcrError] = useState<string | null>(null);
  const [strictness, setStrictness] = useState<'strict' | 'balanced' | 'loose'>(
    'balanced'
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billPhoto, setBillPhoto] = useState<BillPhotoState | null>(null);
  const [billPhotoError, setBillPhotoError] = useState<string | null>(null);
  const [uploadingBillPhoto, setUploadingBillPhoto] = useState(false);
  const [billPhotoFile, setBillPhotoFile] = useState<File | null>(null);
  const [ocrProgress, setOcrProgress] = useState<number | null>(null);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognitionLang, setRecognitionLang] = useState<
    'auto' | 'en' | 'ne' | 'hi' | 'ar'
  >('auto');
  const recognitionRef = useRef<any>(null);
  const [voiceNote, setVoiceNote] = useState<VoiceNoteState | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [uploadingVoice, setUploadingVoice] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcriptParseError, setTranscriptParseError] = useState<string | null>(null);
  const voiceInputRef = useRef<HTMLInputElement | null>(null);
  const billPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const voiceSectionRef = useRef<HTMLDivElement | null>(null);
  const inputTextRef = useRef<HTMLTextAreaElement | null>(null);
  const [showParsing, setShowParsing] = useState(false);
  const [showVoiceSection, setShowVoiceSection] = useState(false);
  const [aiItems, setAiItems] = useState<
    { name: string | null; qty: number | null; unit: string | null; rate: number | null; amount?: number | null }[]
  >([]);
  const [ocrLanguage, setOcrLanguage] = useState<'auto' | 'en' | 'ne'>('auto');
  const [detectedScript, setDetectedScript] = useState<ScriptType>('unknown');
  const [showFormatHelp, setShowFormatHelp] = useState(false);

  useEffect(() => {
    return () => {
      if (billPhoto?.previewUrl) {
        URL.revokeObjectURL(billPhoto.previewUrl);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [billPhoto]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    setRecognitionSupported(!!SpeechRecognition);
  }, []);

  const handleBillPhotoClick = () => {
    billPhotoInputRef.current?.click();
  };

  const handleBillPhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBillPhotoError(null);

    if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
      setBillPhotoError('Only jpg, jpeg, png, or webp files are supported.');
      event.target.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setUploadingBillPhoto(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/public/try/upload-bill', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setBillPhoto({
        previewUrl,
        fileId: data.fileId,
        fileUrl: data.absoluteFileUrl || data.fileUrl,
        fileName: file.name,
      });
      setBillPhotoFile(file);
      setOcrQuality(null);
      setAiOcrError(null);
      setShowOcrSection(false);
      setOcrText('');
    } catch (err) {
      URL.revokeObjectURL(previewUrl);
      setBillPhoto(null);
      setBillPhotoError(
        err instanceof Error ? err.message : 'Failed to upload image'
      );
      setShowOcrSection(false);
      setOcrQuality(null);
      setOcrText('');
      setOcrError(null);
      setBillPhotoFile(null);
    } finally {
      setUploadingBillPhoto(false);
      event.target.value = '';
    }
  };

  const handleRunOcr = async () => {
    if (!billPhoto) return;
    setLoadingOcr(true);
    setOcrError(null);
    setAiOcrError(null);
    setOcrProgress(null);

    try {
      const sourceBlob = await (async () => {
        if (billPhotoFile) {
          return billPhotoFile;
        }
        if (billPhoto.fileUrl) {
          const response = await fetch(billPhoto.fileUrl);
          if (!response.ok) {
            throw new Error('Unable to download bill photo for OCR.');
          }
          return await response.blob();
        }
        throw new Error('Bill photo not available.');
      })();

      const { default: Tesseract } = await import('tesseract.js');

      const langMap: Record<typeof ocrLanguage, string> = {
        auto: 'eng+hin',
        ne: 'eng+hin',
        en: 'eng',
      };

      const timeoutMs = 60000; // allow more time for handwriting/low-quality images
      const result = await Promise.race([
        Tesseract.recognize(sourceBlob, langMap[ocrLanguage] || 'eng', {
          logger: (message) => {
            if (
              message.status === 'recognizing text' &&
              typeof message.progress === 'number'
            ) {
              setOcrProgress(Math.round(message.progress * 100));
            }
          },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('OCR timed out. Please try again or tap "Try AI Reading".')), timeoutMs)
        ),
      ]) as any;

      const extracted = result.data?.text?.trim() || '';
      setOcrText(extracted);
      setDetectedScript(detectScript(extracted));
      if (hasDevanagari(extracted)) {
        setOcrLanguage('ne');
      }
      setShowOcrSection(true);
      const quality = computeOcrQuality(result, extracted);
      setOcrQuality(quality);
      setAiItems([]);
    } catch (err) {
      setOcrError(
        err instanceof Error ? err.message : 'Failed to extract text'
      );
      setShowOcrSection(false);
    } finally {
      setLoadingOcr(false);
      setOcrProgress(null);
    }
  };

  const extractPlainText = (raw: string) => {
    try {
      const cleaned = raw
        .replace(/^```[a-z]*\n?/i, '')
        .replace(/```$/, '')
        .trim();
      const parsed = JSON.parse(cleaned);
      if (parsed && typeof parsed === 'object') {
        return parsed.text || cleaned;
      }
      return cleaned;
    } catch {
      return raw;
    }
  };

  const handleAiRead = async () => {
    if (!billPhoto?.fileId) {
      setAiOcrError('Upload a bill photo first.');
      return;
    }
    setAiOcrLoading(true);
    setAiOcrError(null);
    try {
      const response = await fetch('/api/public/try/ai-read-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: billPhoto.fileId, language: ocrLanguage }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'AI reading failed');
      }
      const rawText = (data.text as string | undefined) || '';
      const extractedText = extractPlainText(rawText);

      if (!extractedText.trim()) {
        setAiOcrError('AI reading returned no text. Please retry or use manual input.');
        setAiOcrLoading(false);
        return;
      }

      setOcrText(extractedText);
      setDetectedScript(detectScript(extractedText));
      setShowOcrSection(true);
      setInputText((prev) => (prev.trim() ? prev : extractedText));
      const items = Array.isArray(data.items) ? data.items : [];
      setAiItems(
        items.map((i: any) => ({
          name: i?.name ?? null,
          qty: i?.qty ?? null,
          unit: i?.unit ?? null,
          rate: i?.rate ?? null,
          amount: i?.amount ?? null,
        }))
      );
      setOcrQuality({
        avgConfidence: null,
        wordCount: extractedText
          ? extractedText.split(/\s+/).filter((t: string) => t.length >= 2).length
          : 0,
        garbageRatio: 0,
        isLowQuality: false,
        reason: 'AI reading',
      });
      setAiOcrError(null);
    } catch (err) {
      setAiOcrError(
        err instanceof Error ? err.message : 'AI reading failed. Please try again.'
      );
    } finally {
      setAiOcrLoading(false);
    }
  };

  const handleVoiceUploadClick = () => {
    voiceInputRef.current?.click();
  };

  const handleVoiceChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setVoiceError(null);

    setUploadingVoice(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/public/try/upload-voice', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload voice note');
      }

      setVoiceNote({
        fileId: data.fileId,
        fileUrl: data.fileUrl,
        fileName: file.name,
        fileSize: file.size,
      });
    } catch (err) {
      setVoiceNote(null);
      setVoiceError(
        err instanceof Error ? err.message : 'Failed to upload voice note'
      );
    } finally {
      setUploadingVoice(false);
      event.target.value = '';
    }
  };

  const handleTranscribe = async () => {
    if (!voiceNote) return;
    setTranscribing(true);
    setVoiceError(null);
    try {
      const response = await fetch('/api/public/try/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: voiceNote.fileId,
          language: recognitionLang,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Transcription failed');
      }

      setTranscript(data.transcriptText || '');
    } catch (err) {
      setVoiceError(
        err instanceof Error ? err.message : 'Transcription failed'
      );
    } finally {
      setTranscribing(false);
    }
  };

  const getExtractButtonLabel = () => {
    if (loadingOcr) {
      if (ocrProgress !== null) {
        return `Extracting... ${ocrProgress}%`;
      }
      return 'Extracting...';
    }
    return showOcrSection ? 'Re-run OCR' : 'Extract text';
  };

  const submitWithText = async (text: string) => {
    if (!text.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/public/try', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputText: text.trim(), strictness }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate preview');
      }

      router.push(`${redirectBase}?draftId=${data.draftId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate preview'
      );
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && ocrText.trim()) {
      setInputText(ocrText.trim());
      await submitWithText(ocrText.trim());
      return;
    }
    await submitWithText((inputText || ocrText).trim());
  };

  const startListening = () => {
    if (!recognitionSupported || typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    if (recognitionLang !== 'auto') {
      const map: Record<string, string> = {
        en: 'en-US',
        ne: 'ne-NP',
        hi: 'hi-IN',
        ar: 'ar-SA',
      };
      recognition.lang = map[recognitionLang] || 'en-US';
    }

    recognition.onresult = (event: any) => {
      let combined = '';
      for (let i = 0; i < event.results.length; i++) {
        combined += event.results[i][0].transcript;
      }
      setTranscript(combined.trim());
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  };

  const handleConvertTranscript = async () => {
    if (!transcript.trim()) return;
    setTranscriptParseError(null);
    try {
      const res = await fetch('/api/parse/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcriptText: transcript.trim(),
          strictness,
          languageHint: recognitionLang === 'auto' ? 'auto' : recognitionLang === 'en' ? 'en' : 'ne',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not parse transcript.');
      }
      if (!data.items || !data.items.length) {
        setTranscriptParseError("Couldn't detect items. Please add commas or try again.");
        return;
      }
      const lines = data.items
        .map((item: any) => {
          const qty = item.qty ?? 1;
          const unit = item.unit ? ` ${item.unit}` : '';
          const name = (item.name || '').trim();
          if (!name) return '';
          return `${name} - ${qty}${unit}`.trim();
        })
        .filter((line: string) => line.trim().length > 0)
        .join('\n');
      setInputText(lines);
      await submitWithText(lines);
    } catch (err) {
      setTranscriptParseError(err instanceof Error ? err.message : 'Failed to parse transcript.');
    }
  };

  const shouldShowVoiceContent =
    showVoiceSection ||
    !!voiceNote ||
    !!transcript ||
    listening ||
    uploadingVoice ||
    transcribing ||
    !!voiceError;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        {/* Step 1 */}
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              Simply Try with Text
            </p>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-slate-900">
                    Paste Your order
                  </h2>
                </div>
                <p className="text-sm text-slate-600">
                  Paste the chat line-by-line. We keep your items intact for a
                  clean preview.
                </p>
              </div>
              <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 md:inline-flex">
                Required
              </span>
            </div>
          </div>
      <div className="flex flex-wrap items-center gap-3">
        <Label className="text-sm font-medium text-slate-800">OCR language</Label>
        <select
          value={ocrLanguage}
          onChange={(e) => setOcrLanguage(e.target.value as typeof ocrLanguage)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
        >
          <option value="auto">Auto</option>
          <option value="ne">Nepali (Devanagari)</option>
          <option value="en">English</option>
        </select>
      </div>

          <div className="relative">
            <Textarea
              id="input-text"
              placeholder="Example: 1kg rice, 2kg meat, 500g salt..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              ref={inputTextRef}
              rows={8}
              className="min-h-[180px] resize-none rounded-xl border-slate-200 bg-white text-base text-slate-900 shadow-inner focus-visible:ring-2 focus-visible:ring-blue-100 pr-10"
              required
            />
            <div className="absolute top-3 right-3">
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 transition-colors group"
                title="Order format examples"
              >
                <HelpCircle className="h-4 w-4" />
                <div className="absolute top-full right-0 mt-2 w-80 bg-slate-700 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="flex gap-4">
                    <div>
                      <div className="font-medium mb-1">Good formats:</div>
                      <div className="font-mono text-xs space-y-1">
                        <div>3 kg meat</div>
                        <div>2 kg coconut</div>
                        <div>500g salt</div>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Also works:</div>
                      <div className="font-mono text-xs space-y-1">
                        <div>meat 3kg</div>
                        <div>coconut - 2 kg</div>
                        <div>salt 500 grams</div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-full right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-slate-700"></div>
                </div>
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Tip: Add quantities and units for better line items.
          </p>
        </div>

        {/* Step 2 */}
        <div
          className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-5"
          ref={voiceSectionRef}
          id="voice-section"
        >
          <button
            type="button"
            className="flex w-full items-center justify-between text-left"
            onClick={() => setShowVoiceSection((prev) => !prev)}
            aria-expanded={shouldShowVoiceContent}
          >
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                Optional · Try if you have voice note
              </p>
              <p className="text-lg font-semibold text-slate-900">Voice</p>
              <p className="text-sm text-slate-600">
                Speak now or upload a WhatsApp voice note. We&apos;ll transcribe
                it into items.
              </p>
            </div>
            {shouldShowVoiceContent ? (
              <ChevronUp className="h-5 w-5 text-slate-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-500" />
            )}
          </button>

          {shouldShowVoiceContent && (
            <div className="mt-4 space-y-4">
              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="voice-lang"
                    className="text-sm font-medium text-slate-800"
                  >
                    Language
                  </Label>
                  <select
                    id="voice-lang"
                    value={recognitionLang}
                    onChange={(e) =>
                      setRecognitionLang(
                        e.target.value as 'auto' | 'en' | 'ne' | 'hi' | 'ar'
                      )
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                  >
                    <option value="auto">Auto</option>
                    <option value="en">English</option>
                    <option value="ne">Nepali</option>
                    <option value="hi">Hindi</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  {recognitionSupported ? (
                    listening ? (
                      <Button
                        type="button"
                        variant="destructive"
                        className="h-11 w-full text-sm sm:w-auto"
                        onClick={stopListening}
                      >
                        <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        Stop (Listening…)
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-11 w-full text-sm sm:w-auto"
                        onClick={startListening}
                      >
                        <span className="mr-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                          <Mic className="h-3.5 w-3.5" />
                        </span>
                        Speak now
                      </Button>
                    )
                  ) : (
                    <p className="text-sm text-slate-500">
                      Live dictation not supported on this browser.
                    </p>
                  )}

                  <div className="flex flex-col gap-2 sm:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 w-full text-sm sm:w-auto"
                      onClick={handleVoiceUploadClick}
                      disabled={uploadingVoice}
                    >
                      <span className="mr-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                        <UploadCloud className="h-3.5 w-3.5" />
                      </span>
                      {uploadingVoice
                        ? 'Uploading...'
                        : 'Upload WhatsApp voice note'}
                    </Button>
                    <input
                      ref={voiceInputRef}
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={handleVoiceChange}
                    />
                  </div>
                </div>
              </div>

              {voiceError && (
                <p className="text-sm text-destructive">{voiceError}</p>
              )}
              {transcriptParseError && (
                <p className="text-sm text-destructive">{transcriptParseError}</p>
              )}

              {voiceNote && (
                <div className="space-y-3 rounded-xl border border-dashed border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {voiceNote.fileName}
                      </p>
                      <p className="text-slate-500">
                        {(voiceNote.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                      Uploaded
                    </span>
                  </div>
                  <audio controls src={voiceNote.fileUrl} className="w-full" />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={transcribing}
                      onClick={handleTranscribe}
                    >
                      {transcribing ? 'Transcribing...' : 'Transcribe'}
                    </Button>
                  </div>
                </div>
              )}

              {(voiceNote || transcript || listening || showVoiceSection) && (
                <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <Label
                    htmlFor="transcript"
                    className="text-sm font-medium text-slate-800"
                  >
                    Transcript (editable)
                  </Label>
                  <Textarea
                    id="transcript"
                    rows={5}
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Dictation or uploaded voice note will appear here..."
                    className="rounded-xl border-slate-200 text-base text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-100"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-11 w-full text-base"
                    disabled={!transcript.trim() || submitting}
                    onClick={() => handleConvertTranscript()}
                  >
                    Convert transcript to items
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 3 */}
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                Optional · Try if you have bill photo
              </p>
              <p className="text-lg font-semibold text-slate-900">Bill photo</p>
              <p className="text-sm text-slate-600">
                Upload a bill photo to run OCR and merge with your order text.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="hidden h-11 items-center gap-2 text-sm sm:inline-flex"
              onClick={handleBillPhotoClick}
              disabled={uploadingBillPhoto}
            >
              <Camera className="h-4 w-4" />
              {uploadingBillPhoto
                ? 'Uploading...'
                : billPhoto
                ? 'Re-upload'
                : 'Upload'}
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full text-base sm:hidden"
              onClick={handleBillPhotoClick}
              disabled={uploadingBillPhoto}
            >
              <Camera className="mr-2 h-5 w-5" />
              {uploadingBillPhoto
                ? 'Uploading bill photo...'
                : billPhoto
                ? 'Re-upload bill photo'
                : 'Upload bill photo'}
            </Button>
            <input
              ref={billPhotoInputRef}
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(',')}
              className="hidden"
              onChange={handleBillPhotoChange}
            />

            {billPhotoError && (
              <p className="text-sm text-destructive">{billPhotoError}</p>
            )}

            {billPhoto && (
              <div className="flex items-center gap-4 rounded-xl border border-dashed border-slate-200 bg-white p-4 shadow-sm">
                <img
                  src={billPhoto.fileUrl}
                  alt="Bill preview"
                  className="h-20 w-16 rounded-lg object-cover"
                  onError={(e) => {
                    // Fallback to blob URL if API URL fails
                    const target = e.target as HTMLImageElement;
                    if (target.src !== billPhoto.previewUrl) {
                      target.src = billPhoto.previewUrl;
                    }
                  }}
                />
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-slate-900">
                    {billPhoto.fileName}
                  </p>
                  <p className="text-slate-500">Uploaded & ready for parsing</p>
                  <a
                    href={billPhoto.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    View full image
                  </a>
                </div>
              </div>
            )}

            {billPhoto && (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">
                      Extract text from this bill
                    </p>
                    <p className="text-xs text-slate-500">
                      We&apos;ll run OCR so you can edit the text before
                      converting to items.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleRunOcr}
                    disabled={loadingOcr}
                  >
                    {getExtractButtonLabel()}
                  </Button>
                </div>

                {ocrError && (
                  <p className="text-sm text-destructive">{ocrError}</p>
                )}
                {aiOcrError && (
                  <p className="text-sm text-destructive">{aiOcrError}</p>
                )}

                {showOcrSection && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="ocr-textarea"
                      className="text-sm font-medium text-slate-800"
                    >
                      Extracted text (editable)
                    </Label>
                    <Textarea
                      id="ocr-textarea"
                      rows={8}
                      value={ocrText}
                      onChange={(e) => {
                        setOcrText(e.target.value);
                        setDetectedScript(detectScript(e.target.value));
                        if (!inputText.trim()) {
                          setInputText('');
                        }
                      }}
                      className="rounded-xl border-slate-200 text-base text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-100"
                    />
                    <p className="text-xs text-slate-600">
                      Detected script: {detectedScript}
                    </p>
                    {detectedScript === 'arabic' && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setOcrLanguage('ne');
                          handleRunOcr();
                        }}
                      >
                        Re-run as Nepali
                      </Button>
                    )}
                    {ocrQuality?.isLowQuality && (
                      <p className="text-xs font-medium text-amber-700">
                        Low quality: {ocrQuality.reason}
                      </p>
                    )}
                    {!ocrQuality?.isLowQuality && ocrQuality?.reason === 'AI reading' && (
                      <p className="text-xs text-green-700">
                        AI reading applied for better accuracy.
                      </p>
                    )}
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setInputText(ocrText);
                      }}
                      disabled={!ocrText.trim()}
                    >
                      Convert text to items
                    </Button>
                    {aiItems.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const lines = aiItems
                            .map((i) => {
                              const parts = [i.name || '']
                              if (i.qty != null) parts.push(`- ${i.qty}`)
                              if (i.unit) parts.push(i.unit)
                              if (i.rate != null) parts.push(`@ ${i.rate}`)
                              return parts.join(' ').trim()
                            })
                            .filter(Boolean)
                          const combined = lines.join('\n')
                          setOcrText(combined)
                          setInputText((prev) => (prev.trim() ? prev : combined))
                        }}
                        disabled={aiOcrLoading}
                      >
                        Apply extracted items
                      </Button>
                    )}
                    {ocrQuality?.isLowQuality && (
                      <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-semibold text-amber-900">
                            Handwritten or unclear image detected
                          </p>
                          <p className="text-sm text-amber-800">
                            Standard OCR may be inaccurate. Try AI Reading or use Voice/Manual input.
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button
                            type="button"
                            className="h-10 flex-1"
                            onClick={handleAiRead}
                            disabled={aiOcrLoading}
                          >
                            {aiOcrLoading ? 'Reading…' : 'Try AI Reading'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-10 flex-1"
                            onClick={() =>
                              voiceSectionRef.current?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start',
                              })
                            }
                          >
                            Use Voice
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-10 flex-1"
                            onClick={() => {
                              inputTextRef.current?.focus();
                              inputTextRef.current?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center',
                              });
                            }}
                          >
                            Type manually
                          </Button>
                        </div>
                        <p className="text-xs text-amber-800">
                          Low quality: {ocrQuality.reason}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Advanced options */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-5">
          <button
            type="button"
            className="flex w-full items-center justify-between text-left"
            onClick={() => setShowParsing((p) => !p)}
            aria-expanded={showParsing}
          >
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                Advanced options
              </p>
              <p className="text-lg font-semibold text-slate-900">
                Parsing Strictness
              </p>
              <p className="text-sm text-slate-600">
                Balance how we filter noise like &quot;ok&quot;,
                &quot;yes&quot;, &quot;send&quot;.
              </p>
            </div>
            {showParsing ? (
              <ChevronUp className="h-5 w-5 text-slate-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-500" />
            )}
          </button>

          {showParsing && (
            <div className="mt-4 space-y-3">
              <select
                id="strictness"
                value={strictness}
                onChange={(e) =>
                  setStrictness(
                    e.target.value as 'strict' | 'balanced' | 'loose'
                  )
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="balanced" title="Recommended">
                  Balanced (recommended)
                </option>
                <option value="strict" title="Filters more noise">
                  Strict
                </option>
                <option value="loose" title="Keeps more lines">
                  Light
                </option>
              </select>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-center text-sm text-slate-500">
            Nothing is saved unless you create an account.
          </p>
          <div className="hidden md:block">
            <Button
              type="submit"
              disabled={!inputText.trim() || submitting}
              className="h-12 w-full rounded-full bg-[#3B82F6] text-base font-semibold text-white shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-[1px] hover:bg-[#2563EB]"
              size="lg"
            >
              {submitting ? 'Generating...' : 'Generate Invoice Preview'}
            </Button>
            <p className="mt-2 text-center text-xs text-slate-500">
              No signup required · Takes &lt; 10 seconds
            </p>
          </div>
        </div>
      </div>

      {/* Sticky CTA for mobile */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
        <Button
          type="submit"
          disabled={!inputText.trim() || submitting}
          className="h-12 w-full rounded-full bg-[#3B82F6] text-base font-semibold text-white shadow-[0_10px_30px_rgba(15,23,42,0.12)] transition hover:bg-[#2563EB]"
          size="lg"
        >
          {submitting ? 'Generating...' : 'Generate Invoice Preview'}
        </Button>
        <p className="mt-2 text-center text-xs text-slate-500">
          No signup required · Takes &lt; 10 seconds
        </p>
      </div>

      {/* Format Help Modal */}
      {showFormatHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Order Format Examples</h3>
              <button
                type="button"
                onClick={() => setShowFormatHelp(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-slate-900 mb-2">Good formats:</p>
                <div className="bg-slate-50 rounded-lg p-3 space-y-1 font-mono text-xs">
                  <div>3 kg meat</div>
                  <div>2 kg coconut</div>
                  <div>500g salt</div>
                  <div>1 box rice - 25kg</div>
                  <div>2 pcs chicken</div>
                </div>
              </div>
              <div>
                <p className="font-medium text-slate-900 mb-2">Also works:</p>
                <div className="bg-slate-50 rounded-lg p-3 space-y-1 font-mono text-xs">
                  <div>meat 3kg</div>
                  <div>coconut - 2 kg</div>
                  <div>salt 500 grams</div>
                  <div>rice 1 bag</div>
                </div>
              </div>
              <p className="text-slate-600">
                💡 Include quantities and units for better line items. Each line becomes one item.
              </p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
