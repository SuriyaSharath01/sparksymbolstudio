import { CORE_CARDS, type CoreCardId } from './core-cards';

export type ResourceTemplateId = 'now_next_then' | 'choice_grid' | 'routine_strip' | 'flashcards';

export interface QuickCard {
  id: string;
  title: string;
  actionText: string;
  keywords: string[];
  imageSrc: string;
  coreCardId?: CoreCardId;
  waitSeconds?: number;
}

export interface SupportPackItem {
  id: string;
  area:
    | 'Communication & Choice'
    | 'Routines & Transitions'
    | 'Sensory & Calm Support'
    | 'Everyday Living & Care';
  title: string;
  summary: string;
  formatLabel: string;
  cards: { slotLabel: string; cardId?: CoreCardId; label: string; subtext: string; imageSrc: string }[];
}

export interface CommunityPresetStep {
  id: string;
  label: string;
  actionInstruction: string;
  imageSrc: string;
  imageAlt?: string;
  coreCardId?: CoreCardId;
  waitSeconds?: number;
}

export interface CommunityPreset {
  name: string;
  locationHint: string;
  steps: CommunityPresetStep[];
}

export const SUPPORT_PACKS: SupportPackItem[] = [
  {
    id: 'pack_comm_choice',
    area: 'Communication & Choice',
    title: 'Everyday Choice & Request Pack',
    summary:
      'Clear symbol-above-label tiles for drinks, toilet breaks, quiet time, and going home without verbal pressure.',
    formatLabel: '6-Cell Choice Sheet',
    cards: [
      {
        slotLabel: 'CHOICE 1',
        cardId: 'tea',
        label: CORE_CARDS.tea.label,
        subtext: CORE_CARDS.tea.subtext,
        imageSrc: CORE_CARDS.tea.imageSrc,
      },
      {
        slotLabel: 'CHOICE 2',
        cardId: 'hot_drink',
        label: CORE_CARDS.hot_drink.label,
        subtext: CORE_CARDS.hot_drink.subtext,
        imageSrc: CORE_CARDS.hot_drink.imageSrc,
      },
      {
        slotLabel: 'CHOICE 3',
        cardId: 'toilet',
        label: CORE_CARDS.toilet.label,
        subtext: CORE_CARDS.toilet.subtext,
        imageSrc: CORE_CARDS.toilet.imageSrc,
      },
      {
        slotLabel: 'CHOICE 4',
        cardId: 'quiet',
        label: CORE_CARDS.quiet.label,
        subtext: CORE_CARDS.quiet.subtext,
        imageSrc: CORE_CARDS.quiet.imageSrc,
      },
      {
        slotLabel: 'CHOICE 5',
        cardId: 'ear_defenders',
        label: CORE_CARDS.ear_defenders.label,
        subtext: CORE_CARDS.ear_defenders.subtext,
        imageSrc: CORE_CARDS.ear_defenders.imageSrc,
      },
      {
        slotLabel: 'CHOICE 6',
        cardId: 'home',
        label: CORE_CARDS.home.label,
        subtext: CORE_CARDS.home.subtext,
        imageSrc: CORE_CARDS.home.imageSrc,
      },
    ],
  },
  {
    id: 'pack_routines_transitions',
    area: 'Routines & Transitions',
    title: 'Community Outing & Transition Strip',
    summary:
      'Predictable step-by-step sequence for shopping, waiting in line, and returning home calmly.',
    formatLabel: '4-Step Outing Strip',
    cards: [
      {
        slotLabel: 'STEP 1',
        cardId: 'shopping_bag',
        label: CORE_CARDS.shopping_bag.label,
        subtext: CORE_CARDS.shopping_bag.subtext,
        imageSrc: CORE_CARDS.shopping_bag.imageSrc,
      },
      {
        slotLabel: 'STEP 2',
        cardId: 'queue',
        label: CORE_CARDS.queue.label,
        subtext: CORE_CARDS.queue.subtext,
        imageSrc: CORE_CARDS.queue.imageSrc,
      },
      {
        slotLabel: 'STEP 3',
        label: 'Pay at shop',
        subtext: 'Pay and pack items into bag',
        imageSrc: '/symbols/shop.svg',
      },
      {
        slotLabel: 'STEP 4',
        cardId: 'home',
        label: CORE_CARDS.home.label,
        subtext: CORE_CARDS.home.subtext,
        imageSrc: CORE_CARDS.home.imageSrc,
      },
    ],
  },
  {
    id: 'pack_sensory_calm',
    area: 'Sensory & Calm Support',
    title: 'Sensory Overload & De-escalation Cards',
    summary:
      'High-contrast pocket cards for noisy environments, group events, and immediate pause signals.',
    formatLabel: 'Pocket Flashcard Set',
    cards: [
      {
        slotLabel: 'SIGNAL 1',
        cardId: 'stop',
        label: CORE_CARDS.stop.label,
        subtext: CORE_CARDS.stop.subtext,
        imageSrc: CORE_CARDS.stop.imageSrc,
      },
      {
        slotLabel: 'SIGNAL 2',
        cardId: 'quiet',
        label: CORE_CARDS.quiet.label,
        subtext: CORE_CARDS.quiet.subtext,
        imageSrc: CORE_CARDS.quiet.imageSrc,
      },
      {
        slotLabel: 'SIGNAL 3',
        cardId: 'ear_defenders',
        label: CORE_CARDS.ear_defenders.label,
        subtext: CORE_CARDS.ear_defenders.subtext,
        imageSrc: CORE_CARDS.ear_defenders.imageSrc,
      },
      {
        slotLabel: 'SIGNAL 4',
        cardId: 'wait',
        label: CORE_CARDS.wait.label,
        subtext: CORE_CARDS.wait.subtext,
        imageSrc: CORE_CARDS.wait.imageSrc,
      },
    ],
  },
  {
    id: 'pack_everyday_living',
    area: 'Everyday Living & Care',
    title: 'Daily Home Routine & Fresh Air Pack',
    summary:
      'Now / Next / Then visual structure for morning drinks, stepping outside, and personal care.',
    formatLabel: 'Now / Next / Then Strip',
    cards: [
      {
        slotLabel: 'NOW',
        cardId: 'tea',
        label: CORE_CARDS.tea.label,
        subtext: CORE_CARDS.tea.subtext,
        imageSrc: CORE_CARDS.tea.imageSrc,
      },
      {
        slotLabel: 'NEXT',
        label: 'Go Outside',
        subtext: 'Step outside for fresh air',
        imageSrc: '/symbols/outside.svg',
      },
      {
        slotLabel: 'THEN',
        cardId: 'toilet',
        label: CORE_CARDS.toilet.label,
        subtext: CORE_CARDS.toilet.subtext,
        imageSrc: CORE_CARDS.toilet.imageSrc,
      },
    ],
  },
  {
    id: 'pack_pantry_to_pot',
    area: 'Everyday Living & Care',
    title: 'Pantry to Pot: Independent Meal Prep',
    summary:
      'Step-by-step visual kitchen routine supporting choice, hygiene, and independent cooking without verbal overload.',
    formatLabel: '6-Step Kitchen Strip',
    cards: [
      {
        slotLabel: 'STEP 1',
        label: 'Wash Hands',
        subtext: 'Wash and dry hands before touching food',
        imageSrc: '/symbols/wash_hands_,_to.svg',
      },
      {
        slotLabel: 'STEP 2',
        label: 'Choose Food',
        subtext: 'Pick ingredients from the cupboard or fridge',
        imageSrc: '/symbols/food.svg',
      },
      {
        slotLabel: 'STEP 3',
        label: 'Prepare & Cook',
        subtext: 'Follow simple visual prep steps at own pace',
        imageSrc: '/symbols/cook_,_to.svg',
      },
      {
        slotLabel: 'STEP 4',
        cardId: 'hot_drink',
        label: CORE_CARDS.hot_drink.label,
        subtext: 'Pour a drink safely with staff nearby if needed',
        imageSrc: CORE_CARDS.hot_drink.imageSrc,
      },
      {
        slotLabel: 'STEP 5',
        label: 'Eat Meal',
        subtext: 'Sit comfortably and enjoy meal without rush',
        imageSrc: '/symbols/eat_,_to.svg',
      },
      {
        slotLabel: 'STEP 6',
        label: 'All Done / Tidy',
        subtext: 'Put plate away and wipe down counter',
        imageSrc: '/symbols/finish.svg',
      },
    ],
  },
  {
    id: 'pack_post_seizure_rest',
    area: 'Sensory & Calm Support',
    title: 'Post-Seizure Rest & Recovery Check-In',
    summary:
      'Low-demand visual reassurance and recovery steps following a seizure or acute health episode.',
    formatLabel: '4-Step Recovery Strip',
    cards: [
      {
        slotLabel: 'NOW',
        cardId: 'quiet',
        label: 'Safe & Quiet Rest',
        subtext: 'Lie down or sit in a quiet, dimly lit space',
        imageSrc: CORE_CARDS.quiet.imageSrc,
      },
      {
        slotLabel: 'STEP 2',
        label: 'Water / Sips',
        subtext: 'Small sips of water only when fully alert',
        imageSrc: '/symbols/water.svg',
      },
      {
        slotLabel: 'STEP 3',
        label: 'Medication Check',
        subtext: 'Check rescue or routine medication with staff',
        imageSrc: '/symbols/tablets.svg',
      },
      {
        slotLabel: 'NEXT',
        label: 'Sleep / Rest',
        subtext: 'Uninterrupted rest until feeling steady',
        imageSrc: '/symbols/sleep_female_,_to.svg',
      },
    ],
  },
  {
    id: 'pack_morning_autonomy',
    area: 'Routines & Transitions',
    title: 'Morning Autonomy & Open-Door Routine',
    summary:
      'Predictable self-directed morning steps respecting personal space, open-door choice, and pace.',
    formatLabel: '4-Step Morning Strip',
    cards: [
      {
        slotLabel: 'NOW',
        label: 'Wake Up & Stretch',
        subtext: 'Start the morning at your own unhurried pace',
        imageSrc: '/symbols/wake_up_,_to.svg',
      },
      {
        slotLabel: 'STEP 2',
        cardId: 'toilet',
        label: CORE_CARDS.toilet.label,
        subtext: 'Use bathroom and wash face',
        imageSrc: CORE_CARDS.toilet.imageSrc,
      },
      {
        slotLabel: 'STEP 3',
        label: 'Get Dressed',
        subtext: 'Choose clean clothes for the day',
        imageSrc: '/symbols/change_clothes_,_to.svg',
      },
      {
        slotLabel: 'NEXT',
        cardId: 'tea',
        label: 'Breakfast & Drink',
        subtext: 'Head to kitchen when ready',
        imageSrc: CORE_CARDS.tea.imageSrc,
      },
    ],
  }
];

