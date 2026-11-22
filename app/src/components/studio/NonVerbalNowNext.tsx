import React, { useState } from 'react';
import { Lock, Unlock, ArrowRight, Plus, RotateCcw } from 'lucide-react';
import type { BoardTileItem, SymbolCatalogItem } from './CustomBoardWorkspace';

interface NonVerbalNowNextProps<TCoreId extends string = string> {
  tiles: BoardTileItem<TCoreId>[];
  onAdvanceNow: () => void;
  onResetBoard: () => void;
  onOpenSymbolPicker: () => void;
  symbols: SymbolCatalogItem[];
  onSetSlotTile: (slotIndex: 0 | 1, sym: SymbolCatalogItem) => void;
  renderTileVisual: (params: {
    src?: string;
    alt: string;
    label: string;
    coreCardId?: TCoreId;
    sizeClass?: string;
  }) => React.ReactNode;
}

const STARTER_PAIRS: {
  title: string;
  now: { label: string; imageSrc: string };
  next: { label: string; imageSrc: string };
}[] = [
  {
    title: 'Drink → Toilet',
    now: { label: 'Drink / Tea', imageSrc: '/symbols/tea.svg' },
    next: { label: 'Toilet', imageSrc: '/symbols/toilet.svg' },
  },
  {
    title: 'Quiet Space → Rest',
    now: { label: 'Quiet Space', imageSrc: '/symbols/quiet.svg' },
    next: { label: 'Rest / Lie Down', imageSrc: '/symbols/sleep_female_,_to.svg' },
  },
  {
    title: 'Wash Hands → Food',
    now: { label: 'Wash Hands', imageSrc: '/symbols/wash_hands_,_to.svg' },
    next: { label: 'Eat Meal', imageSrc: '/symbols/eat_,_to.svg' },
  },
];

