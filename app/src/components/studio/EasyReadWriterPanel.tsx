import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  FileText,
  Printer,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import type { MulberrySymbol } from '../../data/symbols';
import { scrubClinicalText } from '../../utils/piiScrubber';
import {
  buildSymbolLookupIndex,
  classifySemanticTone,
  resolveWordSymbol,
  searchRankedSymbols,
  SMALL_FILLER_WORDS,
  toneBorderClasses,
  type GrammarOverlay,
} from '../../utils/autoSymbolise';

interface Props {
  symbols: MulberrySymbol[];
  careInitials: string;
  careReviewNote: string;
}

interface WordOverride {
  svgPath?: string;
  label?: string;
  caption?: string;
  hideSymbol?: boolean;
  overlay?: GrammarOverlay;
}

type PaperTintId = 'white' | 'cream' | 'mint' | 'yellow';
type SymbolSizeId = 'sm' | 'md' | 'lg';
type DocumentViewMode = 'a4-writer' | 'easy-read-rows';

const PAPER_TINTS: { id: PaperTintId; name: string; hex: string; swatchClass: string }[] = [
  { id: 'white', name: 'Crisp White', hex: '#FFFFFF', swatchClass: 'bg-white border-slate-300' },
  { id: 'cream', name: 'Low-Arousal Cream', hex: '#FAF8F0', swatchClass: 'bg-[#FAF8F0] border-amber-300' },
  { id: 'mint', name: 'Calm Mint', hex: '#F1F7F4', swatchClass: 'bg-[#F1F7F4] border-emerald-300' },
  { id: 'yellow', name: 'Dyslexia Yellow', hex: '#FEFCE8', swatchClass: 'bg-[#FEFCE8] border-yellow-400' },
];

const UK_CARE_TEMPLATES: {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  body: string;
}[] = [
  {
    id: 'gp_visit',
    badge: 'NHS & Health',
    title: 'My GP & Clinic Appointment',
    subtitle: 'Accessible Health Information • NHS AIS',
    body: `First we will have a cup of tea at home.
Then we are going to see the doctor at the clinic.
You can bring your hospital passport and ask for a quiet break at any time.`,
  },
  {
    id: 'morning_care',
    badge: 'Daily Living',
    title: 'Morning Care Routine',
    subtitle: 'Predictable Step-by-Step Support',
    body: `Good morning. First wash your hands and brush your teeth.
Next have breakfast and drink water.
Then take your morning medication with staff support.`,
  },
  {
    id: 'consent_mca',
    badge: 'MCA & Consent',
    title: 'My Choice & Consent',
    subtitle: 'Supported Decision-Making • Mental Capacity Act',
    body: `This is my choice. Please explain more before I decide.
I can say yes, no, or wait for more time.
Staff will listen and respect my decision.`,
  },
  {
    id: 'iddsi_meal',
    badge: 'IDDSI Safety',
    title: 'Safe Mealtime Support',
    subtitle: 'SALT & Dysphagia Mealtime Guidance',
    body: `Please sit upright to eat your IDDSI meal slowly.
Have a safe drink of water between bites.
Tell staff when you are finished or if you feel pain.`,
  },
  {
    id: 'clinical_letter',
    badge: 'Zero-PII Scrubber',
    title: 'Dental Appointment Letter (Scrubbed)',
    subtitle: 'Personal Identifiers Automatically Redacted Locally',
    body: `Dear Resident (NHS: 485 777 3456),
Your dental appointment is booked for 14/12/2026 at Preston Clinic, PR1 6QD.
Please bring your toothbrush and drink water before you go.
If you feel worried or need a quiet break, tell staff on 07700 900123.`,
  },
];

const GRAMMAR_OVERLAY_OPTIONS: { id: GrammarOverlay; label: string; badge: string }[] = [
  { id: 'none', label: 'None', badge: '—' },
  { id: 'negation', label: 'Not / No', badge: '⊘' },
  { id: 'question', label: 'Question', badge: '?' },
  { id: 'past', label: 'Past', badge: '←' },
  { id: 'future', label: 'Future', badge: '→' },
  { id: 'plural', label: 'Plural', badge: '++' },
];

