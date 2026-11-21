import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Printer, Search, Sparkles } from 'lucide-react';
import { searchMulberrySymbols, type MulberrySymbol } from '../../data/symbols';
import type { CommunicationPassport } from '../../types/passport';
import type { StudioCell, StudioPage } from '../../types/studio';
import { StudioCellCard } from './StudioCellCard';
import { CellInspector } from './CellInspector';

interface Props {
  symbols: MulberrySymbol[];
  activePassport: CommunicationPassport | null;
  careInitials: string;
  careReviewNote: string;
}

const PAGE_TINTS = [
  { label: 'Crisp White', value: '#FFFFFF' },
  { label: 'Warm Cream (Visual Stress)', value: '#FAFAF5' },
  { label: 'Soft Buff (Low-Arousal)', value: '#F5F0E6' },
];

export const StudioCanvasWorkspace: React.FC<Props> = ({
  symbols,
  activePassport,
  careInitials,
  careReviewNote,
}) => {
  const initialCells: StudioCell[] = useMemo(() => {
    const starterWords = ['I want', 'tea', 'toilet', 'break', 'happy', 'help'];
    return starterWords.map((word, idx) => {
      const hit = searchMulberrySymbols(symbols, word, 'All', 1)[0];
      return {
        id: `cell-init-${idx}`,
        symbolId: hit?.id || `custom-${idx}`,
        symbolSrc: hit?.svgPath || '',
        caption: hit?.label || word,
        displayMode: 'symbol-text-below',
        style: {
          borderColor: idx === 0 ? '#D97706' : idx === 1 || idx === 2 ? '#E36C2B' : '#0284C7',
          borderWidth: 2,
          borderStyle: 'solid',
          borderRadius: 14,
          backgroundColor: '#FFFFFF',
        },
      };
    });
  }, [symbols]);

  const [page, setPage] = useState<StudioPage>(() => ({
    id: 'studio-page-1',
    title: 'Personalised Visual Communication Grid',
    orientation: 'landscape',
    background: activePassport?.profile.requiresLowArousal ? '#FAFAF5' : '#FFFFFF',
    columns: 3,
    gapPx: 16,
    cells: initialCells,
  }));

  const [selectedCellId, setSelectedCellId] = useState<string | null>(
    initialCells[0]?.id || null
  );
  const [dyslexicFont, setDyslexicFont] = useState<boolean>(false);
  const [symbolQuery, setSymbolQuery] = useState<string>('');

  useEffect(() => {
    document.body.classList.toggle('font-dyslexic', dyslexicFont);
    return () => {
      document.body.classList.remove('font-dyslexic');
    };
  }, [dyslexicFont]);

  useEffect(() => {
    if (!activePassport) return;
    setPage((prev) => ({
      ...prev,
      background: activePassport.profile.requiresLowArousal ? '#FAFAF5' : prev.background,
    }));
  }, [activePassport]);

  const selectedCell = useMemo(
    () => page.cells.find((c) => c.id === selectedCellId) || null,
    [page.cells, selectedCellId]
  );

  const quickSymbolHits = useMemo(() => {
    const q = symbolQuery.trim();
    if (!q) return symbols.slice(0, 12);
    return searchMulberrySymbols(symbols, q, 'All', 12);
  }, [symbols, symbolQuery]);

  const updateCell = (id: string, patch: Partial<StudioCell>) => {
    setPage((prev) => ({
      ...prev,
      cells: prev.cells.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  };

  const addSymbolCell = (sym: MulberrySymbol) => {
    const newCell: StudioCell = {
      id: `cell-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      symbolId: sym.id,
      symbolSrc: sym.svgPath,
      caption: sym.label,
      displayMode: 'symbol-text-below',
      style: {
        borderColor: '#334155',
        borderWidth: 2,
        borderStyle: 'solid',
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
      },
    };
    setPage((prev) => ({ ...prev, cells: [...prev.cells, newCell] }));
    setSelectedCellId(newCell.id);
  };

  const duplicateCell = (id: string) => {
    const target = page.cells.find((c) => c.id === id);
    if (!target) return;
    const copy: StudioCell = {
      ...target,
      id: `cell-${Date.now()}`,
      style: { ...target.style },
    };
    setPage((prev) => ({ ...prev, cells: [...prev.cells, copy] }));
    setSelectedCellId(copy.id);
  };

  const deleteCell = (id: string) => {
    setPage((prev) => ({
      ...prev,
      cells: prev.cells.filter((c) => c.id !== id),
    }));
    if (selectedCellId === id) {
      setSelectedCellId(null);
    }
  };

  return (
    <section className="space-y-4">
      {/* Studio Document Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs print:hidden">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-extrabold text-[#E36C2B]">
            <Sparkles className="h-3.5 w-3.5" />
            Studio Canvas
          </span>

          <input
            type="text"
            value={page.title}
            onChange={(e) => setPage((p) => ({ ...p, title: e.target.value }))}
            aria-label="Document title"
            className="w-64 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-extrabold text-slate-900 focus:border-slate-600 focus:outline-none"
          />

          <select
            value={page.columns}
            onChange={(e) =>
              setPage((p) => ({ ...p, columns: Number(e.target.value) as 2 | 3 | 4 }))
            }
            aria-label="Grid columns"
            className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-800"
          >
            <option value={2}>2 Columns</option>
            <option value={3}>3 Columns</option>
            <option value={4}>4 Columns</option>
          </select>

          <select
            value={page.background}
            onChange={(e) => setPage((p) => ({ ...p, background: e.target.value }))}
            aria-label="Page background tint"
            className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-800"
          >
            {PAGE_TINTS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-800 hover:bg-slate-100">
            <input
              type="checkbox"
              checked={dyslexicFont}
              onChange={(e) => setDyslexicFont(e.target.checked)}
              className="accent-[#E36C2B]"
            />
            OpenDyslexic (Offline)
          </label>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-slate-800"
        >
          <Printer className="h-3.5 w-3.5" />
          Print Studio Sheet
        </button>
      </div>

      {/* Main 3-Column Studio Workspace: Symbol Tray | Live Sheet Canvas | Cell Inspector */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left: Quick Symbol Adder */}
        <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs lg:col-span-3 print:hidden">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            Add Symbols to Grid
          </h3>
          <div className="relative">
            <Search className="pointer-events-none absolute top-2 left-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={symbolQuery}
              onChange={(e) => setSymbolQuery(e.target.value)}
              placeholder="Search 4,865+ symbols..."
              className="w-full rounded-lg border border-slate-300 py-1.5 pr-2.5 pl-8 text-xs font-semibold text-slate-800 focus:border-slate-600 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {quickSymbolHits.map((sym) => (
              <button
                key={sym.id}
                type="button"
                onClick={() => addSymbolCell(sym)}
                className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2 text-center transition hover:border-[#E36C2B] hover:bg-orange-50"
              >
                <img
                  src={sym.svgPath}
                  alt={sym.label}
                  className="h-10 w-10 object-contain"
                />
                <span className="mt-1 line-clamp-1 text-[10px] font-bold text-slate-800">
                  {sym.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Live Document Sheet */}
        <div className="lg:col-span-6 print:col-span-12">
          <div
            style={{ backgroundColor: page.background }}
            className="rounded-2xl border border-slate-300 p-6 shadow-sm print:border-0 print:p-2 print:shadow-none"
          >
            <div className="mb-4 flex items-baseline justify-between border-b border-slate-200 pb-2">
              <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                {page.title}
              </h2>
              {(careInitials || careReviewNote) && (
                <span className="text-[11px] font-semibold text-slate-500">
                  {careInitials ? `${careInitials} • ` : ''}
                  {careReviewNote}
                </span>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${page.columns}, minmax(0, 1fr))`,
                gap: `${page.gapPx}px`,
              }}
            >
              {page.cells.map((cell) => (
                <StudioCellCard
                  key={cell.id}
                  cell={cell}
                  isSelected={selectedCellId === cell.id}
                  onSelect={setSelectedCellId}
                  onCaptionChange={(id, caption) => updateCell(id, { caption })}
                />
              ))}
            </div>

            {page.cells.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 py-12 text-center">
                <Plus className="h-6 w-6 text-slate-400" />
                <p className="mt-1 text-xs font-bold text-slate-600">
                  Click any symbol on the left to start building your sheet
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Cell Inspector */}
        <div className="lg:col-span-3 print:hidden">
          <CellInspector
            cell={selectedCell}
            onUpdate={(patch) => {
              if (selectedCell) updateCell(selectedCell.id, patch);
            }}
            onDuplicate={duplicateCell}
            onDelete={deleteCell}
          />
        </div>
      </div>
    </section>
  );
};
