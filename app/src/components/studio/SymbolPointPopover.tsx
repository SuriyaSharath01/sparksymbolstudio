import { useEffect, useRef, useState, type ReactNode } from 'react';
export interface PointPopoverSymbol {
  id: string;
  label: string;
  svgPath: string;
  tags?: string[];
}

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'of', 'to', 'in', 'on', 'at', 'by',
  'for', 'with', 'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been',
  'it', 'its', 'this', 'that', 'these', 'those', 'your', 'our', 'their',
  'can', 'will', 'has', 'have', 'had', 'do', 'does', 'did', 'not', 'into',
]);

interface SymbolIndex {
  exact: Map<string, PointPopoverSymbol[]>;
  secondary: Map<string, PointPopoverSymbol[]>;
}

const indexCache = new WeakMap<PointPopoverSymbol[], SymbolIndex>();

function normaliseWord(raw: string): string {
  return raw.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
}

function getStems(word: string): string[] {
  const stems = [word];
  if (word.length > 4 && word.endsWith('ies')) stems.push(word.slice(0, -3) + 'y');
  if (word.length > 4 && word.endsWith('es')) stems.push(word.slice(0, -2));
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) stems.push(word.slice(0, -1));
  if (word.length > 5 && word.endsWith('ing')) {
    stems.push(word.slice(0, -3));
    stems.push(word.slice(0, -3) + 'e');
  }
  if (word.length > 4 && word.endsWith('ed')) {
    stems.push(word.slice(0, -2));
    stems.push(word.slice(0, -1));
  }
  return [...new Set(stems)];
}

function pushMap(map: Map<string, PointPopoverSymbol[]>, key: string, sym: PointPopoverSymbol) {
  if (!key) return;
  const list = map.get(key);
  if (list) {
    if (!list.some((item) => item.id === sym.id)) list.push(sym);
  } else {
    map.set(key, [sym]);
  }
}

function getSymbolIndex(symbols: PointPopoverSymbol[]): SymbolIndex {
  const cached = indexCache.get(symbols);
  if (cached) return cached;

  const exact = new Map<string, PointPopoverSymbol[]>();
  const secondary = new Map<string, PointPopoverSymbol[]>();

  for (const sym of symbols) {
    const cleanLabel = normaliseWord(sym.label);
    if (cleanLabel) {
      pushMap(exact, cleanLabel, sym);
      for (const stem of getStems(cleanLabel)) {
        if (stem !== cleanLabel) pushMap(secondary, stem, sym);
      }
    }

    const labelWords = sym.label.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 2);
    for (const w of labelWords) {
      if (w !== cleanLabel) pushMap(secondary, w, sym);
    }

    for (const tag of sym.tags || []) {
      const cleanTag = normaliseWord(tag);
      if (cleanTag.length >= 2) pushMap(secondary, cleanTag, sym);
    }
  }

  const built = { exact, secondary };
  indexCache.set(symbols, built);
  return built;
}

export function findSymbolMatches(
  word: string,
  symbols: PointPopoverSymbol[],
  maxResults = 5
): PointPopoverSymbol[] {
  const clean = normaliseWord(word);
  if (!clean || clean.length < 2 || symbols.length === 0) return [];

  const { exact, secondary } = getSymbolIndex(symbols);
  const results: PointPopoverSymbol[] = [];
  const seen = new Set<string>();

  const addMatches = (list?: PointPopoverSymbol[]) => {
    if (!list) return;
    for (const sym of list) {
      if (seen.has(sym.svgPath)) continue;
      seen.add(sym.svgPath);
      results.push(sym);
      if (results.length >= maxResults) return;
    }
  };

  const stems = getStems(clean);
  for (const stem of stems) {
    addMatches(exact.get(stem));
    if (results.length >= maxResults) return results;
  }
  for (const stem of stems) {
    addMatches(secondary.get(stem));
    if (results.length >= maxResults) return results;
  }

  return results;
}

function formatPopoverLabel(raw: string): string {
  const trimmed = raw.trim();
  const commaMatch = trimmed.match(/^([^,]+),\s*(.+)$/);
  const reordered = commaMatch ? `${commaMatch[2].trim()} ${commaMatch[1].trim()}` : trimmed;
  return reordered.charAt(0).toUpperCase() + reordered.slice(1);
}