function renderOverlayVisual(overlay: GrammarOverlay) {
  if (overlay === 'none') return null;
  if (overlay === 'negation') {
    return (
      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <line x1="14" y1="86" x2="86" y2="14" stroke="#DC2626" strokeWidth="9" strokeLinecap="round" />
        <circle cx="50" cy="50" r="41" fill="none" stroke="#DC2626" strokeWidth="6" opacity="0.85" />
      </svg>
    );
  }
  const badgeMap: Record<Exclude<GrammarOverlay, 'none' | 'negation'>, { text: string; cls: string }> = {
    question: { text: '?', cls: 'bg-sky-600 text-white' },
    past: { text: '←', cls: 'bg-slate-700 text-white' },
    future: { text: '→', cls: 'bg-indigo-600 text-white' },
    plural: { text: '++', cls: 'bg-amber-600 text-white' },
  };
  const cfg = badgeMap[overlay];
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute top-0.5 right-0.5 rounded px-1 py-0.2 text-[10px] font-black leading-tight shadow-xs ${cfg.cls}`}
    >
      {cfg.text}
    </span>
  );
}

function overlayPrintHtml(overlay: GrammarOverlay): string {
  if (overlay === 'none') return '';
  if (overlay === 'negation') {
    return '<svg viewBox="0 0 100 100" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;"><line x1="14" y1="86" x2="86" y2="14" stroke="#DC2626" stroke-width="9" stroke-linecap="round"/><circle cx="50" cy="50" r="41" fill="none" stroke="#DC2626" stroke-width="6" opacity="0.85"/></svg>';
  }
  const styles: Record<Exclude<GrammarOverlay, 'none' | 'negation'>, { text: string; bg: string }> = {
    question: { text: '?', bg: '#0284c7' },
    past: { text: '←', bg: '#334155' },
    future: { text: '→', bg: '#4f46e5' },
    plural: { text: '++', bg: '#d97706' },
  };
  const s = styles[overlay];
  return `<span style="position:absolute;top:2px;right:2px;background:${s.bg};color:#fff;font-size:10px;font-weight:800;border-radius:4px;padding:1px 4px;line-height:1.1;">${s.text}</span>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const EasyReadWriterPanel: React.FC<Props> = ({
  symbols,
  careInitials,
  careReviewNote,
}) => {
  const [docTitle, setDocTitle] = useState<string>(UK_CARE_TEMPLATES[0].title);
  const [docSubtitle, setDocSubtitle] = useState<string>(UK_CARE_TEMPLATES[0].subtitle);
  const [rawInput, setRawInput] = useState<string>(UK_CARE_TEMPLATES[0].body);

  const [viewMode, setViewMode] = useState<DocumentViewMode>('a4-writer');
  const [paperTint, setPaperTint] = useState<PaperTintId>('white');
  const [symbolSize, setSymbolSize] = useState<SymbolSizeId>('md');
  const [hideSmallWords, setHideSmallWords] = useState<boolean>(true);
  const [colourfulSemantics, setColourfulSemantics] = useState<boolean>(true);
  const [openDyslexic, setOpenDyslexic] = useState<boolean>(false);
  const [autoScrubPii, setAutoScrubPii] = useState<boolean>(true);

  const [wordOverrides, setWordOverrides] = useState<Record<string, WordOverride>>({});
  const [selectedTokenKey, setSelectedTokenKey] = useState<string | null>(null);
  const [pickerQuery, setPickerQuery] = useState<string>('');

  const lookupIndex = useMemo(() => buildSymbolLookupIndex(symbols), [symbols]);

  const scrubResult = useMemo(() => scrubClinicalText(rawInput), [rawInput]);
  const redactedMatches = useMemo(() => {
    const found = scrubResult.scrubbedText.match(/\[[A-Z_]+\]/g);
    return found ? found.length : 0;
  }, [scrubResult.scrubbedText]);

  const effectiveText = autoScrubPii ? scrubResult.scrubbedText : rawInput;

  const paragraphs = useMemo(() => {
    const lines = effectiveText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    return lines.map((line, pIdx) => {
      const rawTokens = line.split(/\s+/).filter(Boolean);
      const tokens = rawTokens.map((raw, wIdx) => {
        const key = `${pIdx}-${wIdx}`;
        const cleanWord = raw.replace(/^[^a-zA-Z0-9\[]+|[^a-zA-Z0-9\]]+$/g, '');
        const lower = cleanWord.toLowerCase();
        const isRedactedToken = /^\[[A-Z_]+\]$/.test(cleanWord);
        const isFiller = SMALL_FILLER_WORDS.has(lower);
        const autoMatch =
          isRedactedToken || (hideSmallWords && isFiller)
            ? null
            : resolveWordSymbol(cleanWord, lookupIndex);

        // Auto-detect explicit negation words ("no", "not", "don't")
        const autoOverlay: GrammarOverlay =
          ['no', 'not', "don't", 'dont', 'never'].includes(lower) ? 'negation' : 'none';

        const override = wordOverrides[key];
        const finalSvg = override?.hideSymbol
          ? null
          : override?.svgPath ?? autoMatch?.svgPath ?? null;
        const finalCaption = override?.caption ?? raw;
        const finalOverlay = override?.overlay ?? autoOverlay;

        return {
          key,
          raw,
          cleanWord,
          lower,
          isRedactedToken,
          isFiller,
          svgPath: finalSvg,
          symbolLabel: override?.label ?? autoMatch?.label ?? cleanWord,
          caption: finalCaption,
          overlay: finalOverlay,
          tone: classifySemanticTone(cleanWord),
          hasOverride: Boolean(override),
        };
      });

      const leadSymbol = tokens.find((t) => t.svgPath)?.svgPath || null;
      return { pIdx, line, tokens, leadSymbol };
    });
  }, [effectiveText, hideSmallWords, lookupIndex, wordOverrides]);

  const selectedToken = useMemo(() => {
    if (!selectedTokenKey) return null;
    for (const p of paragraphs) {
      const hit = p.tokens.find((t) => t.key === selectedTokenKey);
      if (hit) return hit;
    }
    return null;
  }, [paragraphs, selectedTokenKey]);

  const pickerResults = useMemo(() => {
    if (!selectedTokenKey) return [];
    const q = pickerQuery.trim() || selectedToken?.cleanWord || '';
    return searchRankedSymbols(symbols, q, 24);
  }, [symbols, pickerQuery, selectedTokenKey, selectedToken]);

  const activePaper = PAPER_TINTS.find((t) => t.id === paperTint) || PAPER_TINTS[0];

  const loadTemplate = (tpl: (typeof UK_CARE_TEMPLATES)[number]) => {
    setDocTitle(tpl.title);
    setDocSubtitle(tpl.subtitle);
    setRawInput(tpl.body);
    setWordOverrides({});
    setSelectedTokenKey(null);
  };

  const updateSelectedOverride = (patch: Partial<WordOverride>) => {
    if (!selectedTokenKey) return;
    setWordOverrides((prev) => ({
      ...prev,
      [selectedTokenKey]: {
        ...(prev[selectedTokenKey] || {}),
        ...patch,
      },
    }));
  };

  const resetSelectedOverride = () => {
    if (!selectedTokenKey) return;
    setWordOverrides((prev) => {
      const next = { ...prev };
      delete next[selectedTokenKey];
      return next;
    });
  };

  const speakDocument = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const text = effectiveText.replace(/\[[A-Z_]+\]/g, 'redacted detail').trim();
    if (!text) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(`${docTitle}. ${text}`);
    utter.lang = 'en-GB';
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  };

  const printA4Sheet = () => {
    const origin = window.location.origin;
    const absUrl = (src: string) => (src.startsWith('http') ? src : `${origin}${src}`);
    const todayStr = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const imgPx = symbolSize === 'lg' ? 68 : symbolSize === 'sm' ? 42 : 54;
    const fontPx = symbolSize === 'lg' ? 16 : symbolSize === 'sm' ? 12 : 14;
    const fontStack = openDyslexic
      ? '"OpenDyslexic", "Comic Sans MS", Arial, sans-serif'
      : 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    const bodyHtml =
      viewMode === 'easy-read-rows'
        ? paragraphs
            .map(
              (p) => `
            <div style="display:flex;align-items:center;gap:18px;border:1.5px solid #e2e8f0;border-radius:14px;padding:14px 16px;margin-bottom:14px;background:#ffffff;break-inside:avoid;">
              <div style="width:92px;height:92px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc;">
                ${p.leadSymbol ? `<img src="${absUrl(p.leadSymbol)}" alt="" style="width:74px;height:74px;object-fit:contain;" />` : '<span style="font-size:11px;color:#94a3b8;font-weight:700;">TEXT</span>'}
              </div>
              <p style="margin:0;font-size:18px;line-height:1.5;font-weight:600;color:#0f172a;">${escapeHtml(p.line)}</p>
            </div>`
            )
            .join('')
        : paragraphs
            .map(
              (p) => `
            <div style="display:flex;flex-wrap:wrap;align-items:flex-end;gap:10px 8px;margin-bottom:22px;padding-bottom:16px;border-bottom:1px dashed #e2e8f0;break-inside:avoid;">
              ${p.tokens
                .map((t) => {
                  const borderCol = !colourfulSemantics
                    ? '#cbd5e1'
                    : t.tone === 'who'
                      ? '#f59e0b'
                      : t.tone === 'doing'
                        ? '#10b981'
                        : t.tone === 'what'
                          ? '#f97316'
                          : t.tone === 'where'
                            ? '#0ea5e9'
                            : t.tone === 'describing'
                              ? '#a855f7'
                              : '#ec4899';
                  if (!t.svgPath) {
                    return `<span style="padding:4px 4px 6px;font-size:${fontPx}px;font-weight:600;color:#334155;">${escapeHtml(t.caption)}</span>`;
                  }
                  return `
                    <div style="display:inline-flex;flex-direction:column;align-items:center;justify-content:space-between;border:2px solid ${borderCol};border-radius:10px;padding:6px 8px;background:#ffffff;min-width:${imgPx + 18}px;">
                      <div style="position:relative;width:${imgPx}px;height:${imgPx}px;display:flex;align-items:center;justify-content:center;">
                        <img src="${absUrl(t.svgPath)}" alt="" style="width:100%;height:100%;object-fit:contain;" />
                        ${overlayPrintHtml(t.overlay)}
                      </div>
                      <span style="margin-top:4px;font-size:${fontPx}px;font-weight:700;color:#0f172a;text-align:center;">${escapeHtml(t.caption)}</span>
                    </div>`;
                })
                .join('')}
            </div>`
            )
            .join('');

    const html = `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(docTitle || 'Spark Symbol Document')}</title>
  <style>
    @page { size: A4 portrait; margin: 14mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { margin: 0; font-family: ${fontStack}; background: ${activePaper.hex}; color: #0f172a; }
    .sheet { padding: 8px; min-height: 262mm; display: flex; flex-direction: column; justify-content: space-between; }
    .hdr { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 22px; display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; }
    .ftr { border-top: 1px solid #cbd5e1; padding-top: 10px; margin-top: 24px; display: flex; justify-content: space-between; font-size: 11px; color: #475569; }
  </style>
</head>
<body>
  <div class="sheet">
    <div>
      <div class="hdr">
        <div>
          <div style="font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#d45a1a;">Spark Symbol Studio • Accessible Information</div>
          <h1 style="margin:4px 0 2px;font-size:24px;font-weight:900;color:#0f172a;">${escapeHtml(docTitle)}</h1>
          <div style="font-size:12px;font-weight:600;color:#475569;">${escapeHtml(docSubtitle)}</div>
        </div>
        <div style="text-align:right;font-size:11px;color:#475569;font-weight:700;">
          <div>NHS AIS • CQC Reg. 9</div>
          <div>${todayStr}</div>
        </div>
      </div>
      ${bodyHtml}
    </div>
    <div class="ftr">
      <span>Prepared by: <strong>${escapeHtml(careInitials || 'Care Team')}</strong> • ${escapeHtml(careReviewNote || 'Zero-PII Local Session')}</span>
      <span>Spark Symbol Studio • Offline-First UK Care AAC</span>
    </div>
  </div>
</body>
</html>`;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }
    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 1500);
    }, 350);
  };

  const tileImgClass =
    symbolSize === 'lg' ? 'h-16 w-16' : symbolSize === 'sm' ? 'h-10 w-10' : 'h-12 w-12';
  const tileTextClass =
    symbolSize === 'lg' ? 'text-sm' : symbolSize === 'sm' ? 'text-[11px]' : 'text-xs';

  return (
    <div className="space-y-4">
      {/* Top Studio Ribbon */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-[#D45A1A]">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-slate-900">
                  Live Auto-Symbolise A4 Editor
                </h1>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 uppercase">
                  Zero-PII Local
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Type plain English and watch symbols snap above every word live. Click any word on the A4 sheet to swap its picture or add grammar overlays.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode('a4-writer')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                  viewMode === 'a4-writer' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Symbolised A4</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('easy-read-rows')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                  viewMode === 'easy-read-rows' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Easy Read Rows</span>
              </button>
            </div>

            <button
              type="button"
              onClick={speakDocument}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              <Volume2 className="h-3.5 w-3.5 text-[#D45A1A]" />
              <span>Read Aloud (UK)</span>
            </button>

            <button
              type="button"
              onClick={printA4Sheet}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-slate-800 transition"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print A4 Sheet</span>
            </button>
          </div>
        </div>

        {/* Formatting Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Paper Tints */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500">Paper:</span>
              {PAPER_TINTS.map((tint) => (
                <button
                  key={tint.id}
                  type="button"
                  title={tint.name}
                  onClick={() => setPaperTint(tint.id)}
                  className={`h-6 w-6 rounded-full border-2 transition ${tint.swatchClass} ${
                    paperTint === tint.id ? 'ring-2 ring-slate-900 ring-offset-1 scale-105' : 'opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>

            {/* Symbol Size */}
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-bold">
              {(['sm', 'md', 'lg'] as SymbolSizeId[]).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSymbolSize(sz)}
                  className={`rounded-md px-2 py-0.5 uppercase transition ${
                    symbolSize === sz ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            {/* Quick Toggles */}
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100">
              <input
                type="checkbox"
                checked={hideSmallWords}
                onChange={(e) => setHideSmallWords(e.target.checked)}
                className="accent-slate-900"
              />
              <span>Hide small words</span>
            </label>

            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100">
              <input
                type="checkbox"
                checked={colourfulSemantics}
                onChange={(e) => setColourfulSemantics(e.target.checked)}
                className="accent-slate-900"
              />
              <span>Colourful Semantics</span>
            </label>

            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100">
              <input
                type="checkbox"
                checked={openDyslexic}
                onChange={(e) => setOpenDyslexic(e.target.checked)}
                className="accent-slate-900"
              />
              <span>OpenDyslexic</span>
            </label>

            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-900">
              <input
                type="checkbox"
                checked={autoScrubPii}
                onChange={(e) => setAutoScrubPii(e.target.checked)}
                className="accent-emerald-700"
              />
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Zero-PII Scrubber</span>
            </label>
          </div>

          {redactedMatches > 0 && autoScrubPii && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-[11px] font-extrabold text-emerald-900">
              <ShieldCheck className="h-3.5 w-3.5" />
              {redactedMatches} personal detail{redactedMatches === 1 ? '' : 's'} auto-redacted
            </span>
          )}
        </div>

        {/* Starter UK Care Document Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-400 mr-1">UK Care Starters:</span>
          {UK_CARE_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => loadTemplate(tpl)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:border-amber-400 hover:bg-amber-50 hover:text-slate-900 transition"
            >
              {tpl.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Workspace: Left Plain-English Input + Right Floating A4 Canvas */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
        {/* Left Column: Plain-English Writer & Word Inspector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Document Heading
              </label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="Document title..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-900 focus:border-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Subtitle / Clinical Purpose
              </label>
              <input
                type="text"
                value={docSubtitle}
                onChange={(e) => setDocSubtitle(e.target.value)}
                placeholder="e.g. Accessible Health Information • NHS AIS"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Write or Paste Plain English
                </label>
                <span className="text-[10px] font-bold text-slate-400">Live sync → A4</span>
              </div>
              <textarea
                rows={7}
                value={rawInput}
                onChange={(e) => {
                  setRawInput(e.target.value);
                  setSelectedTokenKey(null);
                }}
                placeholder="Type sentences here. Put each step or idea on a new line..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed text-slate-900 focus:border-[#D45A1A] focus:bg-white focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Tip: Start a new line for each visual step. Words like <strong>no</strong> or <strong>not</strong> automatically receive a red negation slash.
              </p>
            </div>
          </div>

          {/* Click-Any-Word Inspector */}
          {selectedToken ? (
            <div className="rounded-2xl border-2 border-slate-900 bg-white p-4 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#D45A1A]">
                    Word &amp; Grammar Inspector
                  </p>
                  <h3 className="text-sm font-black text-slate-900">
                    “{selectedToken.caption}”
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  {selectedToken.hasOverride && (
                    <button
                      type="button"
                      onClick={resetSelectedOverride}
                      title="Reset this word to default"
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedTokenKey(null)}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Custom Caption + Hide Symbol */}
              <div className="grid grid-cols-1 gap-2">
                <input
                  type="text"
                  value={selectedToken.caption}
                  onChange={(e) => updateSelectedOverride({ caption: e.target.value })}
                  placeholder="Edit word caption..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:border-slate-900 focus:bg-white focus:outline-none"
                />
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={!selectedToken.svgPath}
                    onChange={(e) => updateSelectedOverride({ hideSymbol: e.target.checked })}
                    className="accent-slate-900"
                  />
                  <span>Text only (hide picture for this word)</span>
                </label>
              </div>

              {/* Visual Grammar Overlays */}
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                  Visual Grammar Overlay
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {GRAMMAR_OVERLAY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateSelectedOverride({ overlay: opt.id })}
                      className={`rounded-lg border px-2 py-1.5 text-[11px] font-bold transition ${
                        selectedToken.overlay === opt.id
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="mr-1">{opt.badge}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Swap Symbol Search */}
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                  Swap Symbol ({symbols.length.toLocaleString('en-GB')} available)
                </p>
                <div className="relative mb-2">
                  <Search className="pointer-events-none absolute top-2 left-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={pickerQuery}
                    onChange={(e) => setPickerQuery(e.target.value)}
                    placeholder={`Search replacement for "${selectedToken.cleanWord}"...`}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs font-medium text-slate-900 focus:border-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="grid max-h-48 grid-cols-4 gap-1.5 overflow-y-auto pr-1">
                  {pickerResults.map((sym) => (
                    <button
                      key={sym.id}
                      type="button"
                      onClick={() =>
                        updateSelectedOverride({
                          svgPath: sym.svgPath,
                          label: sym.label,
                          hideSymbol: false,
                        })
                      }
                      className="flex flex-col items-center rounded-lg border border-slate-200 bg-white p-1.5 hover:border-[#D45A1A] hover:bg-amber-50/40 transition"
                    >
                      <img
                        src={sym.svgPath}
                        alt={sym.label}
                        className="h-9 w-9 object-contain"
                        loading="lazy"
                      />
                      <span className="mt-1 w-full truncate text-center text-[10px] font-bold text-slate-700">
                        {sym.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4 text-center">
              <p className="text-xs font-extrabold text-slate-700">
                Click any word on the A4 sheet →
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Swap its picture from 20,500+ symbols, edit its label, hide the image, or stamp a red negation slash / question / tense badge.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Floating A4 Studio Desk */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-200/60 p-4 sm:p-6">
            <article
              style={{
                backgroundColor: activePaper.hex,
                fontFamily: openDyslexic
                  ? '"OpenDyslexic", "Comic Sans MS", system-ui, sans-serif'
                  : undefined,
              }}
              className="mx-auto min-h-[760px] max-w-[794px] rounded-xl border border-slate-200 p-6 sm:p-10 shadow-[0_14px_40px_rgba(15,23,42,0.10)] flex flex-col justify-between transition-colors"
            >
              <div>
                {/* A4 Document Header */}
                <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-slate-900 pb-4 mb-6">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#D45A1A]">
                      Spark Symbol Studio • Accessible Information
                    </p>
                    <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                      {docTitle || 'Untitled Symbol Document'}
                    </h2>
                    {docSubtitle && (
                      <p className="mt-0.5 text-xs font-semibold text-slate-600">{docSubtitle}</p>
                    )}
                  </div>
                  <div className="text-right text-[11px] font-bold text-slate-500">
                    <div>NHS AIS • CQC Reg. 9</div>
                    <div>{new Date().toLocaleDateString('en-GB')}</div>
                  </div>
                </header>

                {/* A4 Content Body */}
                {paragraphs.length === 0 ? (
                  <div className="py-20 text-center text-sm font-semibold text-slate-400">
                    Start typing on the left to watch symbols appear live on your A4 page.
                  </div>
                ) : viewMode === 'easy-read-rows' ? (
                  <div className="space-y-4">
                    {paragraphs.map((p) => (
                      <div
                        key={p.pIdx}
                        className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white/90 p-4 shadow-2xs"
                      >
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2">
                          {p.leadSymbol ? (
                            <img
                              src={p.leadSymbol}
                              alt=""
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400">TEXT</span>
                          )}
                        </div>
                        <p className="text-base font-semibold leading-relaxed text-slate-900">
                          {p.line}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {paragraphs.map((p) => (
                      <div
                        key={p.pIdx}
                        className="flex flex-wrap items-end gap-x-2 gap-y-3 border-b border-dashed border-slate-200/90 pb-5 last:border-b-0"
                      >
                        {p.tokens.map((tok) => {
                          const isSelected = selectedTokenKey === tok.key;
                          if (!tok.svgPath) {
                            return (
                              <button
                                key={tok.key}
                                type="button"
                                onClick={() => {
                                  setSelectedTokenKey(tok.key);
                                  setPickerQuery(tok.cleanWord);
                                }}
                                className={`rounded-lg px-1.5 py-1 font-semibold transition ${tileTextClass} ${
                                  tok.isRedactedToken
                                    ? 'bg-emerald-100 text-emerald-900 font-extrabold'
                                    : isSelected
                                      ? 'bg-slate-900 text-white'
                                      : 'text-slate-700 hover:bg-slate-200/70'
                                }`}
                                title="Click to add or swap a symbol for this word"
                              >
                                {tok.caption}
                              </button>
                            );
                          }

                          return (
                            <button
                              key={tok.key}
                              type="button"
                              onClick={() => {
                                setSelectedTokenKey(tok.key);
                                setPickerQuery(tok.cleanWord);
                              }}
                              className={`group inline-flex flex-col items-center justify-between rounded-xl border-2 px-2 py-1.5 transition ${toneBorderClasses(
                                tok.tone,
                                colourfulSemantics
                              )} ${
                                isSelected
                                  ? 'ring-2 ring-slate-900 ring-offset-2 scale-[1.03] shadow-sm'
                                  : 'hover:shadow-sm hover:-translate-y-0.5'
                              }`}
                              title={`Click to swap symbol or add grammar overlay for "${tok.caption}"`}
                            >
                              <span className={`relative flex items-center justify-center ${tileImgClass}`}>
                                <img
                                  src={tok.svgPath}
                                  alt={tok.symbolLabel}
                                  className="h-full w-full object-contain"
                                />
                                {renderOverlayVisual(tok.overlay)}
                              </span>
                              <span
                                className={`mt-1 font-bold leading-tight text-slate-900 ${tileTextClass}`}
                              >
                                {tok.caption}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* A4 Governance Footer */}
              <footer className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-slate-300/80 pt-3 text-[11px] text-slate-500">
                <span>
                  Prepared by <strong className="text-slate-800">{careInitials || 'Care Team'}</strong> •{' '}
                  {careReviewNote || 'Zero-PII Local Session'}
                </span>
                <span className="font-semibold">Spark Symbol Studio • Offline UK Care AAC</span>
              </footer>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};
