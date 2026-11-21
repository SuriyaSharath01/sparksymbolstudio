import React from 'react';
import type { CoreCardId } from '../../data/core-cards';
import { CORE_CARDS } from '../../data/core-cards';
import type { QuickCard } from '../../data/studio-presets';

interface CoreCardsTabProps {
  anchorCardIds: CoreCardId[];
  onAddToGrid: (card: QuickCard) => void;
  renderTileVisual: (props: {
    src?: string;
    alt: string;
    label: string;
    coreCardId?: CoreCardId;
    sizeClass?: string;
  }) => React.ReactNode;
}

export function CoreCardsTab({
  anchorCardIds,
  onAddToGrid,
  renderTileVisual,
}: CoreCardsTabProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-extrabold text-slate-900">Core Anchor Cards</h2>
        <p className="text-xs text-slate-500">
          Compact symbol-above-label anchor tiles for immediate communication.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {anchorCardIds.map((cardId) => {
          const card = CORE_CARDS[cardId];
          return (
            <button
              key={cardId}
              type="button"
              onClick={() =>
                onAddToGrid({
                  id: card.id,
                  title: card.label,
                  actionText: card.subtext,
                  keywords: [card.label.toLowerCase()],
                  imageSrc: card.imageSrc,
                  coreCardId: card.id,
                })
              }
              className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-900 bg-white p-3.5 text-center transition hover:border-[#E36C2B] hover:bg-orange-50/30"
            >
              {renderTileVisual({
                src: card.imageSrc,
                alt: card.label,
                label: card.label,
                coreCardId: card.id,
                sizeClass: 'h-16 w-16',
              })}
              <span
                className="mt-2.5 text-base font-black tracking-tight"
                style={{ color: card.color || '#0f172a' }}
              >
                {card.label}
              </span>
              <span className="mt-0.5 text-[11px] text-slate-600">{card.subtext}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
