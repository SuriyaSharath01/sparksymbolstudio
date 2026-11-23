import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  ExternalLink,
  FileText,
  Printer,
  QrCode,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import type { MulberrySymbol } from '../../data/symbols';
import { scrubClinicalText } from '../../utils/piiScrubber';
import { AUDIENCE_LENSES, useAudienceLens, type AudienceLens } from '../../context/AudienceLensContext';
import {
  buildSymbolLookupIndex,
  classifySemanticTone,
  resolveTokenSymbol,
  searchRankedSymbols,
  SMALL_FILLER_WORDS,
  tokeniseLineWithPhrases,
  toneBorderClasses,
  toneUnderlineClasses,
  type GrammarOverlay,
} from '../../utils/autoSymbolise';
import { getCachedSparkSvg, SparkSymbol, type SymbolTheme } from '../common/SparkSymbol';
import { buildKioskQrUrl, generateQrDataUrl } from '../../utils/qrBridge';

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

const SYMBOL_THEMES: { id: SymbolTheme; label: string }[] = [
  { id: 'color', label: 'Calm Colour' },
  { id: 'high-contrast', label: 'High-Contrast' },
  { id: 'mono', label: 'Crisp Mono' },
];

const STARTER_TEMPLATES: {
  id: string;
  lens: AudienceLens;
  badge: string;
  title: string;
  subtitle: string;
  body: string;
}[] = [
  {
    id: 'kids_school',
    lens: 'kids',
    badge: 'Kids & Schools',
    title: 'My Morning School Routine',
    subtitle: 'Visual Timetable • Home & Primary Classroom',
    body: `First eat breakfast and brush your teeth.
Next get your school bag and packed lunch.
Then we walk to school and see our teacher.`,
  },
  {
    id: 'teens_adhd',
    lens: 'teens',
    badge: 'Teens & ADHD',
    title: 'Focus Plan & Sensory Exit Pass',
    subtitle: 'ADHD Step-by-Step Checklist • College & Home',
    body: `First focus on one small task at a time.
If it feels too loud, put on ear defenders or headphones.
You can ask for a quiet break and take a deep breath.`,
  },
  {
    id: 'adults_community',
    lens: 'adults',
    badge: 'Adults & Community',
    title: 'Bus Trip & Going to the Café',
    subtitle: 'Independent Community Outing Guide',
    body: `First we take the bus into town.
Next we go to the cafe and choose a cup of tea or lunch.
Then we pay with money and walk home together.`,
  },
  {
    id: 'clinical_gp',
    lens: 'clinical',
    badge: 'Health & Care',
    title: 'My GP & Clinic Appointment',
    subtitle: 'Accessible Health Information • NHS AIS',
    body: `First we will have a cup of tea at home.
Then we are going to see the doctor at the clinic.
You can bring your hospital passport and ask for a quiet break at any time.`,
  },
  {
    id: 'clinical_epilepsy',
    lens: 'clinical',
    badge: 'Epilepsy Safety',
    title: 'Epilepsy & Safe Recovery Plan',
    subtitle: 'Clear Calm Action Steps • All Ages',
    body: `Stay calm and check the clock if a seizure starts.
Help me into the recovery position and give rescue medication if needed.
Let me rest in a quiet space when I feel tired.`,
  },
  {
    id: 'clinical_consent',
    lens: 'clinical',
    badge: 'Choice & Consent',
    title: 'My Choice & Supported Decision',
    subtitle: 'Dignity, Autonomy & Plain English',
    body: `This is my choice. Please listen before I decide.
I can say yes, no, or wait for more time.
You can help me feel calm and safe.`,
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
      className={`pointer-events-none absolute top-0 right-0 rounded px-1 text-[10px] font-black leading-tight shadow-xs ${cfg.cls}`}
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
  return `<span style="position:absolute;top:0;right:0;background:${s.bg};color:#fff;font-size:10px;font-weight:800;border-radius:4px;padding:1px 4px;line-height:1.1;">${s.text}</span>`;
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
  const { lens, setLens } = useAudienceLens();

  const [docTitle, setDocTitle] = useState<string>(STARTER_TEMPLATES[3].title);
  const [docSubtitle, setDocSubtitle] = useState<string>(STARTER_TEMPLATES[3].subtitle);
  const [rawInput, setRawInput] = useState<string>(STARTER_TEMPLATES[3].body);

  const [viewMode, setViewMode] = useState<DocumentViewMode>('a4-writer');
  const [paperTint, setPaperTint] = useState<PaperTintId>('white');
  const [symbolTheme, setSymbolTheme] = useState<SymbolTheme>('color');
  const [symbolSize, setSymbolSize] = useState<SymbolSizeId>('md');
  const [hideSmallWords, setHideSmallWords] = useState<boolean>(true);
  const [colourfulSemantics, setColourfulSemantics] = useState<boolean>(true);
  const [boxedCards, setBoxedCards] = useState<boolean>(false);
  const [openDyslexic, setOpenDyslexic] = useState<boolean>(false);
  const [autoScrubPii, setAutoScrubPii] = useState<boolean>(true);
  const [showQrBridge, setShowQrBridge] = useState<boolean>(true);

  const [wordOverrides, setWordOverrides] = useState<Record<string, WordOverride>>({});
  const [selectedTokenKey, setSelectedTokenKey] = useState<string | null>(null);
  const [pickerQuery, setPickerQuery] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const lookupIndex = useMemo(() => buildSymbolLookupIndex(symbols), [symbols]);

  const scrubResult = useMemo(() => scrubClinicalText(rawInput), [rawInput]);
  const redactedMatches = useMemo(() => {
    const found = scrubResult.scrubbedText.match(/\[[A-Z_]+\]/g);
    return found ? found.length : 0;
  }, [scrubResult.scrubbedText]);

  const effectiveText = autoScrubPii ? scrubResult.scrubbedText : rawInput;

  const paragraphs = useMemo(() => {
    const lines = effectiveText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    return lines.map((line, pIdx) => {
      const segments = tokeniseLineWithPhrases(line);
      const tokens = segments.map((seg, wIdx) => {
        const key = `${pIdx}-${wIdx}`;
        const isFiller = !seg.isPhrase && SMALL_FILLER_WORDS.has(seg.lower);
        const autoMatch =
          seg.isRedactedToken || (hideSmallWords && isFiller)
            ? null
            : resolveTokenSymbol(seg.clean, lookupIndex, lens);

        const autoOverlay: GrammarOverlay =
          !seg.isPhrase && ['not', "don't", 'dont', 'never'].includes(seg.lower)
            ? 'negation'
            : 'none';

        const override = wordOverrides[key];
        const finalSvg = override?.hideSymbol
          ? null
          : override?.svgPath ?? autoMatch?.svgPath ?? null;
        const finalCaption = override?.caption ?? seg.raw;
        const finalOverlay = override?.overlay ?? autoOverlay;

        return {
          key,
          raw: seg.raw,
          cleanWord: seg.clean,
          lower: seg.lower,
          isPhrase: seg.isPhrase,
          isRedactedToken: seg.isRedactedToken,
          svgPath: finalSvg,
          symbolLabel: override?.label ?? autoMatch?.label ?? seg.clean,
          caption: finalCaption,
          overlay: finalOverlay,
          tone: classifySemanticTone(seg.clean),
          hasOverride: Boolean(override),
        };
      });

      const leadSymbol = tokens.find((t) => t.svgPath)?.svgPath || null;
      return { pIdx, line, tokens, leadSymbol };
    });
  }, [effectiveText, hideSmallWords, lookupIndex, lens, wordOverrides]);

  // Build Zero-PII QR-Bridge payload & offline QR DataURL
  const qrBridgeUrl = useMemo(() => {
    const seen = new Set<string>();
    const keyCards: { w: string; s?: string }[] = [];
    for (const p of paragraphs) {
      for (const tok of p.tokens) {
        if (!tok.svgPath || tok.isRedactedToken) continue;
        const label = tok.caption.replace(/[.,!?;:]+$/, '').trim();
        const dedupeKey = label.toLowerCase();
        if (!label || seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);
        keyCards.push({ w: label, s: tok.svgPath });
      }
    }

    return buildKioskQrUrl({
      t: docTitle || 'Spark Communication Sheet',
      sub: docSubtitle || undefined,
      th: symbolTheme,
      l: paragraphs.map((p) => p.line),
      c: keyCards,
    });
  }, [paragraphs, docTitle, docSubtitle, symbolTheme]);

  useEffect(() => {
    if (!showQrBridge) {
      setQrDataUrl('');
      return;
    }
    let active = true;
    generateQrDataUrl(qrBridgeUrl)
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl('');
      });
    return () => {
      active = false;
    };
  }, [qrBridgeUrl, showQrBridge]);

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
    return searchRankedSymbols(symbols, q, lens, 28);
  }, [symbols, pickerQuery, selectedTokenKey, selectedToken, lens]);

  const activePaper = PAPER_TINTS.find((t) => t.id === paperTint) || PAPER_TINTS[0];
  const activeLensMeta = AUDIENCE_LENSES.find((l) => l.id === lens) || AUDIENCE_LENSES[2];
  const isHighContrast = symbolTheme === 'high-contrast';

  const loadTemplate = (tpl: (typeof STARTER_TEMPLATES)[number]) => {
    setLens(tpl.lens);
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

    const imgPx = symbolSize === 'lg' ? 68 : symbolSize === 'sm' ? 44 : 56;
    const fontPx = symbolSize === 'lg' ? 16 : symbolSize === 'sm' ? 12 : 14;
    const fontStack = openDyslexic
      ? '"OpenDyslexic", "Comic Sans MS", Arial, sans-serif'
      : 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    const renderPrintSymbol = (svgPath: string) => {
      const cached = getCachedSparkSvg(svgPath);
      if (cached) {
        return `<span class="spark-theme-${symbolTheme}" style="display:flex;width:100%;height:100%;align-items:center;justify-content:center;">${cached}</span>`;
      }
      const legacyFilter =
        symbolTheme === 'high-contrast'
          ? 'filter:grayscale(100%) contrast(1.85);'
          : symbolTheme === 'mono'
            ? 'filter:grayscale(100%) contrast(1.2);'
            : '';
      return `<img src="${absUrl(svgPath)}" alt="" style="width:100%;height:100%;object-fit:contain;${legacyFilter}" />`;
    };

    const toneHex = (tone: string) =>
      tone === 'who'
        ? '#f59e0b'
        : tone === 'doing'
          ? '#10b981'
          : tone === 'what'
            ? '#f97316'
            : tone === 'where'
              ? '#0ea5e9'
              : tone === 'describing'
                ? '#a855f7'
                : '#ec4899';

    const bodyHtml =
      viewMode === 'easy-read-rows'
        ? paragraphs
            .map(
              (p) => `
            <div style="display:flex;align-items:center;gap:18px;border:${isHighContrast ? '2px solid #000' : '1px solid #e2e8f0'};border-radius:12px;padding:14px 16px;margin-bottom:14px;background:${isHighContrast ? '#FFF04B' : '#ffffff'};break-inside:avoid;">
              <div style="width:84px;height:84px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
                ${p.leadSymbol ? renderPrintSymbol(p.leadSymbol) : '<span style="font-size:11px;color:#94a3b8;font-weight:700;">TEXT</span>'}
              </div>
              <p style="margin:0;font-size:18px;line-height:1.5;font-weight:700;color:#000000;">${escapeHtml(p.line)}</p>
            </div>`
            )
            .join('')
        : paragraphs
            .map(
              (p) => `
            <div style="display:flex;flex-wrap:wrap;align-items:flex-end;gap:14px 12px;margin-bottom:26px;padding-bottom:18px;border-bottom:1px solid ${isHighContrast ? '#000' : '#e2e8f0'};break-inside:avoid;">
              ${p.tokens
                .map((t) => {
                  const col = toneHex(t.tone);
                  if (!t.svgPath) {
                    return `<span style="padding:0 2px 5px;font-size:${fontPx}px;font-weight:700;color:${isHighContrast ? '#000' : '#334155'};">${escapeHtml(t.caption)}</span>`;
                  }
                  const wrapperStyle = isHighContrast
                    ? 'border:2px solid #000000;border-radius:10px;padding:6px 8px;background:#FFF04B;'
                    : boxedCards
                      ? `border:2px solid ${colourfulSemantics ? col : '#cbd5e1'};border-radius:10px;padding:6px 8px;background:#ffffff;`
                      : 'padding:2px 4px;background:transparent;';
                  const barHtml =
                    !boxedCards && !isHighContrast && colourfulSemantics
                      ? `<span style="display:block;width:28px;height:3px;border-radius:99px;background:${symbolTheme === 'mono' ? '#334155' : col};margin-top:3px;"></span>`
                      : '';
                  return `
                    <div style="display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-end;min-width:${imgPx + 12}px;${wrapperStyle}">
                      <div style="position:relative;width:${imgPx}px;height:${imgPx}px;display:flex;align-items:center;justify-content:center;">
                        ${renderPrintSymbol(t.svgPath)}
                        ${overlayPrintHtml(t.overlay)}
                      </div>
                      <span style="margin-top:5px;font-size:${fontPx}px;font-weight:800;color:#000000;text-align:center;line-height:1.2;">${escapeHtml(t.caption)}</span>
                      ${barHtml}
                    </div>`;
                })
                .join('')}
            </div>`
            )
            .join('');

    const qrPrintHtml =
      showQrBridge && qrDataUrl
        ? `<div style="display:flex;align-items:center;gap:10px;border:1.5px solid #0f172a;border-radius:10px;padding:6px 10px;background:#ffffff;">
             <img src="${qrDataUrl}" alt="Scan for Mobile Live Talker" style="width:86px;height:86px;display:block;image-rendering:pixelated;" />
             <div style="font-size:10px;line-height:1.35;color:#0f172a;">
               <div style="font-weight:900;text-transform:uppercase;letter-spacing:0.04em;">Scan to Speak</div>
               <div style="color:#475569;font-weight:600;">Opens pocket Live Talker<br/>Zero-PII • Works offline</div>
             </div>
           </div>`
        : '';

    const html = `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(docTitle || 'Spark Symbol Document')}</title>
  <style>
    @page { size: A4 portrait; margin: 14mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { margin: 0; font-family: ${fontStack}; background: ${isHighContrast ? '#FFFFFF' : activePaper.hex}; color: #0f172a; }
    .spark-inline-svg { width: 100%; height: 100%; display: block; }
    .spark-theme-color { --spark-stroke:#0F172A; --spark-accent:#D45A1A; --spark-success:#15803D; --spark-danger:#DC2626; --spark-surface:#FFFFFF; --spark-tint:#FEF3C7; }
    .spark-theme-mono { --spark-stroke:#0F172A; --spark-accent:#334155; --spark-success:#0F172A; --spark-danger:#0F172A; --spark-surface:#FFFFFF; --spark-tint:#F1F5F9; }
    .spark-theme-high-contrast { --spark-stroke:#000000; --spark-accent:#000000; --spark-success:#000000; --spark-danger:#B91C1C; --spark-surface:#FFF04B; --spark-tint:#FFF04B; }
    .sheet { padding: 8px; min-height: 262mm; display: flex; flex-direction: column; justify-content: space-between; }
    .hdr { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; }
    .ftr { border-top: 1px solid #cbd5e1; padding-top: 12px; margin-top: 24px; display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; font-size: 11px; color: #475569; }
  </style>
</head>
<body>
  <div class="sheet">
    <div>
      <div class="hdr">
        <div>
          <div style="font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${isHighContrast ? '#000' : '#d45a1a'};">Spark Symbol Studio • ${escapeHtml(activeLensMeta.shortLabel)}</div>
          <h1 style="margin:4px 0 2px;font-size:24px;font-weight:900;color:#000000;">${escapeHtml(docTitle)}</h1>
          <div style="font-size:12px;font-weight:600;color:#475569;">${escapeHtml(docSubtitle)}</div>
        </div>
        <div style="text-align:right;font-size:11px;color:#475569;font-weight:700;">
          <div>Accessible Information</div>
          <div>${todayStr}</div>
        </div>
      </div>
      ${bodyHtml}
    </div>
    <div class="ftr">
      <div>
        <div>Prepared by: <strong>${escapeHtml(careInitials || 'Spark Studio')}</strong> • ${escapeHtml(careReviewNote || 'Zero-PII Local Session')}</div>
        <div style="margin-top:3px;font-weight:700;color:#0f172a;">Spark Symbol Studio • 360° Accessible Communication</div>
      </div>
      ${qrPrintHtml}
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
    symbolSize === 'lg' ? 'h-16 w-16' : symbolSize === 'sm' ? 'h-11 w-11' : 'h-14 w-14';
  const tileTextClass =
    symbolSize === 'lg' ? 'text-sm' : symbolSize === 'sm' ? 'text-xs' : 'text-[13px]';

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
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-slate-900">
                  Spark Symbol Writer (A4)
                </h1>
                <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-extrabold text-slate-700 uppercase">
                  Living SVG + QR-Bridge
                </span>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 uppercase">
                  Zero-PII Local
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Built for kids, teens, adults, schools &amp; care. Switch visual styles live and scan the A4 QR code to open a pocket talker.
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
              <span>Read Aloud</span>
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

        {/* 360° Audience Lens + Living SVG Style Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/90 p-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Lens:
            </span>
            {AUDIENCE_LENSES.map((item) => {
              const active = lens === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLens(item.id)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                    active
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
                  }`}
                >
                  {item.shortLabel}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Style:
            </span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-bold">
              {SYMBOL_THEMES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSymbolTheme(st.id)}
                  className={`rounded-md px-2.5 py-1 transition ${
                    symbolTheme === st.id
                      ? st.id === 'high-contrast'
                        ? 'bg-black text-[#FFF04B] font-black'
                        : 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Formatting Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
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
                checked={boxedCards}
                onChange={(e) => setBoxedCards(e.target.checked)}
                className="accent-slate-900"
              />
              <span>Boxed Cards</span>
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

            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-950">
              <input
                type="checkbox"
                checked={showQrBridge}
                onChange={(e) => setShowQrBridge(e.target.checked)}
                className="accent-[#D45A1A]"
              />
              <QrCode className="h-3.5 w-3.5 text-[#D45A1A]" />
              <span>QR-Bridge</span>
            </label>

            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-900">
              <input
                type="checkbox"
                checked={autoScrubPii}
                onChange={(e) => setAutoScrubPii(e.target.checked)}
                className="accent-emerald-700"
              />
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Zero-PII</span>
            </label>
          </div>

          {redactedMatches > 0 && autoScrubPii && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-[11px] font-extrabold text-emerald-900">
              <ShieldCheck className="h-3.5 w-3.5" />
              {redactedMatches} personal detail{redactedMatches === 1 ? '' : 's'} redacted
            </span>
          )}
        </div>

        {/* 360° Starter Document Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 mr-1">360° Starters:</span>
          {STARTER_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => loadTemplate(tpl)}
              className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition ${
                tpl.lens === lens
                  ? 'border-amber-300 bg-amber-50 text-slate-900 hover:bg-amber-100'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <span className="text-[10px] text-slate-400 mr-1">{tpl.badge} ·</span>
              {tpl.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
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
                Subtitle / Context
              </label>
              <input
                type="text"
                value={docSubtitle}
                onChange={(e) => setDocSubtitle(e.target.value)}
                placeholder="e.g. Visual Timetable, ADHD Plan, or NHS AIS..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Write or Paste Plain English
                </label>
                <span className="text-[10px] font-bold text-slate-400">Live sync → A4 + QR</span>
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
            </div>
          </div>

          {selectedToken ? (
            <div className="rounded-2xl border-2 border-slate-900 bg-white p-4 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#D45A1A]">
                    Word &amp; Grammar Inspector
                  </p>
                  <h3 className="text-sm font-black text-slate-900">“{selectedToken.caption}”</h3>
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
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4 text-center space-y-1.5">
              <p className="text-xs font-extrabold text-slate-700">
                Click any word or phrase on the A4 sheet →
              </p>
              <p className="text-[11px] text-slate-500">
                Try flipping <strong>Style</strong> above to <strong>High-Contrast</strong> or <strong>Crisp Mono</strong>, or scan the QR code at the bottom of the A4 page with your phone.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Clean Floating A4 Sheet */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-200/60 p-4 sm:p-6">
            <article
              style={{
                backgroundColor: isHighContrast ? '#FFFFFF' : activePaper.hex,
                fontFamily: openDyslexic
                  ? '"OpenDyslexic", "Comic Sans MS", system-ui, sans-serif'
                  : undefined,
              }}
              className="mx-auto min-h-[760px] max-w-[794px] rounded-xl border border-slate-200 p-6 sm:p-10 shadow-[0_14px_40px_rgba(15,23,42,0.10)] flex flex-col justify-between transition-colors"
            >
              <div>
                <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-slate-900 pb-4 mb-7">
                  <div>
                    <p
                      className={`text-[10px] font-extrabold uppercase tracking-widest ${
                        isHighContrast ? 'text-black' : 'text-[#D45A1A]'
                      }`}
                    >
                      Spark Symbol Studio • {activeLensMeta.shortLabel}
                    </p>
                    <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                      {docTitle || 'Untitled Symbol Document'}
                    </h2>
                    {docSubtitle && (
                      <p className="mt-0.5 text-xs font-semibold text-slate-600">{docSubtitle}</p>
                    )}
                  </div>
                  <div className="text-right text-[11px] font-bold text-slate-500">
                    <div>Accessible Information</div>
                    <div>{new Date().toLocaleDateString('en-GB')}</div>
                  </div>
                </header>

                {paragraphs.length === 0 ? (
                  <div className="py-20 text-center text-sm font-semibold text-slate-400">
                    Start typing on the left to watch symbols appear live on your A4 page.
                  </div>
                ) : viewMode === 'easy-read-rows' ? (
                  <div className="space-y-4">
                    {paragraphs.map((p) => (
                      <div
                        key={p.pIdx}
                        className={`flex items-center gap-5 rounded-xl p-4 ${
                          isHighContrast
                            ? 'border-2 border-black bg-[#FFF04B] text-black'
                            : 'border border-slate-200/90 bg-white/90 text-slate-900'
                        }`}
                      >
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center p-1">
                          {p.leadSymbol ? (
                            <SparkSymbol
                              src={p.leadSymbol}
                              alt=""
                              theme={symbolTheme}
                              className="h-full w-full"
                            />
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400">TEXT</span>
                          )}
                        </div>
                        <p className="text-base font-bold leading-relaxed">{p.line}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-7">
                    {paragraphs.map((p) => (
                      <div
                        key={p.pIdx}
                        className={`flex flex-wrap items-end gap-x-3 gap-y-4 border-b pb-6 last:border-b-0 ${
                          isHighContrast ? 'border-black/40' : 'border-slate-200/80'
                        }`}
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
                                className={`rounded-md px-1 pb-1.5 font-semibold transition ${tileTextClass} ${
                                  tok.isRedactedToken
                                    ? 'bg-emerald-100 text-emerald-900 font-extrabold'
                                    : isSelected
                                      ? 'bg-slate-900 text-white'
                                      : isHighContrast
                                        ? 'text-black font-bold hover:bg-yellow-200'
                                        : 'text-slate-600 hover:bg-slate-200/70'
                                }`}
                                title="Click to add a symbol for this word"
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
                              className={`group inline-flex flex-col items-center justify-end transition ${
                                isHighContrast
                                  ? 'rounded-xl border-2 border-black bg-[#FFF04B] px-2.5 py-2'
                                  : boxedCards
                                    ? `rounded-xl border-2 px-2.5 py-2 ${toneBorderClasses(tok.tone, colourfulSemantics)}`
                                    : 'rounded-lg px-1.5 py-1 bg-transparent hover:bg-slate-100/80'
                              } ${isSelected ? 'ring-2 ring-slate-900 ring-offset-2' : ''}`}
                              title={`Click to swap symbol or add grammar overlay for "${tok.caption}"`}
                            >
                              <span className={`relative flex items-center justify-center ${tileImgClass}`}>
                                <SparkSymbol
                                  src={tok.svgPath}
                                  alt={tok.symbolLabel}
                                  theme={symbolTheme}
                                  className="h-full w-full"
                                />
                                {renderOverlayVisual(tok.overlay)}
                              </span>
                              <span
                                className={`mt-1.5 font-bold leading-tight text-center ${
                                  isHighContrast ? 'text-black font-extrabold' : 'text-slate-900'
                                } ${tileTextClass}`}
                              >
                                {tok.caption}
                              </span>
                              {!boxedCards && !isHighContrast && colourfulSemantics && (
                                <span
                                  aria-hidden="true"
                                  className={`mt-1 h-[3px] w-7 rounded-full ${
                                    symbolTheme === 'mono'
                                      ? 'bg-slate-600'
                                      : toneUnderlineClasses(tok.tone, true)
                                  }`}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* A4 Governance Footer + Live Zero-PII QR-Bridge */}
              <footer className="mt-10 flex flex-wrap items-end justify-between gap-4 border-t border-slate-300/80 pt-4 text-[11px] text-slate-500">
                <div className="space-y-1">
                  <div>
                    Prepared by <strong className="text-slate-800">{careInitials || 'Spark Studio'}</strong> •{' '}
                    {careReviewNote || 'Zero-PII Local Session'}
                  </div>
                  <div className="font-semibold text-slate-700">
                    Spark Symbol Studio • 360° Accessible Communication
                  </div>
                </div>

                {showQrBridge && qrDataUrl && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-slate-900/20 bg-white px-2.5 py-2 shadow-2xs">
                    <img
                      src={qrDataUrl}
                      alt="Scan for Mobile Live Talker"
                      className="h-24 w-24 shrink-0 rounded-md [image-rendering:pixelated]"
                    />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-900">
                        Scan to Speak
                      </p>
                      <p className="text-[10px] leading-snug text-slate-500">
                        Pocket Live Talker
                        <br />
                        Zero-PII • Offline
                      </p>
                      <a
                        href={qrBridgeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#D45A1A] hover:underline"
                      >
                        <span>Open Talker</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  </div>
                )}
              </footer>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};
