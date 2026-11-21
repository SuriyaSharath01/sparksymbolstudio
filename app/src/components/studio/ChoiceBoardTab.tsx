import React from 'react';
import { Plus } from 'lucide-react';
import type { CoreCardId } from '../../data/core-cards';
import type { QuickCard } from '../../data/studio-presets';

interface ChoiceBoardTabProps {
  items: QuickCard[];
  onAddToGrid: (item: QuickCard) => void;
  renderTileVisual: (props: TileVisualProps) => React.ReactNode;
}

interface TileVisualProps {
  src?: string;
  alt: string;
  label: string;
  coreCardId?: CoreCardId;
  sizeClass?: string;
}

export function ChoiceBoardTab({ items, onAddToGrid, renderTileVisual }: ChoiceBoardTabProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-extrabold text-slate-900">Choice Board</h2>
        <p className="text-xs text-slate-500">
          Compact symbol-above-label choice tiles ready for pointing or A4 printing.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items.map((item) => (
          <article
            key={item.id}
            className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-900 bg-white p-3.5 text-center"
          >
            {renderTileVisual({
              src: item.imageSrc,
              alt: item.title,
              label: item.title,
              coreCardId: item.coreCardId,
              sizeClass: 'h-16 w-16',
            })}
            <h3 className="mt-2.5 text-base font-extrabold text-slate-950">{item.title}</h3>
            <p className="mt-0.5 text-xs text-slate-600">{item.actionText}</p>
            <button
              type="button"
              onClick={() => onAddToGrid(item)}
              className="mt-3 inline-flex min-h-[34px] items-center gap-1 rounded-lg bg-slate-900 px-3 py-1 text-xs font-bold text-white hover:bg-slate-800"
            >
              <Plus />
              <span>Add to Grid</span>
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
