import { useMemo, useState, type ReactNode } from 'react';
import { ArrowRight, ChevronRight, Eye, FileDown, FileText, Search, Sparkles } from 'lucide-react';
import type { CoreCardId } from '../../data/core-cards';
import type { SupportPackItem } from '../../data/studio-presets';
import type { MulberrySymbol } from '../../data/symbols';
import { SymbolizedText } from './SymbolPointPopover';

export interface SupportPacksPanelProps {
  packs: SupportPackItem[];
  symbols: MulberrySymbol[];
  onLoadSupportPack: (pack: SupportPackItem) => void;
  renderTileVisual: (params: {
    src?: string;
    alt: string;
    label: string;
    coreCardId?: CoreCardId;
    sizeClass?: string;
  }) => ReactNode;
}

export function SupportPacksPanel({ packs, symbols, onLoadSupportPack, renderTileVisual }: SupportPacksPanelProps) {
  const [selectedArea, setSelectedArea] = useState<'all' | SupportPackItem['area']>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [symbolSupportOn, setSymbolSupportOn] = useState(true);

  const areas = useMemo(() => [...new Set(packs.map((p) => p.area))], [packs]);
  const areaCounts = useMemo(() => {
    const map = new Map<SupportPackItem['area'], number>();
    packs.forEach((p) => map.set(p.area, (map.get(p.area) ?? 0) + 1));
    return map;
  }, [packs]);
  const featuredIds = useMemo(() => new Set(packs.slice(0, 3).map((p) => p.id)), [packs]);

  const filteredPacks = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return packs.filter((p) => {
      if (selectedArea !== 'all' && p.area !== selectedArea) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.area.toLowerCase().includes(q) ||
        p.cards.some((c) => c.label.toLowerCase().includes(q))
      );
    });
  }, [packs, selectedArea, searchTerm]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="space-y-4 lg:border-r lg:border-slate-200 lg:pr-5">
          <nav aria-label="Resource pack categories" className="space-y-1">
            <button
              type="button"
              onClick={() => setSelectedArea('all')}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${
                selectedArea === 'all' ? 'bg-slate-200/80 font-semibold text-[#184E77]' : 'font-medium text-[#184E77] hover:bg-slate-100'
              }`}
            >
              <span>Resources home</span>
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs text-slate-600">{packs.length}</span>
            </button>
            <div className="pt-1">
              {areas.map((area) => {
                const active = selectedArea === area;
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setSelectedArea(area)}
                    className={`flex w-full items-start justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm transition ${
                      active ? 'bg-[#FFF3EC] font-semibold text-[#C85A1E]' : 'text-[#184E77] hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-start gap-1.5 leading-snug">
                      <ChevronRight className={`mt-0.5 h-4 w-4 shrink-0 transition-transform ${active ? 'rotate-90 text-[#E36C2B]' : 'text-slate-400'}`} />
                      <span>{area}</span>
                    </span>
                    <span className="shrink-0 text-xs text-slate-500">{areaCounts.get(area) ?? 0}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Point-to-Symbol Reading</p>
            <p className="mt-1 leading-relaxed">Hover or tap dotted words in summaries to preview matching Mulberry symbols.</p>
            <button
              type="button"
              onClick={() => setSymbolSupportOn((v) => !v)}
              className={`mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-md border px-2.5 py-1.5 font-medium transition ${
                symbolSupportOn ? 'border-amber-300 bg-[#FFE65C]/60 text-slate-900' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {symbolSupportOn ? 'Symbol Popover: On' : 'Symbol Popover: Off'}
            </button>
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          <div className="space-y-2 border-b border-slate-200 pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#184E77]">Symbol Resource Packs</h2>
                <p className="mt-1 text-sm text-slate-600">
                  <SymbolizedText text="Ready-made communication boards, calm routines, and daily support packs built with Mulberry symbols." symbols={symbols} enabled={symbolSupportOn} />
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter packs or symbols..."
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#E36C2B] focus:outline-none focus:ring-2 focus:ring-[#E36C2B]/20"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Available formats:</span>
              <span className="inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-rose-600" />Print PDF</span>
              <span className="inline-flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-sky-600" />Focus Mode</span>
              <span className="inline-flex items-center gap-1.5"><FileDown className="h-3.5 w-3.5 text-emerald-600" />Portable Board (.obf)</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#184E77]">
              {selectedArea === 'all' ? 'Popular and latest resources' : selectedArea}
            </h3>
            <span className="text-xs font-medium text-slate-500">Showing {filteredPacks.length} of {packs.length} packs</span>
          </div>

          {filteredPacks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
              No resource packs matched &ldquo;{searchTerm}&rdquo;.{' '}
              <button type="button" onClick={() => { setSelectedArea('all'); setSearchTerm(''); }} className="font-semibold text-[#E36C2B] underline">
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {filteredPacks.map((pack) => (
                <article key={pack.id} className="relative flex flex-col gap-4 rounded-xl border-2 border-[#D98245]/60 bg-white p-4 shadow-sm transition hover:border-[#E36C2B] hover:shadow-md sm:flex-row">
                  {featuredIds.has(pack.id) && (
                    <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-16 w-16 overflow-hidden rounded-tl-[10px]">
                      <span className="absolute -left-6 top-3 w-24 -rotate-45 bg-[#E36C2B] py-0.5 text-center text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">NEW</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => onLoadSupportPack(pack)}
                    className="group flex w-full shrink-0 flex-col justify-between rounded-lg border-2 border-[#E36C2B]/70 bg-slate-50/70 p-2.5 text-left transition hover:bg-amber-50/40 sm:w-36"
                    aria-label={`Preview and open ${pack.title}`}
                  >
                    <div className="grid grid-cols-2 gap-1.5">
                      {pack.cards.slice(0, 4).map((card, idx) => (
                        <div key={`${pack.id}-${idx}`} className="flex flex-col items-center justify-center rounded border border-slate-200 bg-white p-1">
                          {renderTileVisual({ src: card.imageSrc, alt: card.label, label: card.label, coreCardId: card.cardId, sizeClass: 'h-9 w-9' })}
                          <span className="mt-0.5 line-clamp-1 text-center text-[9px] font-medium text-slate-700">{card.label}</span>
                        </div>
                      ))}
                    </div>
                    <span className="mt-2 block text-center text-[10px] font-semibold text-[#184E77] group-hover:text-[#E36C2B]">
                      {pack.cards.length} symbol cards
                    </span>
                  </button>
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                    <div>
                      <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{pack.area}</span>
                      <h4 className="mt-1.5 text-base font-bold leading-snug text-[#184E77]">{pack.title}</h4>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                        <SymbolizedText text={pack.summary} symbols={symbols} enabled={symbolSupportOn} />
                      </p>
                    </div>
                    <div className="space-y-2.5 border-t border-slate-100 pt-2.5 text-xs">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600">
                        <span><strong className="text-slate-800">Layout:</strong> {pack.formatLabel}</span>
                        <span><strong className="text-slate-800">Access:</strong> Free</span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-semibold text-slate-700">Formats:</span>
                          <span className="shrink-0 inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[11px] font-medium text-rose-700"><FileText className="h-3 w-3" />PDF</span>
                          <span className="shrink-0 inline-flex items-center gap-1 rounded border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[11px] font-medium text-sky-700"><Eye className="h-3 w-3" />Focus</span>
                          <span className="shrink-0 inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700"><FileDown className="h-3 w-3" />Portable</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onLoadSupportPack(pack)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#E36C2B] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#c85a1e]"
                        >
                          Open Pack <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
