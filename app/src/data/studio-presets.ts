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
        imageSrc: '/symbols/spark-core/quiet_break.svg',
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
  },
  {
    id: 'pecs_phase_1_4_binder',
    area: 'Communication & Choice',
    title: 'PECS Phase I–IV Core Request Binder',
    summary: 'Essential PECS sentence starters and high-frequency core requests for Velcro communication books.',
    formatLabel: 'PECS Core Binder • 8 Cells',
    cards: [
      { slotLabel: 'STARTER 1', label: 'I want', subtext: 'Sentence strip starter', imageSrc: '/symbols/spark_want.svg' },
      { slotLabel: 'CORE 2', label: 'More', subtext: 'Request continuation', imageSrc: '/symbols/more.svg' },
      { slotLabel: 'CORE 3', label: 'Help', subtext: 'Ask staff for support', imageSrc: '/symbols/spark-core/help.svg' },
      { slotLabel: 'CORE 4', label: 'Finished', subtext: 'All done / stop', imageSrc: '/symbols/finish.svg' },
      { slotLabel: 'RESPONSE 5', label: 'Yes', subtext: 'Confirm choice', imageSrc: '/symbols/spark-core/yes.svg' },
      { slotLabel: 'RESPONSE 6', label: 'No', subtext: 'Decline politely', imageSrc: '/symbols/spark-core/no.svg' },
      { slotLabel: 'NEED 7', label: 'Toilet', subtext: 'Bathroom break', imageSrc: '/symbols/toilet.svg' },
      { slotLabel: 'NEED 8', label: 'Break', subtext: 'Quiet pause time', imageSrc: '/symbols/spark-core/quiet_break.svg' },
    ],
  },
  {
    id: 'pecs_feelings_commenting',
    area: 'Communication & Choice',
    title: 'PECS Phase VI Emotions & Commenting Strip',
    summary: 'Support emotional literacy, mood check-ins, and self-advocacy across shifts.',
    formatLabel: 'Feelings Board • 6 Cells',
    cards: [
      { slotLabel: 'EMOTION 1', label: 'Happy', subtext: 'Feeling good and settled', imageSrc: '/symbols/happy_lady.svg' },
      { slotLabel: 'EMOTION 2', label: 'Sad', subtext: 'Feeling low or upset', imageSrc: '/symbols/sad_lady.svg' },
      { slotLabel: 'EMOTION 3', label: 'Angry', subtext: 'Feeling cross or frustrated', imageSrc: '/symbols/angry_lady.svg' },
      { slotLabel: 'EMOTION 4', label: 'Worried', subtext: 'Anxious or unsure', imageSrc: '/symbols/worried_lady.svg' },
      { slotLabel: 'EMOTION 5', label: 'Tired', subtext: 'Need rest or sleep', imageSrc: '/symbols/retired.svg' },
      { slotLabel: 'EMOTION 6', label: 'In Pain', subtext: 'Something hurts', imageSrc: '/symbols/spark_pain_scale.svg' },
    ],
  },
  {
    id: 'nhs_hospital_passport_pack',
    area: 'Everyday Living & Care',
    title: 'NHS Hospital Passport & Urgent Care Pack',
    summary: 'Bedside communication board for A&E, inpatient wards, and ambulance handovers (NHS AIS compliant).',
    formatLabel: 'NHS Clinical • 6 Cells',
    cards: [
      { slotLabel: 'CLINICAL 1', label: 'Hospital Passport', subtext: 'Read my care preferences', imageSrc: '/symbols/spark-core/hospital_passport.svg' },
      { slotLabel: 'CLINICAL 2', label: 'Pain / Hurt', subtext: 'Show where it hurts', imageSrc: '/symbols/spark_pain_scale.svg' },
      { slotLabel: 'CLINICAL 3', label: 'Doctor / Nurse', subtext: 'Speak with clinician', imageSrc: '/symbols/spark-core/doctor.svg' },
      { slotLabel: 'CLINICAL 4', label: 'Medication', subtext: 'Tablets & pain relief', imageSrc: '/symbols/spark_medication_round.svg' },
      { slotLabel: 'CLINICAL 5', label: 'Water / Drink', subtext: 'Thirsty or dry mouth', imageSrc: '/symbols/drink.svg' },
      { slotLabel: 'CLINICAL 6', label: 'Call Family', subtext: 'Contact next of kin', imageSrc: '/symbols/mobile_phone.svg' },
    ],
  },
  {
    id: 'body_pain_location_map',
    area: 'Everyday Living & Care',
    title: 'Body & Pain Location Check-In',
    summary: 'Help non-verbal residents pinpoint pain or discomfort quickly without distress.',
    formatLabel: 'Health Check • 6 Cells',
    cards: [
      { slotLabel: 'SYMPTOM 1', label: 'Headache', subtext: 'Pain in head', imageSrc: '/symbols/headache.svg' },
      { slotLabel: 'SYMPTOM 2', label: 'Toothache', subtext: 'Mouth or dental pain', imageSrc: '/symbols/toothache.svg' },
      { slotLabel: 'SYMPTOM 3', label: 'Tummy Ache', subtext: 'Stomach discomfort', imageSrc: '/symbols/stomach_ache.svg' },
      { slotLabel: 'SYMPTOM 4', label: 'Back Pain', subtext: 'Lower or upper back', imageSrc: '/symbols/back_ache.svg' },
      { slotLabel: 'SYMPTOM 5', label: 'Earache', subtext: 'Ear discomfort', imageSrc: '/symbols/ear.svg' },
      { slotLabel: 'SYMPTOM 6', label: 'Feeling Hot / Fever', subtext: 'Check temperature', imageSrc: '/symbols/thermometer.svg' },
    ],
  },
  {
    id: 'iddsi_mealtime_nutrition',
    area: 'Everyday Living & Care',
    title: 'IDDSI Mealtime & Hydration Support',
    summary: 'Clear visual support for dysphagia-safe meals, thickened fluids, and mealtime dignity.',
    formatLabel: 'Nutrition & SALT • 6 Cells',
    cards: [
      { slotLabel: 'MEAL 1', label: 'IDDSI Prepared Meal', subtext: 'Texture-modified dish', imageSrc: '/symbols/spark_iddsi_meal.svg' },
      { slotLabel: 'MEAL 2', label: 'Water / Drink', subtext: 'Safe hydration cup', imageSrc: '/symbols/drink.svg' },
      { slotLabel: 'MEAL 3', label: 'Hot Tea', subtext: 'Warm cuppa', imageSrc: '/symbols/drink_hot.svg' },
      { slotLabel: 'MEAL 4', label: 'Eat Slowly', subtext: 'Safe pacing prompt', imageSrc: '/symbols/eat_,_to.svg' },
      { slotLabel: 'MEAL 5', label: 'More Please', subtext: 'Request second portion', imageSrc: '/symbols/more.svg' },
      { slotLabel: 'MEAL 6', label: 'Finished Eating', subtext: 'Full and all done', imageSrc: '/symbols/finish.svg' },
    ],
  },
  {
    id: 'mental_capacity_consent',
    area: 'Communication & Choice',
    title: 'Supported Decision-Making & Consent',
    summary: 'CQC Reg. 11 & Mental Capacity Act visual prompts empowering residents to give or withhold consent.',
    formatLabel: 'CQC Reg. 11 • 6 Cells',
    cards: [
      { slotLabel: 'RIGHT 1', label: 'My Choice', subtext: 'Decide for myself', imageSrc: '/symbols/spark_consent_choice.svg' },
      { slotLabel: 'RIGHT 2', label: 'Yes, I Agree', subtext: 'Happy to go ahead', imageSrc: '/symbols/yesterday.svg' },
      { slotLabel: 'RIGHT 3', label: 'No Thank You', subtext: 'I do not want this', imageSrc: '/symbols/now.svg' },
      { slotLabel: 'RIGHT 4', label: 'Wait / Explain', subtext: 'Tell me more first', imageSrc: '/symbols/wait_,_to.svg' },
      { slotLabel: 'RIGHT 5', label: 'Ask Family / Advocate', subtext: 'Support with decision', imageSrc: '/symbols/spark-core/help.svg' },
      { slotLabel: 'RIGHT 6', label: 'Take My Time', subtext: 'No rush to decide', imageSrc: '/symbols/spark-core/quiet_break.svg' },
    ],
  },
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
    imageSrc: '/symbols/spark-core/quiet_break.svg',
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
