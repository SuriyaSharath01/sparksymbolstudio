import { searchMulberrySymbols, type MulberrySymbol } from './symbols';
import type { StudioCell, StudioPage } from '../types/studio';

export interface StudioTemplateSpec {
  id: string;
  name: string;
  badge: string;
  description: string;
  columns: 2 | 3 | 4 | 5;
  orientation: 'portrait' | 'landscape';
  defaultBackground: string;
  items: {
    query: string;
    caption: string;
    borderColor: string;
    backgroundColor: string;
    displayMode?: StudioCell['displayMode'];
    negated?: boolean;
  }[];
}

export const STUDIO_CLINICAL_TEMPLATES: StudioTemplateSpec[] = [
  {
    id: 'mealtime_placemat',
    name: 'Mealtime Communication Placemat',
    badge: 'InPrint Layout',
    description: 'Laminate-ready dining board for requesting drinks, seconds, breaks, or help.',
    columns: 4,
    orientation: 'landscape',
    defaultBackground: '#FAFAF5',
    items: [
      { query: 'I want', caption: 'I want', borderColor: '#D97706', backgroundColor: '#FFFBEB' },
      { query: 'drink', caption: 'Drink please', borderColor: '#E36C2B', backgroundColor: '#FFF7ED' },
      { query: 'more', caption: 'More food', borderColor: '#059669', backgroundColor: '#ECFDF5' },
      { query: 'finished', caption: 'All finished', borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
      { query: 'help', caption: 'Help please', borderColor: '#E11D48', backgroundColor: '#FFF1F2' },
      { query: 'toilet', caption: 'Toilet', borderColor: '#E36C2B', backgroundColor: '#FFF7ED' },
      { query: 'break', caption: 'Quiet break', borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
      { query: 'no', caption: 'No thank you', borderColor: '#DC2626', backgroundColor: '#FEF2F2', negated: true },
    ],
  },
  {
    id: 'zones_regulation',
    name: 'Zones of Regulation Feelings Map',
    badge: 'Sensory & PBS',
    description: '4-zone emotional check-in paired with concrete sensory regulation actions.',
    columns: 4,
    orientation: 'landscape',
    defaultBackground: '#FFFFFF',
    items: [
      { query: 'tired', caption: 'Blue: Tired / Sad', borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
      { query: 'happy', caption: 'Green: Calm / Ready', borderColor: '#059669', backgroundColor: '#ECFDF5' },
      { query: 'worried', caption: 'Yellow: Worried / Frustrated', borderColor: '#D97706', backgroundColor: '#FFFBEB' },
      { query: 'angry', caption: 'Red: Angry / Overwhelmed', borderColor: '#DC2626', backgroundColor: '#FEF2F2' },
      { query: 'sleep', caption: 'Rest / Sit down', borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
      { query: 'thumbs up', caption: 'Good to go', borderColor: '#059669', backgroundColor: '#ECFDF5' },
      { query: 'water', caption: 'Drink cold water', borderColor: '#D97706', backgroundColor: '#FFFBEB' },
      { query: 'quiet', caption: 'Quiet space', borderColor: '#DC2626', backgroundColor: '#FEF2F2' },
    ],
  },
  {
    id: 'colourful_semantics',
    name: 'Colourful Semantics Sentence Grid',
    badge: 'SALT Grammar',
    description: 'Who (Amber) • Doing What (Green) • What (Orange) • Where (Blue).',
    columns: 4,
    orientation: 'landscape',
    defaultBackground: '#FFFFFF',
    items: [
      { query: 'I', caption: 'I', borderColor: '#D97706', backgroundColor: '#FFFBEB' },
      { query: 'drink', caption: 'am drinking', borderColor: '#059669', backgroundColor: '#ECFDF5' },
      { query: 'tea', caption: 'a cup of tea', borderColor: '#E36C2B', backgroundColor: '#FFF7ED' },
      { query: 'kitchen', caption: 'in the kitchen', borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
      { query: 'staff', caption: 'Support staff', borderColor: '#D97706', backgroundColor: '#FFFBEB' },
      { query: 'walk', caption: 'is walking', borderColor: '#059669', backgroundColor: '#ECFDF5' },
      { query: 'dog', caption: 'outside', borderColor: '#E36C2B', backgroundColor: '#FFF7ED' },
      { query: 'park', caption: 'in the park', borderColor: '#0284C7', backgroundColor: '#F0F9FF' },
    ],
  },
  {
    id: 'weekly_timetable',
    name: 'Weekly Routine Timetable (Mon–Fri)',
    badge: '5-Day Schedule',
    description: 'Clear 5-column weekday overview reducing transition uncertainty.',
    columns: 5,
    orientation: 'landscape',
    defaultBackground: '#FAFAF5',
    items: [
      { query: 'calendar', caption: 'Monday', borderColor: '#0F172A', backgroundColor: '#F1F5F9', displayMode: 'text-only' },
      { query: 'calendar', caption: 'Tuesday', borderColor: '#0F172A', backgroundColor: '#F1F5F9', displayMode: 'text-only' },
      { query: 'calendar', caption: 'Wednesday', borderColor: '#0F172A', backgroundColor: '#F1F5F9', displayMode: 'text-only' },
      { query: 'calendar', caption: 'Thursday', borderColor: '#0F172A', backgroundColor: '#F1F5F9', displayMode: 'text-only' },
      { query: 'calendar', caption: 'Friday', borderColor: '#0F172A', backgroundColor: '#F1F5F9', displayMode: 'text-only' },
      { query: 'shopping', caption: 'Food Shop', borderColor: '#E36C2B', backgroundColor: '#FFFFFF' },
      { query: 'swimming', caption: 'Swimming', borderColor: '#0284C7', backgroundColor: '#FFFFFF' },
      { query: 'cooking', caption: 'Cooking Club', borderColor: '#059669', backgroundColor: '#FFFFFF' },
      { query: 'walk', caption: 'Park Walk', borderColor: '#059669', backgroundColor: '#FFFFFF' },
      { query: 'music', caption: 'Music Session', borderColor: '#D97706', backgroundColor: '#FFFFFF' },
    ],
  },
];

export function instantiateStudioTemplate(
  spec: StudioTemplateSpec,
  symbols: MulberrySymbol[],
  overrideBackground?: string
): StudioPage {
  const cells: StudioCell[] = spec.items.map((item, idx) => {
    const hit = searchMulberrySymbols(symbols, item.query, 'All', 1)[0];
    return {
      id: `tpl-${spec.id}-${Date.now()}-${idx}`,
      symbolId: hit?.id || `tpl-sym-${idx}`,
      symbolSrc: hit?.svgPath || '',
      caption: item.caption,
      displayMode: item.displayMode || 'symbol-text-below',
      negated: item.negated,
      style: {
        borderColor: item.borderColor,
        borderWidth: 2,
        borderStyle: 'solid',
        borderRadius: 14,
        backgroundColor: item.backgroundColor,
      },
    };
  });

  return {
    id: `page-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: spec.name,
    orientation: spec.orientation,
    background: overrideBackground || spec.defaultBackground,
    columns: spec.columns,
    gapPx: 14,
    templateBadge: spec.badge,
    cells,
  };
}
