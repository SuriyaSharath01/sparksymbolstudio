import React, { useEffect, useMemo, useState } from 'react';
import { Copy, FilePlus2, LayoutGrid, Plus, Printer, Search, Sparkles, Trash2 } from 'lucide-react';
import { searchMulberrySymbols, type MulberrySymbol } from '../../data/symbols';
import {
  STUDIO_CLINICAL_TEMPLATES,
  instantiateStudioTemplate,
  type StudioTemplateSpec,
} from '../../data/studioTemplates';
import type { CommunicationPassport } from '../../types/passport';
import type { StudioCell, StudioPage } from '../../types/studio';
import { StudioCellCard } from './StudioCellCard';
import { CellInspector } from './CellInspector';
import { LiveTalkerOverlay } from './LiveTalkerOverlay';
import { getAllWordMappings, saveWordMapping, type CustomWordMapping } from '../../utils/wordListDb';

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

  const [pages, setPages] = useState<StudioPage[]>(() => [
    {
      id: 'studio-page-1',
      title: 'Personalised Visual Communication Grid',
      orientation: 'landscape',
      background: activePassport?.profile.requiresLowArousal ? '#FAFAF5' : '#FFFFFF',
      columns: 3,
      gapPx: 16,
      cells: initialCells,
    },
  ]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  const page = pages[activePageIndex] || pages[0];

  const updateActivePage = (updater: (prev: StudioPage) => StudioPage) => {
    setPages((prevPages) =>
      prevPages.map((p, idx) => (idx === activePageIndex ? updater(p) : p))
    );
  };

  const [selectedCellId, setSelectedCellId] = useState<string | null>(
    initialCells[0]?.id || null
  );
  const [dyslexicFont, setDyslexicFont] = useState<boolean>(false);
  const [symbolQuery, setSymbolQuery] = useState<string>('');
  const [showBulkPaste, setShowBulkPaste] = useState<boolean>(false);
  const [showTemplatesDrawer, setShowTemplatesDrawer] = useState<boolean>(false);
  const [liveTalkerActive, setLiveTalkerActive] = useState<boolean>(false);
  const [bulkText, setBulkText] = useState<string>('');
  const [wordMappings, setWordMappings] = useState<Record<string, CustomWordMapping>>({});
  const [savedBindingNotice, setSavedBindingNotice] = useState<boolean>(false);

  useEffect(() => {
    const loadMappings = () => {
      void getAllWordMappings().then(setWordMappings).catch(() => {});
    };
    loadMappings();
    window.addEventListener('spark:bundle-imported', loadMappings);
    return () => window.removeEventListener('spark:bundle-imported', loadMappings);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('font-dyslexic', dyslexicFont);
    return () => {
      document.body.classList.remove('font-dyslexic');
    };
  }, [dyslexicFont]);

  useEffect(() => {
    if (!activePassport) return;
    updateActivePage((prev) => ({
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
    updateActivePage((prev) => ({
      ...prev,
      cells: prev.cells.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  };

  const addSymbolCell = (sym: MulberrySymbol) => {
    const saved = wordMappings[sym.label.trim().toLowerCase()];
    const newCell: StudioCell = {
      id: `cell-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      symbolId: saved?.symbolId || sym.id,
      symbolSrc: saved?.symbolSrc || sym.svgPath,
      caption: saved?.caption || sym.label,
      symbolTintColor: saved?.tintColor,
      displayMode: 'symbol-text-below',
      style: {
        borderColor: '#334155',
        borderWidth: 2,
        borderStyle: 'solid',
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
      },
    };
    updateActivePage((prev) => ({ ...prev, cells: [...prev.cells, newCell] }));
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
    updateActivePage((prev) => ({ ...prev, cells: [...prev.cells, copy] }));
    setSelectedCellId(copy.id);
  };

  const handleBulkPasteGenerate = () => {
    const lines = bulkText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;
    const generated: StudioCell[] = lines.map((line, i) => {
      const saved = wordMappings[line.toLowerCase()];
      const hit = saved ? undefined : searchMulberrySymbols(symbols, line, 'All', 1)[0];
      return {
        id: `bulk-${Date.now()}-${i}`,
        symbolId: saved?.symbolId || hit?.id || `bulk-sym-${i}`,
        symbolSrc: saved?.symbolSrc || hit?.svgPath || '',
        caption: line,
        symbolTintColor: saved?.tintColor,
        displayMode: 'symbol-text-below',
        style: {
          borderColor: '#334155',
          borderWidth: 2,
          borderStyle: 'solid',
          borderRadius: 14,
          backgroundColor: '#FFFFFF',
        },
      };
    });
    updateActivePage((prev) => ({ ...prev, cells: [...prev.cells, ...generated] }));
    setBulkText('');
    setShowBulkPaste(false);
    if (generated[0]) setSelectedCellId(generated[0].id);
  };

  const handleSaveWordBinding = async (target: StudioCell) => {
    const key = target.caption.trim().toLowerCase();
    if (!key) return;
    const entry: CustomWordMapping = {
      word: key,
      symbolId: target.symbolId,
      symbolSrc: target.symbolSrc,
      caption: target.caption.trim(),
      tintColor: target.symbolTintColor,
      updatedAt: new Date().toISOString(),
    };
    await saveWordMapping(entry);
    setWordMappings((prev) => ({ ...prev, [key]: entry }));
    setSavedBindingNotice(true);
    window.setTimeout(() => setSavedBindingNotice(false), 2200);
  };

  const deleteCell = (id: string) => {
    updateActivePage((prev) => ({
      ...prev,
      cells: prev.cells.filter((c) => c.id !== id),
    }));
    if (selectedCellId === id) {
      setSelectedCellId(null);
    }
  };

  const handleAddBlankPage = () => {
    const newPage: StudioPage = {
      id: `studio-page-${Date.now()}`,
      title: `Page ${pages.length + 1} · Visual Support Sheet`,
      orientation: 'landscape',
      background: activePassport?.profile.requiresLowArousal ? '#FAFAF5' : '#FFFFFF',
      columns: 3,
      gapPx: 16,
      cells: [],
    };
    setPages((prev) => [...prev, newPage]);
    setActivePageIndex(pages.length);
    setSelectedCellId(null);
  };

  const handleDuplicatePage = () => {
    const cloned: StudioPage = {
      ...page,
      id: `studio-page-${Date.now()}`,
      title: `${page.title} (Copy)`,
      cells: page.cells.map((c, idx) => ({
        ...c,
        id: `cell-copy-${Date.now()}-${idx}`,
        style: { ...c.style },
      })),
    };
    setPages((prev) => [...prev, cloned]);
    setActivePageIndex(pages.length);
  };

  const handleDeletePage = (idx: number) => {
    if (pages.length <= 1) return;
    setPages((prev) => prev.filter((_, i) => i !== idx));
    setActivePageIndex((prevIdx) => Math.max(0, prevIdx >= idx ? prevIdx - 1 : prevIdx));
  };

  const handleApplyClinicalTemplate = (spec: StudioTemplateSpec) => {
    const built = instantiateStudioTemplate(
      spec,
      symbols,
      activePassport?.profile.requiresLowArousal ? '#FAFAF5' : undefined
    );
    updateActivePage(() => built);
    setSelectedCellId(built.cells[0]?.id || null);
    setShowTemplatesDrawer(false);
  };

  return (
    <section className="space-y-4">
      {/* Multi-Page Document Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-2xs print:hidden">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            Pages ({pages.length}):
          </span>
          {pages.map((p, idx) => (
            <div key={p.id} className="inline-flex items-center">
              <button
                type="button"
                onClick={() => {
                  setActivePageIndex(idx);
                  setSelectedCellId(p.cells[0]?.id || null);
                }}
                className={`rounded-lg border px-2.5 py-1 text-xs font-extrabold transition ${
                  idx === activePageIndex
                    ? 'border-[#E36C2B] bg-orange-50 text-slate-900'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {idx + 1}. {p.title.slice(0, 22)}
                {p.title.length > 22 ? '…' : ''}
              </button>
              {pages.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeletePage(idx)}
                  title="Remove page"
                  className="ml-0.5 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleAddBlankPage}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-800 hover:bg-slate-100"
          >
            <FilePlus2 className="h-3.5 w-3.5" />
            Add Page
          </button>
          <button
            type="button"
            onClick={handleDuplicatePage}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-800 hover:bg-slate-100"
          >
            <Copy className="h-3.5 w-3.5" />
            Duplicate Page
          </button>
        </div>
      </div>

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
            onChange={(e) => updateActivePage((p) => ({ ...p, title: e.target.value }))}
            aria-label="Document title"
            className="w-60 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-extrabold text-slate-900 focus:border-slate-600 focus:outline-none"
          />

          <select
            value={page.columns}
            onChange={(e) =>
              updateActivePage((p) => ({
                ...p,
                columns: Number(e.target.value) as 2 | 3 | 4 | 5,
              }))
            }
            aria-label="Grid columns"
            className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-800"
          >
            <option value={2}>2 Columns</option>
            <option value={3}>3 Columns</option>
            <option value={4}>4 Columns</option>
            <option value={5}>5 Columns (Weekly)</option>
          </select>

          <select
            value={page.background}
            onChange={(e) =>
              updateActivePage((p) => ({ ...p, background: e.target.value }))
            }
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

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setShowTemplatesDrawer((v) => !v);
              setShowBulkPaste(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E36C2B] bg-orange-50 px-3 py-1.5 text-xs font-extrabold text-[#C85A1E] hover:bg-orange-100"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Clinical Layouts
          </button>
          <button
            type="button"
            onClick={() => {
              setShowBulkPaste((v) => !v);
              setShowTemplatesDrawer(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-extrabold text-slate-800 hover:bg-slate-100"
          >
            <Plus className="h-3.5 w-3.5" />
            Bulk Paste
          </button>
          <button
            type="button"
            onClick={() => setLiveTalkerActive(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-emerald-800"
          >
            Live Talker (PIN)
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-slate-800"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Studio Sheet
          </button>
        </div>
      </div>

      {/* Purpose-Built Clinical Templates Drawer */}
      {showTemplatesDrawer && (
        <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-2xs print:hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <span className="text-xs font-extrabold text-slate-900">
                Purpose-Built Clinical &amp; InPrint Layouts
              </span>
              <span className="ml-2 text-[11px] font-medium text-slate-500">
                Loads pre-calibrated grids into the active page
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowTemplatesDrawer(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Close
            </button>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STUDIO_CLINICAL_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleApplyClinicalTemplate(tpl)}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-[#E36C2B] hover:bg-orange-50/40"
              >
                <div>
                  <span className="inline-block rounded bg-white px-2 py-0.5 text-[10px] font-extrabold text-[#D45A1A] ring-1 ring-slate-200">
                    {tpl.badge}
                  </span>
                  <p className="mt-2 text-xs font-extrabold text-slate-900">{tpl.name}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                    {tpl.description}
                  </p>
                </div>
                <span className="mt-3 text-[11px] font-extrabold text-[#E36C2B]">
                  Load Layout →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {showBulkPaste && (
        <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-2xs print:hidden">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-extrabold text-slate-900">
              Bulk Paste-to-Grid (One item per line)
            </span>
            <button
              type="button"
              onClick={() => setShowBulkPaste(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Close
            </button>
          </div>
          <textarea
            rows={4}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={'Wash hands\nChoose breakfast\nTake medication\nMorning walk'}
            className="mt-2 w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold text-slate-800 focus:border-slate-600 focus:outline-none"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={handleBulkPasteGenerate}
              className="rounded-lg bg-[#E36C2B] px-3.5 py-1.5 text-xs font-extrabold text-white hover:bg-[#c85a1e]"
            >
              Add Lines to Grid
            </button>
          </div>
        </div>
      )}

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
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                  {page.title}
                </h2>
                {page.templateBadge && (
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 print:hidden">
                    {page.templateBadge}
                  </span>
                )}
              </div>
              {(careInitials || careReviewNote) && (
                <span className="text-[11px] font-semibold text-slate-500">
                  {careInitials ? `${careInitials} · ` : ''}
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
                  Click any symbol on the left or choose a Clinical Layout above
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
            onSaveWordBinding={(c) => void handleSaveWordBinding(c)}
            savedBindingNotice={savedBindingNotice}
          />
        </div>
      </div>
      {liveTalkerActive && (
        <LiveTalkerOverlay
          page={page}
          onExit={() => setLiveTalkerActive(false)}
        />
      )}
    </section>
  );
};
