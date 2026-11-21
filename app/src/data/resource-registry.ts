import { CORE_CARDS, type CoreCardId } from './core-cards';

export type RoutineStep = {
  id: string;
  label: string;
  symbol?: string;
  coreCardId?: CoreCardId;
  instruction: string;
  waitSeconds?: number;
};

export type SupportPack = {
  id: string;
  title: string;
  category:
    | 'Routines & Transitions'
    | 'Communication & Interaction'
    | 'Sensory & Physical'
    | 'Cognition';
  layout: 'horizontal-strip' | 'vertical-strip';
  steps: RoutineStep[];
};

export const RESOURCE_REGISTRY: Record<string, SupportPack> = {
  morning_routine: {
    id: 'morning_routine',
    title: 'Morning Routine',
    category: 'Routines & Transitions',
    layout: 'vertical-strip',
    steps: [
      {
        id: 'morning_1',
        label: 'Wake Up',
        symbol: '/symbols/wake_up_,_to.svg',
        instruction: 'Time to wake up and start the morning.',
      },
      {
        id: 'morning_2',
        label: CORE_CARDS.toilet.label,
        coreCardId: 'toilet',
        symbol: CORE_CARDS.toilet.imageSrc,
        instruction: 'Use the toilet if needed.',
      },
      {
        id: 'morning_3',
        label: 'Wash Face',
        symbol: '/symbols/wash_face_,_to.svg',
        instruction: 'Wash face with warm water.',
      },
      {
        id: 'morning_4',
        label: 'Brush Teeth',
        symbol: '/symbols/toothbrush.svg',
        instruction: 'Brush teeth with toothpaste.',
      },
      {
        id: 'morning_5',
        label: CORE_CARDS.hot_drink.label,
        coreCardId: 'hot_drink',
        symbol: CORE_CARDS.hot_drink.imageSrc,
        instruction: 'Have a warm drink to start the day.',
      },
    ],
  },

  going_to_shops: {
    id: 'going_to_shops',
    title: 'Going to the Shops',
    category: 'Routines & Transitions',
    layout: 'horizontal-strip',
    steps: [
      {
        id: 'shop_1',
        label: CORE_CARDS.shopping_bag.label,
        coreCardId: 'shopping_bag',
        symbol: CORE_CARDS.shopping_bag.imageSrc,
        instruction: CORE_CARDS.shopping_bag.subtext,
      },
      {
        id: 'shop_2',
        label: 'Walk to Destination',
        symbol: '/symbols/walk_,_to.svg',
        instruction: 'Walk at a comfortable pace.',
      },
      {
        id: 'shop_3',
        label: CORE_CARDS.queue.label,
        coreCardId: 'queue',
        symbol: CORE_CARDS.queue.imageSrc,
        instruction: CORE_CARDS.queue.subtext,
        waitSeconds: 45,
      },
      {
        id: 'shop_4',
        label: CORE_CARDS.home.label,
        coreCardId: 'home',
        symbol: CORE_CARDS.home.imageSrc,
        instruction: CORE_CARDS.home.subtext,
      },
    ],
  },

  handwashing_routine: {
    id: 'handwashing_routine',
    title: 'Handwashing Steps',
    category: 'Sensory & Physical',
    layout: 'horizontal-strip',
    steps: [
      {
        id: 'hand_1',
        label: 'Wash Hands',
        symbol: '/symbols/wash_hands_,_to.svg',
        instruction: 'Wash hands thoroughly with water and soap.',
      },
      {
        id: 'hand_2',
        label: 'Dry Hands',
        symbol: '/symbols/dry_hands_,_to.svg',
        instruction: 'Dry hands completely.',
      },
    ],
  },

  laundry_routine: {
    id: 'laundry_routine',
    title: 'Laundry Routine',
    category: 'Cognition',
    layout: 'horizontal-strip',
    steps: [
      {
        id: 'laundry_1',
        label: 'Wash Clothes',
        symbol: '/symbols/wash_clothes_,_to.svg',
        instruction: 'Gather clothes for the wash.',
      },
      {
        id: 'laundry_2',
        label: 'Washing Machine',
        symbol: '/symbols/washing_machine.svg',
        instruction: 'Load machine and start cycle.',
      },
      {
        id: 'laundry_3',
        label: 'Washing Powder',
        symbol: '/symbols/washing_powder.svg',
        instruction: 'Add detergent as needed.',
      },
    ],
  },

  sensory_calm: {
    id: 'sensory_calm',
    title: 'Sensory & Calm Support',
    category: 'Sensory & Physical',
    layout: 'horizontal-strip',
    steps: [
      {
        id: 'calm_1',
        label: CORE_CARDS.stop.label,
        coreCardId: 'stop',
        symbol: CORE_CARDS.stop.imageSrc,
        instruction: CORE_CARDS.stop.subtext,
      },
      {
        id: 'calm_2',
        label: CORE_CARDS.quiet.label,
        coreCardId: 'quiet',
        symbol: CORE_CARDS.quiet.imageSrc,
        instruction: CORE_CARDS.quiet.subtext,
        waitSeconds: 60,
      },
      {
        id: 'calm_3',
        label: 'Ear Muffs / Defenders',
        symbol: '/symbols/ear_muffs.svg',
        instruction: 'Put on ear protection if sound feels too loud.',
      },
    ],
  },
};

export const RESOURCE_REGISTRY_LIST: SupportPack[] = Object.values(RESOURCE_REGISTRY);
