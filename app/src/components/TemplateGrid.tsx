import React from 'react';
import { MessageSquare, CalendarDays, Shield, Coffee } from 'lucide-react';
import { RESOURCE_REGISTRY } from '../data/resource-registry';

export type TemplatePillAction =
  | { type: 'registry'; registryKey: keyof typeof RESOURCE_REGISTRY }
  | { type: 'template'; templateId: 'now_next_then' | 'choice_grid' | 'routine_strip' | 'flashcards' }
  | { type: 'tab'; tab: 'wants' | 'anchors' | 'media' | 'packs' }
  | { type: 'schedule'; presetKey: 'shops' | 'park' | 'swimming' | 'disco' }
  | { type: 'pack'; packId: string };

interface TemplateCategory {
  title: string;
  description: string;
  icon: React.ReactNode;
  cards: { label: string; action: TemplatePillAction }[];
}

const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    title: 'Communication & Interaction',
    description: 'Choice boards, Now / Next / Then strips, and core anchor cards for immediate expression.',
    icon: <MessageSquare size={28} color="#E36C2B" />,
    cards: [
      { label: 'What I Want Board', action: { type: 'tab', tab: 'wants' } },
      { label: 'Now / Next / Then', action: { type: 'template', templateId: 'now_next_then' } },
      { label: 'Core Anchor Cards', action: { type: 'tab', tab: 'anchors' } },
    ],
  },
  {
    title: 'Routines & Transitions',
    description: 'Step-by-step outing sequences and daily routines to reduce anxiety around transitions.',
    icon: <CalendarDays size={28} color="#E36C2B" />,
    cards: [
      { label: RESOURCE_REGISTRY.morning_routine.title, action: { type: 'registry', registryKey: 'morning_routine' } },
      { label: RESOURCE_REGISTRY.going_to_shops.title, action: { type: 'registry', registryKey: 'going_to_shops' } },
      { label: 'Park & Fresh Air', action: { type: 'schedule', presetKey: 'park' } },
      { label: 'Swimming Session', action: { type: 'schedule', presetKey: 'swimming' } },
      { label: 'Group / Music', action: { type: 'schedule', presetKey: 'disco' } },
    ],
  },
  {
    title: 'Sensory & Physical Needs',
    description: 'Personal care steps, sensory regulation cards, and calm space prompts.',
    icon: <Shield size={28} color="#E36C2B" />,
    cards: [
      { label: RESOURCE_REGISTRY.handwashing_routine.title, action: { type: 'registry', registryKey: 'handwashing_routine' } },
      { label: RESOURCE_REGISTRY.sensory_calm.title, action: { type: 'registry', registryKey: 'sensory_calm' } },
      { label: 'Quiet Time', action: { type: 'tab', tab: 'anchors' } },
      { label: 'Core Flashcards', action: { type: 'template', templateId: 'flashcards' } },
    ],
  },
  {
    title: 'Everyday Living & Care',
    description: 'Practical household routines, choice grids, drinks, and local resident photos.',
    icon: <Coffee size={28} color="#E36C2B" />,
    cards: [
      { label: RESOURCE_REGISTRY.laundry_routine.title, action: { type: 'registry', registryKey: 'laundry_routine' } },
      { label: 'Daily Home Routine', action: { type: 'pack', packId: 'pack_everyday_living' } },
      { label: 'Choice Grid', action: { type: 'template', templateId: 'choice_grid' } },
      { label: 'Real Photos', action: { type: 'tab', tab: 'media' } },
    ],
  },
];

interface TemplateGridProps {
  onSelectAction: (action: TemplatePillAction) => void;
}

export const TemplateGrid: React.FC<TemplateGridProps> = ({ onSelectAction }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
          Start From a Resource Template
        </h2>
        <p className="mt-0.5 text-xs text-slate-600">
          Organised across the 4 Areas of Support—click any routine or resource below to load its verified steps into your strip and print view.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {TEMPLATE_CATEGORIES.map((category) => (
          <div
            key={category.title}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-5"
          >
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-lg bg-orange-50 p-2.5">
                  {category.icon}
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {category.title}
                </h3>
              </div>

              <p className="mb-4 text-xs leading-relaxed text-slate-600">
                {category.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {category.cards.map((card) => (
                <button
                  key={card.label}
                  type="button"
                  onClick={() => onSelectAction(card.action)}
                  className="rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:border-[#E36C2B] hover:bg-orange-50 hover:text-[#D45A1A]"
                >
                  {card.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateGrid;
