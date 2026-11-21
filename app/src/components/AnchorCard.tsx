import React, { useState } from 'react';
import {
  Hand,
  Hourglass,
  Ear,
  VolumeX,
  Headphones,
  Home,
} from 'lucide-react';
import { CORE_CARDS, type CoreCard, type CoreCardId } from '../data/core-cards';

interface CardVisualProps {
  card: CoreCard;
}

export const CardVisual: React.FC<CardVisualProps> = ({ card }) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (card.type === 'ui-icon' || imgFailed) {
    if (card.id === 'stop') {
      return <Hand size={72} strokeWidth={2.2} color="#dc2626" />;
    }
    if (card.id === 'wait') {
      return <Hourglass size={72} strokeWidth={2.2} color="#1e293b" />;
    }
    if (card.id === 'listen') {
      return <Ear size={72} strokeWidth={2.2} color="#1e293b" />;
    }
    if (card.id === 'quiet') {
      return <VolumeX size={72} strokeWidth={2.2} color="#1e293b" />;
    }
    if (card.id === 'ear_defenders') {
      return <Headphones size={72} strokeWidth={2.2} color="#1e293b" />;
    }
    if (card.id === 'home') {
      return <Home size={72} strokeWidth={2.2} color="#1e293b" />;
    }

    return (
      <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-extrabold uppercase text-slate-700">
        {card.label}
      </span>
    );
  }

  return (
    <img
      src={card.imageSrc}
      alt={card.label}
      onError={() => setImgFailed(true)}
      className="h-24 w-24 object-contain"
    />
  );
};

interface AnchorCardProps {
  cardId: CoreCardId;
  onSelect?: (card: CoreCard) => void;
}

export const AnchorCard: React.FC<AnchorCardProps> = ({ cardId, onSelect }) => {
  const card = CORE_CARDS[cardId];
  if (!card) return null;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(card)}
      className="flex w-full flex-col items-center rounded-2xl border-2 border-slate-200 bg-white p-6 text-center shadow-xs transition hover:border-slate-400 hover:bg-slate-50/70"
    >
      <div className="mb-4 flex h-24 w-24 items-center justify-center">
        <CardVisual card={card} />
      </div>
      <h2
        className="text-2xl font-extrabold tracking-tight"
        style={{ color: card.color || '#0f172a' }}
      >
        {card.label}
      </h2>
      <p className="mt-1.5 text-sm text-slate-600">{card.subtext}</p>
    </button>
  );
};
