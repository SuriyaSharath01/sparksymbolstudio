import React, { useMemo, useState } from 'react';
import { CheckCircle2, FileText, Printer, ShieldAlert, ShieldCheck, Volume2 } from 'lucide-react';
import { searchMulberrySymbols, type MulberrySymbol } from '../../data/symbols';
import { scrubClinicalText } from '../../utils/piiScrubber';

interface Props {
  symbols: MulberrySymbol[];
  careInitials: string;
  careReviewNote: string;
}

interface EasyReadBlock {
  id: string;
  sentence: string;
  symbolSrc: string;
  symbolLabel: string;
}

const SAMPLE_CLINICAL_LETTER = `Dear Resident (NHS: 485 777 3456),
Your dental check-up is booked for 14/12/2026 at Preston Clinic, PR1 6QD.
Please bring your toothbrush and drink water beforehand.
If you feel worried or need a quiet break, tell your support staff on 07700 900123.`;

export const EasyReadWriterPanel: React.FC<Props> = ({
  symbols,
  careInitials,
  careReviewNote,
}) => {
  const [rawInput, setRawInput] = useState<string>('');
  const [piiApproved, setPiiApproved] = useState<boolean>(false);
  const [generatedBlocks, setGeneratedBlocks] = useState<EasyReadBlock[]>([]);

  const scrubPreview = useMemo(() => scrubClinicalText(rawInput), [rawInput]);

  const handleInputChange = (val: string) => {
    setRawInput(val);
    setPiiApproved(false);
    setGeneratedBlocks([]);
  };

  const handleGenerateEasyRead = () => {
    const cleanSource = scrubPreview.scrubbedText.trim();
    if (!cleanSource) return;

    const lines = cleanSource
      .split(/\r?\n|(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const blocks: EasyReadBlock[] = lines.map((sentence, idx) => {
      const keywords = sentence
        .replace(/\[[A-Z_]+\]/g, '')
        .toLowerCase()
        .split(/[^a-z]+/)
        .filter((w) => w.length >= 3 && !['the', 'and', 'for', 'your', 'you', 'are', 'with', 'that', 'this', 'please'].includes(w));

      let matched: MulberrySymbol | undefined;
      for (const kw of keywords) {
        const hit = searchMulberrySymbols(symbols, kw, 'All', 1)[0];
        if (hit) {
          matched = hit;
          break;
        }
      }

      return {
        id: `er-${Date.now()}-${idx}`,
        sentence,
        symbolSrc: matched?.svgPath || '',
        symbolLabel: matched?.label || keywords[0] || 'Information',
      };
    });

    setGeneratedBlocks(blocks);
  };

  const handleReadAloud = () => {
    if (!generatedBlocks.length || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    window.speechSynthesis.cancel();
    const fullText = generatedBlocks.map((b) => b.sentence).join('. ');
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = 'en-GB';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const hasRedactions = scrubPreview.redactions.length > 0;
  const canGenerate = rawInput.trim().length > 0 && (!hasRedactions || piiApproved);

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-900">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Zero-PII Easy Read Writer
            </span>
            <span className="text-xs font-semibold text-slate-600">
              100% local on-device redaction before symbolising care notes or letters
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleInputChange(SAMPLE_CLINICAL_LETTER)}
            className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-800 hover:bg-slate-100"
          >
            Load Sample Clinic Letter
          </button>
        </div>

        <div className="mt-3">
          <label className="block text-xs font-extrabold text-slate-800">
            Paste Care Plan Note, Hospital Letter, or House Update
          </label>
          <textarea
            rows={4}
            value={rawInput}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Paste text here. NHS numbers, UK postcodes, phone numbers, and dates are scrubbed locally before building Easy Read..."
            className="mt-1.5 w-full rounded-xl border border-slate-300 p-3 text-xs font-semibold text-slate-800 focus:border-slate-600 focus:outline-none"
          />
        </div>

        {/* Human-in-the-Loop PII Review Strip */}
        {rawInput.trim().length > 0 && (
          <div
            className={`mt-3 rounded-xl border p-3.5 ${
              hasRedactions
                ? piiApproved
                  ? 'border-emerald-300 bg-emerald-50/70'
                  : 'border-amber-300 bg-amber-50'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {hasRedactions ? (
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                )}
                <span className="text-xs font-extrabold text-slate-900">
                  {hasRedactions
                    ? `Human-in-the-Loop PII Check: ${scrubPreview.redactions.length} sensitive item(s) masked locally`
                    : 'Zero-PII Check Passed: No NHS numbers, postcodes, or phone numbers detected'}
                </span>
              </div>

              {hasRedactions && (
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-extrabold text-slate-900">
                  <input
                    type="checkbox"
                    checked={piiApproved}
                    onChange={(e) => setPiiApproved(e.target.checked)}
                    className="accent-emerald-600"
                  />
                  Approve Scrubbed Output
                </label>
              )}
            </div>

            {hasRedactions && (
              <div className="mt-2.5 grid grid-cols-1 gap-2.5 md:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500">
                    Detected &amp; Masked Items
                  </span>
                  <ul className="mt-1 space-y-1 text-xs font-semibold text-slate-700">
                    {scrubPreview.redactions.map((r, idx) => (
                      <li key={idx}>
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                          {r.type}
                        </span>{' '}
                        <span className="line-through text-slate-400">{r.original}</span> →{' '}
                        <strong className="text-slate-900">{r.replacement}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500">
                    Scrubbed Easy Read Preview
                  </span>
                  <p className="mt-1 whitespace-pre-line text-xs font-semibold text-slate-800">
                    {scrubPreview.scrubbedText}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            disabled={!canGenerate}
            onClick={handleGenerateEasyRead}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#E36C2B] px-4 py-2 text-xs font-extrabold text-white transition hover:bg-[#c85a1e] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <FileText className="h-3.5 w-3.5" />
            Generate Easy Read Sheet
          </button>
        </div>
      </div>

      {/* Generated Easy Read Sheet */}
      {generatedBlocks.length > 0 && (
        <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm print:border-0 print:p-2 print:shadow-none">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                Easy Read Information Sheet
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                {careInitials ? `${careInitials} · ` : ''}
                {careReviewNote || 'Accessible Information Standard Easy Read'}
              </p>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <button
                type="button"
                onClick={handleReadAloud}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-extrabold text-slate-800 hover:bg-slate-100"
              >
                <Volume2 className="h-3.5 w-3.5" />
                Read Aloud (UK)
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-slate-800"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Easy Read
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {generatedBlocks.map((block) => (
              <div
                key={block.id}
                className="flex items-center gap-4 rounded-xl border-2 border-slate-200 bg-[#FAFAF8] p-3.5"
              >
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5">
                  {block.symbolSrc ? (
                    <img
                      src={block.symbolSrc}
                      alt={block.symbolLabel}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">Easy Read</span>
                  )}
                </div>
                <p className="text-base font-extrabold leading-snug text-slate-900 sm:text-lg">
                  {block.sentence}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
