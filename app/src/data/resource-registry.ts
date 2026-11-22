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
  sector?: "Adult Social Care" | "NHS & Health" | "SEND Education" | "Dual-Language / EAL";
  languages?: string[];
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

  evening_wind_down: {
    id: 'evening_wind_down',
    title: 'Evening Wind-Down & Night Comfort',
    category: 'Routines & Transitions',
    sector: 'Adult Social Care',
    layout: 'vertical-strip',
    steps: [
      {
        id: 'eve_1',
        label: 'Warm Drink or Snack',
        symbol: '/symbols/drink.svg',
        instruction: 'Offer a preferred warm decaf drink or light snack before bed.',
      },
      {
        id: 'eve_2',
        label: 'Bathroom & Wash',
        symbol: '/symbols/wash_hands.svg',
        instruction: 'Support personal care, teeth cleaning, and nightwear change.',
      },
      {
        id: 'eve_3',
        label: CORE_CARDS.quiet.label,
        coreCardId: 'quiet',
        symbol: CORE_CARDS.quiet.imageSrc,
        instruction: 'Dim lights, check room temperature, and keep night checks calm.',
        waitSeconds: 60,
      },
    ],
  },

  nhs_clinic_checkin: {
    id: 'nhs_clinic_checkin',
    title: 'NHS GP & Hospital Clinic Check-In',
    category: 'Communication & Interaction',
    sector: 'NHS & Health',
    layout: 'horizontal-strip',
    steps: [
      {
        id: 'nhs_1',
        label: CORE_CARDS.wait.label,
        coreCardId: 'wait',
        symbol: CORE_CARDS.wait.imageSrc,
        instruction: 'Show waiting area step clearly and confirm expected appointment order.',
        waitSeconds: 120,
      },
      {
        id: 'nhs_2',
        label: CORE_CARDS.listen.label,
        coreCardId: 'listen',
        symbol: CORE_CARDS.listen.imageSrc,
        instruction: 'Clinician and support lead explain blood pressure, check, or scan simply.',
      },
      {
        id: 'nhs_3',
        label: CORE_CARDS.stop.label,
        coreCardId: 'stop',
        symbol: CORE_CARDS.stop.imageSrc,
        instruction: 'Use the Stop card to pause any examination or ask for a break.',
      },
    ],
  },

  pain_comfort_check: {
    id: 'pain_comfort_check',
    title: 'Pain, Discomfort & Body Check',
    category: 'Sensory & Physical',
    sector: 'NHS & Health',
    layout: 'horizontal-strip',
    steps: [
      {
        id: 'pain_1',
        label: 'Point to Where It Hurts',
        symbol: '/symbols/point.svg',
        instruction: 'Point to head, chest, stomach, back, arm, or leg on the body chart.',
      },
      {
        id: 'pain_2',
        label: 'Rate Comfort (1–5)',
        symbol: '/symbols/scale.svg',
        instruction: 'Check whether discomfort is mild, moderate, or severe before acting.',
      },
      {
        id: 'pain_3',
        label: 'Ask for Relief or Nurse',
        symbol: '/symbols/help.svg',
        instruction: 'Alert senior staff or clinical team for pain relief or assessment.',
      },
    ],
  },

  send_now_next_then: {
    id: 'send_now_next_then',
    title: 'Now / Next / Then Transition Board',
    category: 'Routines & Transitions',
    sector: 'SEND Education',
    layout: 'horizontal-strip',
    steps: [
      {
        id: 'nnt_1',
        label: 'NOW: Current Activity',
        symbol: '/symbols/now.svg',
        instruction: 'Show the single task happening right now with clear start cue.',
      },
      {
        id: 'nnt_2',
        label: 'NEXT: Upcoming Step',
        symbol: '/symbols/next.svg',
        instruction: 'Give a calm transition warning before changing activity or room.',
        waitSeconds: 30,
      },
      {
        id: 'nnt_3',
        label: 'THEN: Preferred Reward',
        symbol: '/symbols/then.svg',
        instruction: 'Pair completion with a motivating activity, break, or choice.',
      },
    ],
  },

  send_feelings_wheel: {
    id: 'send_feelings_wheel',
    title: 'Feelings & Regulation Check-In',
    category: 'Cognition',
    sector: 'SEND Education',
    layout: 'horizontal-strip',
    steps: [
      {
        id: 'feel_1',
        label: 'How Do I Feel Now?',
        symbol: '/symbols/feelings.svg',
        instruction: 'Name or point to calm, tired, worried, frustrated, or uncomfortable.',
      },
      {
        id: 'feel_2',
        label: 'Breathing & Quiet Space',
        coreCardId: 'quiet',
        symbol: CORE_CARDS.quiet.imageSrc,
        instruction: 'Step into a low-arousal corner and take slow breaths together.',
        waitSeconds: 45,
      },
      {
        id: 'feel_3',
        label: 'Choose Safe Next Step',
        symbol: '/symbols/choice.svg',
        instruction: 'Pick a safe action card to reset and return when ready.',
      },
    ],
  },

  dual_language_care_mat: {
    id: 'dual_language_care_mat',
    title: 'Dual-Language Care & Greeting Phrases',
    category: 'Communication & Interaction',
    sector: 'Dual-Language / EAL',
    languages: ['English', 'Telugu (తెలుగు)', 'Urdu (اردو)', 'Polish (Polski)', 'Bengali (বাংলা)'],
    layout: 'horizontal-strip',
    steps: [
      {
        id: 'lang_1',
        label: 'Hello & Welcome / నమస్కారం / السلام علیکم / Cześć',
        symbol: '/symbols/hello.svg',
        instruction: 'Greet residents and families in their home language alongside English.',
      },
      {
        id: 'lang_2',
        label: 'Food, Tea & Water / భోజనం & టీ / کھانا اور چائے / Herbata',
        symbol: '/symbols/drink.svg',
        instruction: 'Confirm meal and drink preferences clearly with dual-script labels.',
      },
      {
        id: 'lang_3',
        label: 'Are You Comfortable? / మీకు సౌకర్యంగా ఉందా?',
        symbol: '/symbols/comfort.svg',
        instruction: 'Check comfort and pain in a familiar language during care or visits.',
      },
    ],
  },
};

export const RESOURCE_REGISTRY_LIST: SupportPack[] = Object.values(RESOURCE_REGISTRY);
