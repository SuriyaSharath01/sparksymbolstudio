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


  morning_care_hydration: {
    id: 'morning_care_hydration',
    title: 'Morning Care, Hydration & Medication Check',
    category: 'Routines & Transitions',
    sector: 'Adult Social Care',
    layout: 'vertical-strip',
    steps: [
      {
        id: 'morn_1',
        label: 'Wake, Stretch & Morning Greeting',
        symbol: '/symbols/wake.svg',
        instruction: 'Open curtains gently, offer a calm greeting, and check comfort before rising.',
      },
      {
        id: 'morn_2',
        label: 'Water, Tea & Breakfast',
        symbol: '/symbols/drink.svg',
        instruction: 'Support morning hydration and preferred breakfast or dietary choice.',
      },
      {
        id: 'morn_3',
        label: 'Medication & Daily Plan',
        symbol: '/symbols/medicine.svg',
        instruction: 'Administer prescribed morning medication safely and review the day ahead.',
      },
    ],
  },

  faith_diet_reflection: {
    id: 'faith_diet_reflection',
    title: 'Faith, Dietary & Cultural Customs',
    category: 'Communication & Interaction',
    sector: 'Dual-Language / EAL',
    languages: ['English', 'Hindi (हिन्दी)', 'Christianity', 'Islam', 'Hinduism', 'Buddhism', 'Sikhism', 'Jainism'],
    layout: 'horizontal-strip',
    steps: [
      {
        id: 'faith_1',
        label: 'Dietary & Fasting Preferences / आहार और व्रत',
        symbol: '/symbols/food.svg',
        instruction: 'Record vegetarian, halal, fasting, or special meal rules clearly across shifts.',
      },
      {
        id: 'faith_2',
        label: 'Prayer & Quiet Time / प्रार्थना और शांति',
        symbol: '/symbols/quiet.svg',
        instruction: 'Protect scheduled prayer windows, festivals, or quiet reflection without rushing.',
      },
      {
        id: 'faith_3',
        label: 'Respectful Family & Community Links / सम्मान और जुड़ाव',
        symbol: '/symbols/community.svg',
        instruction: 'Support meaningful cultural visits, music, and familiar symbols with dignity.',
      },
    ],
  },


  shift_handover_review: {
    id: 'shift_handover_review',
    title: 'Shift Handover & Care Review Check',
    category: 'Communication & Interaction',
    sector: 'Adult Social Care',
    layout: 'vertical-strip',
    steps: [
      {
        id: 'sh_1',
        label: 'Current Mood & Comfort',
        symbol: '/symbols/feelings.svg',
        instruction: 'Confirm how the person is feeling, resting, or engaging at handover.',
      },
      {
        id: 'sh_2',
        label: 'Key Support & Safety Notes',
        symbol: '/symbols/note.svg',
        instruction: 'Highlight active routines, sensory triggers, and non-PII support adjustments.',
      },
      {
        id: 'sh_3',
        label: 'Next Planned Activity',
        symbol: '/symbols/next.svg',
        instruction: 'Agree the immediate next step for the incoming support lead or team.',
      },
    ],
  },


  community_safe_travel: {
    id: 'community_safe_travel',
    title: 'Community Outing & Safe Travel',
    category: 'Routines & Transitions',
    sector: 'Adult Social Care',
    layout: 'horizontal-strip',
    steps: [
      {
        id: 'trv_1',
        label: 'Check Essentials & Weather',
        symbol: '/symbols/bag.svg',
        instruction: 'Confirm coat, water, ID/emergency card, and communication board before leaving.',
      },
      {
        id: 'trv_2',
        label: 'Stay Together & Calm Pace',
        symbol: '/symbols/walk.svg',
        instruction: 'Keep clear visual cues at crossings, transport stops, and busy venues.',
      },
      {
        id: 'trv_3',
        label: 'Safe Return & Debrief',
        coreCardId: 'quiet',
        symbol: CORE_CARDS.quiet.imageSrc,
        instruction: 'Offer wind-down time on return and note how the outing went.',
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
  pecs_core_request_binder: {
    id: 'pecs_core_request_binder',
    title: 'PECS Phase I–IV Core Request Binder',
    category: 'Communication & Interaction',
    sector: 'SEND Education',
    layout: 'horizontal-strip',
    steps: [
      { id: 'pecs_1', label: 'I want', symbol: '/symbols/spark_want.svg', instruction: 'Place I want at the start of the PECS sentence strip.' },
      { id: 'pecs_2', label: 'More', symbol: '/symbols/more.svg', instruction: 'Request continuation of a preferred activity or snack.' },
      { id: 'pecs_3', label: 'Help', symbol: '/symbols/spark_help.svg', instruction: 'Exchange Help card when stuck or needing assistance.' },
      { id: 'pecs_4', label: 'Finished', symbol: '/symbols/finish.svg', instruction: 'Signal clearly when an activity is complete.' },
    ],
  },
  nhs_hospital_passport: {
    id: 'nhs_hospital_passport',
    title: 'NHS Hospital Passport & Pain Check-In',
    category: 'Sensory & Physical',
    sector: 'NHS & Health',
    layout: 'horizontal-strip',
    steps: [
      { id: 'nhs_1', label: 'Hospital Passport', symbol: '/symbols/spark_hospital_passport.svg', instruction: 'Share key communication and reasonable adjustments on arrival.' },
      { id: 'nhs_2', label: 'Pain / Hurt', symbol: '/symbols/spark_pain_scale.svg', instruction: 'Indicate pain or physical discomfort immediately.' },
      { id: 'nhs_3', label: 'Medication', symbol: '/symbols/spark_medication_round.svg', instruction: 'Check prescribed medication and pain relief options.' },
      { id: 'nhs_4', label: 'Doctor / Nurse', symbol: '/symbols/doctor_1a.svg', instruction: 'Request a clinician using clear, accessible language.' },
    ],
  },
  iddsi_mealtime_pack: {
    id: 'iddsi_mealtime_pack',
    title: 'IDDSI Dysphagia & Safe Mealtime Strip',
    category: 'Routines & Transitions',
    sector: 'Adult Social Care',
    layout: 'horizontal-strip',
    steps: [
      { id: 'iddsi_1', label: 'IDDSI Meal', symbol: '/symbols/spark_iddsi_meal.svg', instruction: 'Confirm texture-modified meal level before serving.' },
      { id: 'iddsi_2', label: 'Safe Drink', symbol: '/symbols/drink.svg', instruction: 'Offer thickened or regular fluids as prescribed.' },
      { id: 'iddsi_3', label: 'Eat Slowly', symbol: '/symbols/eat_,_to.svg', instruction: 'Support calm, unhurried pacing during meals.' },
      { id: 'iddsi_4', label: 'All Done', symbol: '/symbols/finish.svg', instruction: 'Respect when the resident signals they have had enough.' },
    ],
  },
  mental_capacity_consent_pack: {
    id: 'mental_capacity_consent_pack',
    title: 'Supported Decision-Making & Consent',
    category: 'Communication & Interaction',
    sector: 'Adult Social Care',
    layout: 'horizontal-strip',
    steps: [
      { id: 'mca_1', label: 'My Choice', symbol: '/symbols/spark_consent_choice.svg', instruction: 'Present options clearly in line with Mental Capacity Act principles.' },
      { id: 'mca_2', label: 'Yes, I Agree', symbol: '/symbols/yes.svg', instruction: 'Record clear affirmative consent.' },
      { id: 'mca_3', label: 'No Thank You', symbol: '/symbols/no.svg', instruction: 'Respect the right to decline or pause.' },
      { id: 'mca_4', label: 'Explain More', symbol: '/symbols/wait_,_to.svg', instruction: 'Provide accessible information before deciding.' },
    ],
  },
};

export const RESOURCE_REGISTRY_LIST: SupportPack[] = Object.values(RESOURCE_REGISTRY);
