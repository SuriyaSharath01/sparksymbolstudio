import React, { useEffect, useState } from 'react';
import { WidgitSentenceStrip, type StripSymbolItem } from '../WidgitSentenceStrip';
import { TemplateGrid, type TemplatePillAction } from '../TemplateGrid';
import { NonVerbalNowNext } from './NonVerbalNowNext';
import { persistRemoteSymbolOffline, searchSymbolsCommercialSafe } from '../../utils/remoteSymbolSearch';
import type { SymbolAsset } from '../../types/symbols';

export interface BoardTileItem<TCoreId extends string = string> {
  id: string;
  title: string;
  actionText?: string;
  keywords?: string[];
  imageSrc?: string;
  coreCardId?: TCoreId;
}

export interface SymbolCatalogItem {
  id: string;
  label: string;
  svgPath: string;
  category?: string;
}

export interface BoardTemplateInfo {
  id?: string;
  name?: string;
  slots: { slotLabel?: string }[];
}

export interface CustomBoardWorkspaceProps<
  TCoreId extends string = string,
  TTemplateId extends string = string,
> {
  customBoard: BoardTileItem<TCoreId>[];
  boardTitle: string;
  setBoardTitle: React.Dispatch<React.SetStateAction<string>>;
  removeBoardTile: (id: string) => void;
  addTileToBoard: (card: {
    id: string;
    title: string;
    actionText: string;
    keywords: string[];
    imageSrc: string;
  }) => void;
  symbolSearch: string;
  setSymbolSearch: React.Dispatch<React.SetStateAction<string>>;
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  symbolError: string;
  loadingSymbols: boolean;
  symbols: SymbolCatalogItem[];
  filteredSymbols: SymbolCatalogItem[];
  setTopSearch?: React.Dispatch<React.SetStateAction<string>>;
  renderSearchIcon?: () => React.ReactNode;
  categories?: string[];
  selectedTemplateId: TTemplateId;
  activeTemplate: BoardTemplateInfo;
  getSlotBadgeLabel: (
    index: number,
    total: number,
    templateId: TTemplateId,
    slotLabel?: string
  ) => string;
  renderTileVisual: (params: {
    src?: string;
    alt: string;
    label: string;
    coreCardId?: TCoreId;
    sizeClass?: string;
  }) => React.ReactNode;
  renderCloseIcon?: () => React.ReactNode;
  renderHeaderIcon?: () => React.ReactNode;
  handleTemplatePillAction: (action: TemplatePillAction) => void;
  setActiveTab: (tab: 'focus') => void;
  setCustomBoard: (tiles: never[]) => void;
  sentenceStripItems: StripSymbolItem[];
  setSentenceStripItems: React.Dispatch<React.SetStateAction<StripSymbolItem[]>>;
  sequenceMode: 'full' | 'now_next' | 'now_next_then';
  setSequenceMode: React.Dispatch<React.SetStateAction<'full' | 'now_next' | 'now_next_then'>>;
}

export function CustomBoardWorkspace<
  TCoreId extends string = string,
  TTemplateId extends string = string,
