import { PersonaImage } from '../PersonaImage';
import React, { useState } from 'react';
import {
  LayoutGrid,
  Orbit,
  ArrowRight,
  Thermometer,
  CreditCard,
  Volume2,
  PlusCircle,
} from 'lucide-react';
import { CardVisual } from '../AnchorCard';
import { CORE_CARDS, type CoreCardId } from '../../data/core-cards';

export type TemplateLayoutMode =
  | 'grid'
  | 'radial'
  | 'flow'
  | 'thermometer'
  | 'lanyard';

export interface LayoutCardItem {
  id: string;
  title: string;
  subtitle?: string;
  imageSrc?: string;
  coreCardId?: CoreCardId;
}

interface TemplateLayoutEngineProps {
  cards: LayoutCardItem[];
  onSpeakCard?: (text: string) => void;
  onAddToStrip?: (card: LayoutCardItem) => void;
  lowArousalMode?: boolean;
}

const THERMOMETER_LEVELS = [
  {
    level: 5,
    label: 'Level 5 — Very High / Overload',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
    bandClass: 'border-rose-300 bg-rose-50/60',
    supportHint: 'Quiet space, low stimulation, immediate support',
  },
  {
    level: 4,
    label: 'Level 4 — High / Unsettled',
    badgeClass: 'bg-orange-100 text-orange-950 border-orange-300',
    bandClass: 'border-orange-300 bg-orange-50/50',
    supportHint: 'Reduce noise, offer clear choice or break',
  },
  {
    level: 3,
    label: 'Level 3 — Medium / Wobbly',
    badgeClass: 'bg-amber-100 text-amber-950 border-amber-300',
    bandClass: 'border-amber-300 bg-amber-50/50',
    supportHint: 'Check in gently, confirm next step',
  },
  {
    level: 2,
    label: 'Level 2 — Low / Mostly Okay',
    badgeClass: 'bg-sky-100 text-sky-950 border-sky-300',
    bandClass: 'border-sky-300 bg-sky-50/50',
    supportHint: 'Steady routine, gentle encouragement',
  },
  {
    level: 1,
    label: 'Level 1 — Calm / Settled',
    badgeClass: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    bandClass: 'border-emerald-300 bg-emerald-50/50',
    supportHint: 'Comfortable baseline, ready for activity',
  },
];

