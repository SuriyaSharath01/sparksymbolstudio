export type CoreCardId =
  | 'stop'
  | 'wait'
  | 'listen'
  | 'quiet'
  | 'toilet'
  | 'hot_drink'
  | 'tea'
  | 'ear_defenders'
  | 'shopping_bag'
  | 'queue'
  | 'home';

export type CoreCard = {
  id: CoreCardId;
  label: string;
  subtext: string;
  imageSrc: string;
  type: 'symbol' | 'ui-icon' | 'photo';
  color?: string;
};

export const CORE_CARDS: Record<CoreCardId, CoreCard> = {
  // --- SAFETY & ANCHORS (Clean, high-contrast Lucide UI icons) ---
  stop: {
    id: 'stop',
    label: 'STOP',
    subtext: 'Pause right now',
    imageSrc: 'lucide:hand',
    type: 'ui-icon',
    color: '#dc2626',
  },
  wait: {
    id: 'wait',
    label: 'WAIT',
    subtext: 'Watch the visual timer',
    imageSrc: 'lucide:hourglass',
    type: 'ui-icon',
  },
  listen: {
    id: 'listen',
    label: 'LISTEN',
    subtext: 'Listen carefully',
    imageSrc: 'lucide:ear',
    type: 'ui-icon',
  },
  quiet: {
    id: 'quiet',
    label: 'QUIET',
    subtext: 'Calm space needed',
    imageSrc: 'lucide:volume-x',
    type: 'ui-icon',
  },

  // --- DAILY NEEDS (Verified Mulberry SVGs + crisp Lucide fallback for missing items) ---
  toilet: {
    id: 'toilet',
    label: 'Toilet',
    subtext: 'Needs the toilet',
    imageSrc: '/symbols/toilet.svg',
    type: 'symbol',
  },
  hot_drink: {
    id: 'hot_drink',
    label: 'Hot Drink',
    subtext: 'Tea, coffee, or warm drink',
    imageSrc: '/symbols/drink_hot_2.svg',
    type: 'symbol',
  },
  tea: {
    id: 'tea',
    label: 'Tea',
    subtext: 'Cup of tea',
    imageSrc: '/symbols/tea.svg',
    type: 'symbol',
  },
  ear_defenders: {
    id: 'ear_defenders',
    label: 'Ear Defenders',
    subtext: 'Reduce loud noise',
    imageSrc: 'lucide:headphones',
    type: 'ui-icon',
  },

  // --- OUTINGS (Verified Mulberry SVGs + crisp Lucide Home icon) ---
  shopping_bag: {
    id: 'shopping_bag',
    label: 'Shopping Bag',
    subtext: 'Take bag and payment card',
    imageSrc: '/symbols/beach_bag.svg',
    type: 'symbol',
  },
  queue: {
    id: 'queue',
    label: 'Wait in Queue',
    subtext: 'Wait calmly for your turn',
    imageSrc: '/symbols/queue_,_to.svg',
    type: 'symbol',
  },
  home: {
    id: 'home',
    label: 'Go Home',
    subtext: 'Head back to transport or home',
    imageSrc: 'lucide:home',
    type: 'ui-icon',
  },
};

export const CORE_CARD_LIST: CoreCard[] = Object.values(CORE_CARDS);