>(props: CustomBoardWorkspaceProps<TCoreId, TTemplateId>) {
  const {
    customBoard,
    boardTitle,
    setBoardTitle,
    removeBoardTile,
    addTileToBoard,
    symbolSearch,
    setSymbolSearch,
    selectedCategory,
    setSelectedCategory,
    symbolError,
    loadingSymbols,
    symbols,
    filteredSymbols,
    setTopSearch,
    renderSearchIcon,
    categories = [],
    selectedTemplateId,
    activeTemplate,
    getSlotBadgeLabel,
    renderTileVisual,
    renderCloseIcon,
    renderHeaderIcon,
    handleTemplatePillAction,
    setActiveTab,
    setCustomBoard,
    sentenceStripItems,
    setSentenceStripItems,
  } = props;

  const [isSymbolDrawerOpen, setIsSymbolDrawerOpen] = useState(false);
  const [extendedSymbols, setExtendedSymbols] = useState<(SymbolCatalogItem & { asset?: SymbolAsset })[]>([]);
  const [searchingExtended, setSearchingExtended] = useState(false);
  const { sequenceMode } = props;
  const [viewMode, setViewMode] = useState<'two_card' | 'grid'>('two_card');

  useEffect(() => {
    if (!isSymbolDrawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSymbolDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSymbolDrawerOpen]);

  useEffect(() => {
    const q = symbolSearch.trim();
    if (!isSymbolDrawerOpen || selectedCategory !== 'All' || q.length < 2) {
      setExtendedSymbols([]);
      setSearchingExtended(false);
      return;
    }
    let cancelled = false;
    setSearchingExtended(true);
    const timer = window.setTimeout(async () => {
      try {
        const hits = await searchSymbolsCommercialSafe(q, { includeRemote: true, timeoutMs: 4000 });
        if (cancelled) return;
        const localPaths = new Set(filteredSymbols.map((s) => s.svgPath));
        const mapped: (SymbolCatalogItem & { asset?: SymbolAsset })[] = [];
        for (const hit of hits) {
          if (localPaths.has(hit.imagePath)) continue;
          localPaths.add(hit.imagePath);
          mapped.push({
            id: hit.id,
            label: hit.label,
            svgPath: hit.imagePath,
            category: hit.source === 'openmoji' ? 'OpenMoji' : 'OpenSymbols',
            asset: hit,
          });
          if (mapped.length >= 60) break;
        }
        setExtendedSymbols(mapped);
      } finally {
        if (!cancelled) setSearchingExtended(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isSymbolDrawerOpen, selectedCategory, symbolSearch, filteredSymbols]);

  const combinedDrawerSymbols: (SymbolCatalogItem & { asset?: SymbolAsset })[] = [
    ...filteredSymbols,
    ...extendedSymbols,
  ];

  const handleAdvanceNow = () => {
    if (customBoard.length === 0) return;
    const remaining = customBoard.slice(1) as never[];
    setCustomBoard(remaining);
    setSentenceStripItems((prev) => prev.slice(1));
  };

  const handleSetSlotTile = (slotIndex: 0 | 1, sym: SymbolCatalogItem) => {
    const newItem = {
      id: `${sym.id}_slot_${slotIndex}_${Date.now()}`,
      title: sym.label,
      actionText: sym.label,
      keywords: [sym.label],
      imageSrc: sym.svgPath,
    };
    const existing = [...customBoard];
    existing[slotIndex] = newItem as any;
    setCustomBoard(existing.filter(Boolean) as never[]);
    appendOrSyncSlotToStrip(slotIndex, sym);
  };

  const appendOrSyncSlotToStrip = (slotIndex: 0 | 1, sym: SymbolCatalogItem) => {
    setSentenceStripItems((prev) => {
      const next = [...prev];
      next[slotIndex] = {
        id: `${sym.id}_strip_${slotIndex}_${Date.now()}`,
        label: sym.label,
        imageSrc: sym.svgPath,
      };
      return next;
    });
  };

  const handleSearchChange = (value: string) => {
    setSymbolSearch(value);
    if (setTopSearch) {
      setTopSearch(value);
    }
  };

  return (
    <section className="space-y-5">
      <WidgitSentenceStrip
        items={sentenceStripItems}
        onRemoveLast={() => setSentenceStripItems((prev) => prev.slice(0, -1))}
        onRemoveAt={(idx) =>
          setSentenceStripItems((prev) => prev.filter((_, i) => i !== idx))
        }
        onClearAll={() => setSentenceStripItems([])}
        onAddSymbol={(sym) =>
          setSentenceStripItems((prev) => [
            ...prev,
            { id: sym.id, label: sym.label, imageSrc: sym.svgPath, imageAlt: sym.label },
          ])
        }
        symbols={symbols}
        onSwapSymbol={(idx, sym) =>
          setSentenceStripItems((prev) =>
            prev.map((tile, i) =>
              i === idx ? { ...tile, imageSrc: sym.svgPath, imageAlt: sym.label } : tile
            )
          )
        }
      />

      <TemplateGrid onSelectAction={handleTemplatePillAction} />

      <div className="rounded-xl border-2 border-slate-900 bg-white p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex flex-1 items-center gap-2.5">
            {renderHeaderIcon ? renderHeaderIcon() : <span aria-hidden="true">📋</span>}
            <input
              type="text"
              value={boardTitle}
              onChange={(e) => setBoardTitle(e.target.value)}
              aria-label="Resource title"
              className="w-full max-w-sm rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-base font-extrabold text-slate-900 focus:border-[#E36C2B] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-slate-300 bg-slate-100 p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode('two_card')}
                className={`rounded-md px-2.5 py-1 transition ${
                  viewMode === 'two_card'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2-Card Now / Next
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`rounded-md px-2.5 py-1 transition ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Full Grid
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsSymbolDrawerOpen(true)}
              className="rounded-lg bg-[#E36C2B] px-3.5 py-1.5 text-xs font-extrabold text-white shadow-xs transition hover:bg-[#cf5e20]"
            >
              + Add Symbol ({symbols.length})
            </button>

            {customBoard.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('focus')}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Run Focus Mode
                </button>
                <button
                  type="button"
                  onClick={() => setCustomBoard([])}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Clear Grid
                </button>
              </>
            )}
          </div>
        </div>

        {viewMode === 'two_card' ? (
          <NonVerbalNowNext
            tiles={customBoard}
            onAdvanceNow={handleAdvanceNow}
            onResetBoard={() => setCustomBoard([])}
            onOpenSymbolPicker={() => setIsSymbolDrawerOpen(true)}
            symbols={symbols}
            onSetSlotTile={handleSetSlotTile}
            renderTileVisual={renderTileVisual}
          />
        ) : customBoard.length === 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {['NOW', 'NEXT', 'THEN'].map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setIsSymbolDrawerOpen(true)}
                className="flex min-h-[124px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-3 text-center transition hover:border-[#E36C2B] hover:bg-orange-50/30"
              >
                <span className="rounded bg-slate-200 px-2 py-0.5 text-[11px] font-black tracking-wider text-slate-700">
                  {slot}
                </span>
                <p className="mt-1.5 text-xs font-medium text-slate-600">
                  Pick a template above or click to open Symbol Library
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div>
            

          <div
            className={
              sequenceMode === 'now_next'
                ? 'grid grid-cols-1 gap-4 sm:grid-cols-2'
                : sequenceMode === 'now_next_then'
                  ? 'grid grid-cols-1 gap-4 sm:grid-cols-3'
                  : 'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6'
            }
          >
            {(sequenceMode === 'now_next'
              ? customBoard.slice(0, 2)
              : sequenceMode === 'now_next_then'
                ? customBoard.slice(0, 3)
                : customBoard
            ).map((tile, idx) => {
              const seqBadge =
                sequenceMode === 'now_next'
                  ? idx === 0
                    ? 'NOW'
                    : 'NEXT'
                  : sequenceMode === 'now_next_then'
                    ? idx === 0
                      ? 'NOW'
                      : idx === 1
                        ? 'NEXT'
                        : 'THEN'
                    : getSlotBadgeLabel(
                        idx,
                        customBoard.length,
                        selectedTemplateId,
                        activeTemplate.slots[idx]?.slotLabel
                      );
              const slotTag = seqBadge;
              return (
                <div
                  key={tile.id}
                  className="relative flex flex-col items-center justify-between rounded-lg border-2 border-slate-900 bg-white p-3 text-center"
                >
                  <button
                    type="button"
                    onClick={() => removeBoardTile(tile.id)}
                    aria-label={`Remove ${tile.title}`}
                    className="absolute top-1.5 right-1.5 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    {renderCloseIcon ? renderCloseIcon() : <span>×</span>}
                  </button>
                  <span className="mb-1.5 rounded bg-orange-100 px-2 py-0.5 text-[10px] font-black tracking-wider text-orange-900">
                    {slotTag}
                  </span>
                  {renderTileVisual({
                    src: tile.imageSrc,
                    alt: tile.title,
                    label: tile.title,
                    coreCardId: tile.coreCardId as TCoreId,
                    sizeClass: 'h-16 w-16',
                  })}
                  <span className="mt-2 line-clamp-2 text-sm font-extrabold text-slate-950">
                    {tile.title}
                  </span>
                </div>
              );
            })}
          </div>
          </div>
        )}
      </div>

      {isSymbolDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-950/45 backdrop-blur-[1px]"
          onClick={() => setIsSymbolDrawerOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Symbol Library Drawer"
        >
          <div
            className="flex h-full w-full max-w-3xl flex-col overflow-hidden bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Symbol Library ({symbols.length} Local + 60,000+ Open-Licensed)
                </h2>
                <p className="text-xs text-slate-500">
                  Click any symbol tile to add it to your active resource grid.
                </p>
                {symbolError && (
                  <p className="mt-1.5 inline-block rounded bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                    {symbolError}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsSymbolDrawerOpen(false)}
                aria-label="Close Symbol Library"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                {renderCloseIcon ? renderCloseIcon() : <span>× Done</span>}
              </button>
            </div>

            <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="relative sm:col-span-2">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
                    {renderSearchIcon ? renderSearchIcon() : <span aria-hidden="true">🔍</span>}
                  </span>
                  <input
                    type="text"
                    autoFocus
                    value={symbolSearch}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search symbols (tea, walk, shop, quiet, bus, music, toilet)..."
                    className="min-h-[40px] w-full rounded-lg border border-slate-300 bg-white py-1.5 pr-16 pl-10 text-sm focus:border-[#E36C2B] focus:outline-none"
                  />
                  {symbolSearch && (
                    <button
                      type="button"
                      onClick={() => handleSearchChange('')}
                      className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded px-1.5 py-0.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label="Filter symbols by category"
                  className="min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {loadingSymbols ? (
                <p className="py-12 text-center text-sm font-semibold text-slate-500">
                  Loading symbol library...
                </p>
              ) : combinedDrawerSymbols.length === 0 && !searchingExtended ? (
                <p className="py-12 text-center text-sm font-semibold text-slate-500">
                  No matching symbols found. Try another keyword or category.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5">
                  {combinedDrawerSymbols.map((sym) => (
                    <button
                      key={sym.id}
                      type="button"
                      onClick={() => {
                        if (sym.asset) {
                          void persistRemoteSymbolOffline(sym.asset);
                        }
                        addTileToBoard({
                          id: sym.id,
                          title: sym.label,
                          actionText: sym.label,
                          keywords: [sym.label],
                          imageSrc: sym.svgPath,
                        });
                      }}
                      className="flex flex-col items-center justify-between rounded-lg border border-slate-300 bg-white p-2.5 text-center transition hover:border-[#E36C2B] hover:bg-orange-50/30"
                    >
                      {renderTileVisual({
                        src: sym.svgPath,
                        alt: sym.label,
                        label: sym.label,
                        sizeClass: 'h-14 w-14',
                      })}
                      <span className="mt-2 line-clamp-2 text-xs font-extrabold text-slate-900">
                        {sym.label}
                      </span>
                      {sym.asset && (
                        <span className="mt-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                          {sym.asset.source === 'openmoji' ? 'OpenMoji' : 'OpenSymbols'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