export interface SymbolPointPopoverProps {
  word: string;
  symbols: PointPopoverSymbol[];
  maxResults?: number;
  activeSvgPath?: string;
  onSelectSymbol?: (symbol: PointPopoverSymbol) => void;
  triggerMode?: 'hover' | 'click';
  className?: string;
  children?: ReactNode;
}

export function SymbolPointPopover({
  word,
  symbols,
  maxResults = 5,
  activeSvgPath,
  onSelectSymbol,
  triggerMode = 'hover',
  className = '',
  children,
}: SymbolPointPopoverProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const matches = open ? findSymbolMatches(word, symbols, maxResults) : [];

  const clearTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearTimer();
    closeTimerRef.current = window.setTimeout(() => setOpen(false), 160);
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => () => clearTimer(), []);

  const isHoverMode = triggerMode === 'hover';

  return (
    <span
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={isHoverMode ? () => { clearTimer(); setOpen(true); } : undefined}
      onMouseLeave={isHoverMode ? scheduleClose : undefined}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className={`inline cursor-pointer rounded px-0.5 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 ${
          open
            ? 'bg-[#FFE65C] text-slate-950 font-medium'
            : children
              ? ''
              : 'underline decoration-dotted decoration-slate-300 underline-offset-4 hover:bg-[#FFE65C]/80 hover:text-slate-950'
        }`}
        aria-expanded={open}
      >
        {children ?? word}
      </button>

      {open && matches.length > 0 && (
        <div
          role="dialog"
          aria-label={`Symbol options for ${word}`}
          onMouseEnter={isHoverMode ? clearTimer : undefined}
          onMouseLeave={isHoverMode ? scheduleClose : undefined}
          className="absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-[310px] -translate-x-1/2 rounded-xl border border-slate-300 bg-white p-1.5 shadow-xl"
        >
          <span
            aria-hidden="true"
            className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-slate-300 bg-white"
          />
          <div className="relative flex flex-row gap-1.5 overflow-x-auto">
            {matches.map((sym) => {
              const isSelected = Boolean(activeSvgPath && sym.svgPath === activeSvgPath);
              const content = (
                <>
                  <img
                    src={sym.svgPath}
                    alt={sym.label}
                    className="h-12 w-12 object-contain"
                    loading="lazy"
                  />
                  <span className="mt-1 line-clamp-2 text-center text-[11px] font-medium leading-tight text-slate-800">
                    {formatPopoverLabel(sym.label)}
                  </span>
                </>
              );

              if (onSelectSymbol) {
                return (
                  <button
                    key={sym.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSymbol(sym);
                      setOpen(false);
                    }}
                    className={`w-20 shrink-0 flex flex-col items-center rounded-lg border px-1.5 py-2 transition ${
                      isSelected
                        ? 'border-[#E36C2B] bg-amber-50 ring-1 ring-[#E36C2B]'
                        : 'border-transparent bg-white/80 hover:border-amber-400 hover:bg-amber-50/70'
                    }`}
                  >
                    {content}
                  </button>
                );
              }

              return (
                <div
                  key={sym.id}
                  className="w-20 shrink-0 flex flex-col items-center rounded-lg bg-slate-50 px-1.5 py-2"
                >
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </span>
  );
}

export interface SymbolizedTextProps {
  text: string;
  symbols: PointPopoverSymbol[];
  enabled?: boolean;
  className?: string;
}

export function SymbolizedText({
  text,
  symbols,
  enabled = true,
  className = '',
}: SymbolizedTextProps) {
  if (!enabled || symbols.length === 0) {
    return <span className={className}>{text}</span>;
  }

  const tokens = text.split(/([A-Za-z0-9'-]+)/);
  return (
    <span className={className}>
      {tokens.map((token, idx) => {
        const clean = normaliseWord(token);
        const canSymbolise =
          clean.length >= 3 &&
          !STOP_WORDS.has(clean) &&
          findSymbolMatches(clean, symbols, 1).length > 0;

        if (!canSymbolise) {
          return <span key={idx}>{token}</span>;
        }

        return (
          <SymbolPointPopover
            key={`${clean}-${idx}`}
            word={token}
            symbols={symbols}
            maxResults={4}
          />
        );
      })}
    </span>
  );
}