export const COMMUNITY_PRESETS: Record<string, CommunityPreset> = {
  shops: {
    name: 'Going to the Shops',
    locationHint: 'Bag, walk steadily, queue calmly, pay, head home',
    steps: [
      {
        id: 'shop_1',
        label: CORE_CARDS.shopping_bag.label,
        actionInstruction: 'Pick up shopping bag and payment card before heading out.',
        imageSrc: CORE_CARDS.shopping_bag.imageSrc,
        imageAlt: CORE_CARDS.shopping_bag.label,
        coreCardId: 'shopping_bag',
      },
      {
        id: 'shop_2',
        label: 'Walk to Destination',
        actionInstruction: 'Walk at a steady, comfortable pace with support nearby.',
        imageSrc: '/symbols/walk_,_to.svg',
        imageAlt: 'Walk to Destination',
      },
      {
        id: 'shop_3',
        label: CORE_CARDS.queue.label,
        actionInstruction: 'Wait calmly in line—take a breath if the queue moves slowly.',
        imageSrc: CORE_CARDS.queue.imageSrc,
        imageAlt: CORE_CARDS.queue.label,
        coreCardId: 'queue',
        waitSeconds: 45,
      },
      {
        id: 'shop_4',
        label: CORE_CARDS.home.label,
        actionInstruction: 'Pack items away and head back home or to the minibus.',
        imageSrc: CORE_CARDS.home.imageSrc,
        imageAlt: CORE_CARDS.home.label,
        coreCardId: 'home',
      },
    ],
  },
  park: {
    name: 'Park & Fresh Air',
    locationHint: 'Step outside, walk at own pace, warm drink pause, return',
    steps: [
      {
        id: 'park_1',
        label: 'Go outside',
        actionInstruction: 'Step outside for fresh air and walk along the path at your own pace.',
        imageSrc: '/symbols/outside.svg',
        imageAlt: 'Go outside',
      },
      {
        id: 'park_2',
        label: CORE_CARDS.hot_drink.label,
        actionInstruction: 'Sit on a bench, rest your legs, and enjoy a warm drink.',
        imageSrc: CORE_CARDS.hot_drink.imageSrc,
        imageAlt: CORE_CARDS.hot_drink.label,
        coreCardId: 'hot_drink',
        waitSeconds: 60,
      },
      {
        id: 'park_3',
        label: CORE_CARDS.home.label,
        actionInstruction: 'Finish your drink and head back when ready.',
        imageSrc: CORE_CARDS.home.imageSrc,
        imageAlt: CORE_CARDS.home.label,
        coreCardId: 'home',
      },
    ],
  },
  disco: {
    name: 'Bamber Bridge Disco / Group',
    locationHint: 'Ear defenders, music/group time, quiet reset, head home',
    steps: [
      {
        id: 'disco_1',
        label: CORE_CARDS.ear_defenders.label,
        actionInstruction: 'Put on ear defenders or ear muffs before entering noisy music.',
        imageSrc: CORE_CARDS.ear_defenders.imageSrc,
        imageAlt: CORE_CARDS.ear_defenders.label,
        coreCardId: 'ear_defenders',
      },
      {
        id: 'disco_2',
        label: 'Music & group time',
        actionInstruction: 'Join in with music or sit calmly with support staff.',
        imageSrc: '/symbols/drum.svg',
        imageAlt: 'Music and group',
      },
      {
        id: 'disco_3',
        label: CORE_CARDS.quiet.label,
        actionInstruction: 'Step into a quiet corner for a calm sensory break.',
        imageSrc: CORE_CARDS.quiet.imageSrc,
        imageAlt: CORE_CARDS.quiet.label,
        coreCardId: 'quiet',
        waitSeconds: 60,
      },
      {
        id: 'disco_4',
        label: CORE_CARDS.home.label,
        actionInstruction: 'Head back home calmly when the session finishes or earlier if needed.',
        imageSrc: CORE_CARDS.home.imageSrc,
        imageAlt: CORE_CARDS.home.label,
        coreCardId: 'home',
      },
    ],
  },
  swimming: {
    name: 'Swimming Session',
    locationHint: 'Swimwear ready, pool session, warm drink after',
    steps: [
      {
        id: 'swim_1',
        label: 'Swimwear ready',
        actionInstruction: 'Get changed into swimwear and check towel and bag.',
        imageSrc: '/symbols/swimming_costume.svg',
        imageAlt: 'Swimwear',
      },
      {
        id: 'swim_2',
        label: 'Swimming session',
        actionInstruction: 'Enter the water carefully and swim at your own pace.',
        imageSrc: '/symbols/swimming_class.svg',
        imageAlt: 'Swimming',
        waitSeconds: 60,
      },
      {
        id: 'swim_3',
        label: CORE_CARDS.hot_drink.label,
        actionInstruction: 'Dry off, get dressed into dry clothes, and have a warm drink.',
        imageSrc: CORE_CARDS.hot_drink.imageSrc,
        imageAlt: CORE_CARDS.hot_drink.label,
        coreCardId: 'hot_drink',
      },
    ],
  },
  sensory_reset: {
    name: 'Sensory Calm Reset',
    locationHint: 'Stop & pause, quiet space timer, ear protection check',
    steps: [
      {
        id: 'calm_step_1',
        label: CORE_CARDS.stop.label,
        actionInstruction: 'Pause what you are doing and lower demands right now.',
        imageSrc: CORE_CARDS.stop.imageSrc,
        imageAlt: CORE_CARDS.stop.label,
        coreCardId: 'stop',
      },
      {
        id: 'calm_step_2',
        label: CORE_CARDS.quiet.label,
        actionInstruction: 'Move to a quiet room or low-noise spot for a timed reset.',
        imageSrc: CORE_CARDS.quiet.imageSrc,
        imageAlt: CORE_CARDS.quiet.label,
        coreCardId: 'quiet',
        waitSeconds: 60,
      },
      {
        id: 'calm_step_3',
        label: 'Ear Muffs',
        actionInstruction: 'Use ear muffs if voices or background sounds still feel sharp.',
        imageSrc: '/symbols/ear_muffs.svg',
        imageAlt: 'Ear Muffs',
      },
      {
        id: 'calm_step_4',
        label: CORE_CARDS.hot_drink.label,
        actionInstruction: 'Once settled, have a drink or choose your next calm step.',
        imageSrc: CORE_CARDS.hot_drink.imageSrc,
        imageAlt: CORE_CARDS.hot_drink.label,
        coreCardId: 'hot_drink',
      },
    ],
  },
};