export function NonVerbalNowNext<TCoreId extends string = string>({
  tiles,
  onAdvanceNow,
  onResetBoard,
  onOpenSymbolPicker,
  symbols,
  onSetSlotTile,
  renderTileVisual,
}: NonVerbalNowNextProps<TCoreId>) {
  const [sensoryLock, setSensoryLock] = useState(false);
  const [quickPickSlot, setQuickPickSlot] = useState<0 | 1 | null>(null);
  const [quickQuery, setQuickQuery] = useState('');

  const nowTile = tiles[0] || null;
  const nextTile = tiles[1] || null;

  const quickMatches = quickQuery.trim()
    ? symbols
        .filter((s) => s.label.toLowerCase().includes(quickQuery.trim().toLowerCase()))
        .slice(0, 12)
    : symbols.slice(0, 12);

  return (
    <div
      className={`rounded-2xl border-2 p-5 transition-colors ${
        sensoryLock
          ? 'border-slate-400 bg-[#eef2ef] text-slate-900'
          : 'border-slate-900 bg-white text-slate-900 shadow-xs'
      }`}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <span className="inline-block rounded-md bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide text-emerald-900">
            2-Card Visual Sequence
          </span>
          <h2 className="mt-1 text-lg font-black tracking-tight text-slate-900">
            Now / Next Board
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!sensoryLock && (
            <>
              <button
                type="button"
                onClick={onOpenSymbolPicker}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-50"
              >
                <Plus className="h-4 w-4" />
                <span>Browse All Symbols</span>
              </button>
              {tiles.length > 0 && (
                <button
                  type="button"
                  onClick={onResetBoard}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={() => {
              setSensoryLock((prev) => !prev);
              setQuickPickSlot(null);
            }}
            aria-pressed={sensoryLock}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
              sensoryLock
                ? 'bg-slate-800 text-white hover:bg-slate-900'
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
            }`}
          >
            {sensoryLock ? (
              <>
                <Unlock className="h-4 w-4" />
                <span>Unlock Screen</span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                <span>Sensory Lock</span>
              </>
            )}
          </button>
        </div>
      </div>

            {!sensoryLock && (!nowTile || !nextTile) && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
            Quick Pair:
          </span>
          {STARTER_PAIRS.map((pair) => (
            <button
              key={pair.title}
              type="button"
              onClick={() => {
                onSetSlotTile(0, { id: 'starter_now', label: pair.now.label, svgPath: pair.now.imageSrc, category: 'Starter' });
                onSetSlotTile(1, { id: 'starter_next', label: pair.next.label, svgPath: pair.next.imageSrc, category: 'Starter' });
              }}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-extrabold text-slate-800 hover:border-slate-500 hover:bg-slate-100"
            >
              {pair.title}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          { idx: 0 as const, badge: 'NOW', tile: nowTile, accent: 'border-emerald-700 bg-[#f6faf7]' },
          { idx: 1 as const, badge: 'NEXT', tile: nextTile, accent: 'border-slate-400 bg-[#f7f8fa]' },
        ].map(({ idx, badge, tile, accent }) => (
          <div
            key={badge}
            className={`flex min-h-[250px] flex-col items-center justify-between rounded-2xl border-2 p-5 text-center ${accent}`}
          >
            <span
              className={`rounded-full px-3.5 py-1 text-xs font-black tracking-wider ${
                badge === 'NOW'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-slate-700 text-white'
              }`}
            >
              {badge}
            </span>

            {tile ? (
              <>
                <div className="my-3 flex h-32 w-32 items-center justify-center">
                  {renderTileVisual({
                    src: tile.imageSrc,
                    alt: tile.title,
                    label: tile.title,
                    coreCardId: tile.coreCardId as TCoreId,
                    sizeClass: 'h-32 w-32',
                  })}
                </div>
                <p className="text-xl font-black text-slate-950">{tile.title}</p>
              </>
            ) : (
              <div className="my-4 flex flex-col items-center justify-center text-slate-500">
                <p className="text-sm font-bold">No picture set for {badge}</p>
                {!sensoryLock && (
                  <button
                    type="button"
                    onClick={() => setQuickPickSlot(idx)}
                    className="mt-2.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-800 hover:bg-slate-100"
                  >
                    Choose Picture for {badge}
                  </button>
                )}
              </div>
            )}

            {!sensoryLock && tile && (
              <button
                type="button"
                onClick={() => setQuickPickSlot(quickPickSlot === idx ? null : idx)}
                className="mt-2 rounded-lg border border-slate-300 bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-700 hover:bg-white"
              >
                Swap {badge} Picture
              </button>
            )}
          </div>
        ))}
      </div>

      {!sensoryLock && quickPickSlot !== null && (
        <div className="mt-4 rounded-xl border border-slate-300 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-extrabold text-slate-800">
              Quick Swap for {quickPickSlot === 0 ? 'NOW' : 'NEXT'}
            </p>
            <button
              type="button"
              onClick={() => setQuickPickSlot(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Close
            </button>
          </div>
          <input
            type="text"
            value={quickQuery}
            onChange={(e) => setQuickQuery(e.target.value)}
            placeholder="Type e.g. tea, toilet, walk, quiet, bus..."
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-slate-500 focus:outline-none"
          />
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {quickMatches.map((sym) => (
              <button
                key={sym.id}
                type="button"
                onClick={() => {
                  onSetSlotTile(quickPickSlot, sym);
                  setQuickPickSlot(null);
                  setQuickQuery('');
                }}
                className="flex flex-col items-center rounded-lg border border-slate-200 bg-white p-2 text-center hover:border-slate-500"
              >
                <img src={sym.svgPath} alt={sym.label} className="h-10 w-10 object-contain" />
                <span className="mt-1 line-clamp-1 text-[11px] font-bold text-slate-800">
                  {sym.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {tiles.length > 0 && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={onAdvanceNow}
            className="flex min-h-[52px] items-center gap-2 rounded-2xl bg-emerald-800 px-6 py-3 text-sm font-black text-white shadow-xs transition hover:bg-emerald-900"
          >
            <span>Finished “{nowTile?.title}” — Move to Next</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