export const TemplateLayoutEngine: React.FC<TemplateLayoutEngineProps> = ({
  cards,
  onSpeakCard,
  onAddToStrip,
  lowArousalMode = false,
}) => {
  const [layoutMode, setLayoutMode] = useState<TemplateLayoutMode>('grid');
  const [hubIndex, setHubIndex] = useState<number>(0);

  if (!cards || cards.length === 0) return null;

  const safeHubIndex = Math.min(hubIndex, cards.length - 1);
  const hubCard = cards[safeHubIndex];
  const radialSatellites = cards.filter((_, idx) => idx !== safeHubIndex);

  const speakLabel = (card: LayoutCardItem) => {
    const phrase = card.title;
    if (onSpeakCard) {
      onSpeakCard(phrase);
      return;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(phrase);
      utter.lang = 'en-GB';
      utter.rate = 0.92;
      window.speechSynthesis.speak(utter);
    }
  };

  const renderTileArt = (card: LayoutCardItem, sizeClass = 'h-14 w-14') => {
    if (card.imageSrc) {
      return (
        <PersonaImage
          src={card.imageSrc}
          alt={card.title}
          className={`${sizeClass} object-contain`}
          loading="lazy"
        />
      );
    }
    if (card.coreCardId && CORE_CARDS[card.coreCardId]) {
      return <CardVisual card={CORE_CARDS[card.coreCardId]} />;
    }
    return (
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-sm font-extrabold uppercase text-slate-700">
        {card.title.slice(0, 2)}
      </span>
    );
  };

  return (
    <section
      aria-label="Template layout engine"
      className={`no-print mb-6 rounded-2xl border p-5 transition ${
        lowArousalMode
          ? 'border-slate-700 bg-slate-900 text-slate-100'
          : 'border-slate-200 bg-white text-slate-900 shadow-2xs'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D45A1A]">
              Template Layout Engine
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
              {cards.length} {cards.length === 1 ? "card" : "cards"} • {layoutMode}
            </span>
          </div>
          <h3 className="text-base font-extrabold">
            Shape visual supports around how the person reads
          </h3>
        </div>

        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Layout styles">
          {[
            { id: 'grid' as TemplateLayoutMode, label: 'Standard Grid', icon: LayoutGrid },
            { id: 'radial' as TemplateLayoutMode, label: 'Radial Wheel', icon: Orbit },
            { id: 'flow' as TemplateLayoutMode, label: 'Arrow Sequence', icon: ArrowRight },
            { id: 'thermometer' as TemplateLayoutMode, label: '5-Point Scale', icon: Thermometer },
            { id: 'lanyard' as TemplateLayoutMode, label: 'Lanyard Cards', icon: CreditCard },
          ].map((mode) => {
            const Icon = mode.icon;
            const active = layoutMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setLayoutMode(mode.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  active
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : lowArousalMode
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Standard Grid */}
      {layoutMode === 'grid' && (
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {cards.map((card) => (
            <div
              key={card.id}
              className="group relative rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col items-center text-center justify-center gap-2 shadow-2xs hover:border-[#D45A1A] hover:shadow-sm transition"
            >
              <button
                type="button"
                onClick={() => speakLabel(card)}
                className="flex flex-col items-center gap-2 w-full focus:outline-none"
                title={`Speak "${card.title}"`}
              >
                <div className="h-14 w-14 flex items-center justify-center">
                  {renderTileArt(card, 'h-14 w-14')}
                </div>
                <span className="text-xs font-extrabold text-slate-900 leading-tight">
                  {card.title}
                </span>
              </button>
              {onAddToStrip && (
                <button
                  type="button"
                  onClick={() => onAddToStrip(card)}
                  title={`Add "${card.title}" to Sentence Strip`}
                  aria-label={`Add "${card.title}" to Sentence Strip`}
                  className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:border-[#D45A1A] hover:bg-[#D45A1A] hover:text-white transition"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 2. Radial Word Mat / Wheel */}
      {layoutMode === 'radial' && (
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <span>Select the central topic or feeling card:</span>
            <select
              value={safeHubIndex}
              onChange={(e) => setHubIndex(Number(e.target.value))}
              aria-label="Choose central topic card"
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900"
            >
              {cards.map((c, idx) => (
                <option key={c.id} value={idx}>
                  Centre Topic: {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
            <div className="lg:col-span-4 flex flex-col items-center justify-center">
              <button
                type="button"
                onClick={() => speakLabel(hubCard)}
                className="w-full max-w-[220px] rounded-2xl border-2 border-[#D45A1A] bg-amber-50/70 p-5 flex flex-col items-center text-center shadow-xs hover:bg-amber-50 transition"
              >
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#B84710] mb-1">
                  Central Topic
                </span>
                <div className="h-16 w-16 flex items-center justify-center my-1">
                  {renderTileArt(hubCard, 'h-16 w-16')}
                </div>
                <span className="text-base font-extrabold text-slate-950 mt-1">
                  {hubCard.title}
                </span>
                {hubCard.subtitle && (
                  <span className="text-xs text-slate-600 mt-0.5">{hubCard.subtitle}</span>
                )}
              </button>
            </div>

            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {radialSatellites.map((sat) => (
                <button
                  key={sat.id}
                  type="button"
                  onClick={() => speakLabel(sat)}
                  className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col items-center text-center gap-2 hover:border-slate-400 transition"
                >
                  <div className="h-12 w-12 flex items-center justify-center">
                    {renderTileArt(sat, 'h-12 w-12')}
                  </div>
                  <span className="text-xs font-extrabold text-slate-900">{sat.title}</span>
                  {sat.subtitle && (
                    <span className="text-[11px] text-slate-500 line-clamp-1">{sat.subtitle}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Arrow-Flow Sequence (Start -> Step -> End) */}
      {layoutMode === 'flow' && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
          <div className="flex flex-wrap items-center gap-3">
            {cards.map((step, idx) => (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => speakLabel(step)}
                  className="w-40 rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col items-center text-center gap-2 hover:border-[#D45A1A] transition"
                >
                  <span className="inline-flex items-center rounded-full bg-slate-900 text-white px-2.5 py-0.5 text-[10px] font-extrabold">
                    {idx === 0
                      ? 'START • Step 1'
                      : idx === cards.length - 1
                        ? `END • Step ${idx + 1}`
                        : `Step ${idx + 1}`}
                  </span>
                  <div className="h-12 w-12 flex items-center justify-center">
                    {renderTileArt(step, 'h-12 w-12')}
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 leading-tight">
                    {step.title}
                  </span>
                </button>
                {idx < cards.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-[#D45A1A] shrink-0 hidden sm:block" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* 4. 5-Point Feelings / Pain Thermometer */}
      {layoutMode === 'thermometer' && (
        <div className="mt-5 space-y-2.5">
          {THERMOMETER_LEVELS.map((tier, idx) => {
            const mappedCard = cards[idx % cards.length];
            return (
              <div
                key={tier.level}
                className={`rounded-xl border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${tier.bandClass}`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-extrabold shrink-0 ${tier.badgeClass}`}
                  >
                    {tier.label}
                  </span>
                  <div className="text-xs text-slate-700">
                    <span className="font-bold text-slate-900">Support cue:</span>{' '}
                    {tier.supportHint}
                  </div>
                </div>

                {mappedCard && (
                  <button
                    type="button"
                    onClick={() => speakLabel(mappedCard)}
                    className="inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-left self-start sm:self-auto hover:border-slate-400 transition"
                  >
                    <div className="h-9 w-9 flex items-center justify-center shrink-0">
                      {renderTileArt(mappedCard, 'h-9 w-9')}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">
                        {mappedCard.title}
                      </div>
                      <div className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500">
                        <Volume2 className="h-3 w-3" /> Tap to speak
                      </div>
                    </div>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Keyring Lanyard Cut-Out Cards */}
      {layoutMode === 'lanyard' && (
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {cards.slice(0, 8).map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => speakLabel(card)}
              className="relative rounded-2xl border-2 border-dashed border-slate-300 bg-white p-4 flex flex-col items-center text-center gap-2 hover:border-[#D45A1A] transition"
            >
              <span
                aria-hidden="true"
                className="h-3 w-3 rounded-full border border-slate-400 bg-slate-100 inline-block"
                title="Lanyard punch guide"
              />
              <div className="h-12 w-12 flex items-center justify-center">
                {renderTileArt(card, 'h-12 w-12')}
              </div>
              <span className="text-xs font-extrabold text-slate-900">{card.title}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Cut &amp; Punch Card
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};