export const WANTS_BOARD_ITEMS: QuickCard[] = [
  {
    id: 'want_tea',
    title: CORE_CARDS.tea.label,
    actionText: CORE_CARDS.tea.subtext,
    keywords: ['tea'],
    imageSrc: CORE_CARDS.tea.imageSrc,
    coreCardId: 'tea',
  },
  {
    id: 'want_hot_drink',
    title: CORE_CARDS.hot_drink.label,
    actionText: CORE_CARDS.hot_drink.subtext,
    keywords: ['drink'],
    imageSrc: CORE_CARDS.hot_drink.imageSrc,
    coreCardId: 'hot_drink',
  },
  {
    id: 'want_toilet',
    title: CORE_CARDS.toilet.label,
    actionText: CORE_CARDS.toilet.subtext,
    keywords: ['toilet'],
    imageSrc: CORE_CARDS.toilet.imageSrc,
    coreCardId: 'toilet',
  },
  {
    id: 'want_quiet',
    title: CORE_CARDS.quiet.label,
    actionText: CORE_CARDS.quiet.subtext,
    keywords: ['quiet'],
    imageSrc: CORE_CARDS.quiet.imageSrc,
    coreCardId: 'quiet',
  },
  {
    id: 'want_ear_defenders',
    title: CORE_CARDS.ear_defenders.label,
    actionText: CORE_CARDS.ear_defenders.subtext,
    keywords: ['listen'],
    imageSrc: CORE_CARDS.ear_defenders.imageSrc,
    coreCardId: 'ear_defenders',
  },
  {
    id: 'want_home',
    title: CORE_CARDS.home.label,
    actionText: CORE_CARDS.home.subtext,
    keywords: ['home'],
    imageSrc: CORE_CARDS.home.imageSrc,
    coreCardId: 'home',
  },
  {
    id: 'want_outside',
    title: 'Go Outside',
    actionText: 'Step outside for fresh air',
    keywords: ['outside'],
    imageSrc: '/symbols/outside.svg',
  },
  {
    id: 'want_shop',
    title: 'Go to Shop',
    actionText: 'Visit local shop',
    keywords: ['shop'],
    imageSrc: '/symbols/open_shop.svg',
  },
  {
    id: 'want_walk',
    title: 'Go for a Walk',
    actionText: 'Walk at your own pace',
    keywords: ['walk'],
    imageSrc: '/symbols/walk_,_to.svg',
  },
  {
    id: 'want_tablets',
    title: 'Tablets / Medication',
    actionText: 'Support with medication routine',
    keywords: ['tablets'],
    imageSrc: '/symbols/tablets.svg',
  },
  {
    id: 'want_wash_hands',
    title: 'Wash Hands',
    actionText: 'Go wash and dry hands',
    keywords: ['wash'],
    imageSrc: '/symbols/wash_hands_,_to.svg',
  },
  {
    id: 'want_ear_muffs',
    title: 'Ear Muffs',
    actionText: 'Lower loud background noise',
    keywords: ['ear'],
    imageSrc: '/symbols/ear_muffs.svg',
  },
  {
    id: 'want_food',
    title: 'Something to Eat',
    actionText: 'Choose a snack or meal',
    keywords: ['food', 'eat', 'hungry'],
    imageSrc: '/symbols/food.svg',
  },
  {
    id: 'want_water',
    title: 'Glass of Water',
    actionText: 'Have a cold drink of water',
    keywords: ['water', 'drink'],
    imageSrc: '/symbols/water.svg',
  },
  {
    id: 'want_sleep',
    title: 'Rest / Lie Down',
    actionText: 'Take a quiet rest in bedroom',
    keywords: ['sleep', 'rest', 'tired'],
    imageSrc: '/symbols/sleep_female_,_to.svg',
  },
  {
    id: 'want_music',
    title: 'Listen to Music',
    actionText: 'Put on favourite music or headphones',
    keywords: ['music', 'listen'],
    imageSrc: '/symbols/music.svg',
  },
  {
    id: 'want_finished',
    title: 'Finished / All Done',
    actionText: 'Signal that an activity is complete',
    keywords: ['finished', 'done', 'stop'],
    imageSrc: '/symbols/finish.svg',
  },
  {
    id: 'want_pain',
    title: 'Unwell / In Pain',
    actionText: 'Let support staff know something hurts',
    keywords: ['pain', 'sick', 'doctor'],
    imageSrc: '/symbols/back_ache.svg',
  }
];
