import type { MulberrySymbol } from '../data/symbols';
import type { AudienceLens } from '../context/AudienceLensContext';

export type GrammarOverlay = 'none' | 'negation' | 'question' | 'past' | 'future' | 'plural';
export type SemanticTone = 'who' | 'doing' | 'what' | 'where' | 'describing' | 'social';

export interface ParsedSegment {
  raw: string;
  clean: string;
  lower: string;
  isPhrase: boolean;
  isRedactedToken: boolean;
}

export const SMALL_FILLER_WORDS = new Set([
  'a', 'an', 'the', 'of', 'to', 'in', 'on', 'at', 'for', 'by', 'with',
  'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
  'will', 'shall', 'would', 'could', 'should', 'can', 'may', 'might',
  'that', 'this', 'these', 'those', 'it', 'its', 'as', 'from', 'into',
  'and', 'or', 'but', 'if', 'so', 'than', 'very', 'just', 'about', 'any',
]);

const WHO_WORDS = new Set([
  'i', 'me', 'my', 'mine', 'you', 'your', 'we', 'us', 'our', 'he', 'him', 'she', 'her', 'they', 'them',
  'staff', 'carer', 'doctor', 'gp', 'nurse', 'dentist', 'teacher', 'mum', 'dad', 'family', 'friend', 'resident', 'person', 'people', 'everyone',
]);

const DOING_WORDS = new Set([
  'want', 'need', 'help', 'go', 'going', 'going to', 'walk', 'eat', 'eating', 'drink', 'drinking',
  'wash', 'wash hands', 'brush', 'brush teeth', 'sit', 'stand', 'sleep', 'rest', 'relax', 'wait',
  'stop', 'listen', 'talk', 'speak', 'tell', 'ask', 'explain', 'decide', 'agree', 'decline',
  'take', 'have', 'bring', 'feel', 'feeling', 'read', 'write', 'look', 'see', 'choose', 'play', 'breathe', 'focus', 'order', 'pay',
]);

const WHERE_WORDS = new Set([
  'home', 'house', 'school', 'classroom', 'college', 'work', 'cafe', 'café', 'shop', 'park',
  'hospital', 'clinic', 'surgery', 'toilet', 'loo', 'bathroom', 'bedroom', 'kitchen', 'garden',
  'room', 'sensory room', 'quiet space', 'outside', 'inside', 'bus', 'train',
]);

const DESCRIBING_WORDS = new Set([
  'happy', 'sad', 'angry', 'worried', 'anxious', 'scared', 'overwhelmed', 'calm', 'quiet', 'loud',
  'hot', 'cold', 'tired', 'sore', 'pain', 'hurt', 'unwell', 'sick', 'safe', 'slowly', 'good', 'bad',
  'ready', 'finished', 'done', 'more', 'soft', 'pureed', 'upright', 'before', 'after', 'first', 'next', 'then', 'now', 'later', 'today', 'tomorrow',
]);

export function classifySemanticTone(phraseOrWord: string): SemanticTone {
  const w = phraseOrWord.toLowerCase().trim();
  if (WHO_WORDS.has(w)) return 'who';
  if (DOING_WORDS.has(w)) return 'doing';
  if (WHERE_WORDS.has(w)) return 'where';
  if (DESCRIBING_WORDS.has(w)) return 'describing';
  if (['yes', 'no', 'not', "don't", 'please', 'thank', 'thanks', 'hello', 'hi', 'bye', 'sorry'].includes(w)) {
    return 'social';
  }
  return 'what';
}

export function toneUnderlineClasses(tone: SemanticTone, colourful: boolean): string {
  if (!colourful) return 'bg-transparent';
  switch (tone) {
    case 'who':
      return 'bg-amber-400';
    case 'doing':
      return 'bg-emerald-500';
    case 'what':
      return 'bg-orange-400';
    case 'where':
      return 'bg-sky-500';
    case 'describing':
      return 'bg-purple-400';
    case 'social':
      return 'bg-pink-400';
  }
}

export function toneBorderClasses(tone: SemanticTone, colourful: boolean): string {
  if (!colourful) return 'border-slate-200 bg-white';
  switch (tone) {
    case 'who':
      return 'border-amber-400 bg-amber-50/40';
    case 'doing':
      return 'border-emerald-500 bg-emerald-50/40';
    case 'what':
      return 'border-orange-400 bg-orange-50/40';
    case 'where':
      return 'border-sky-500 bg-sky-50/40';
    case 'describing':
      return 'border-purple-400 bg-purple-50/40';
    case 'social':
      return 'border-pink-400 bg-pink-50/40';
  }
}

// ---------------------------------------------------------------------------
// 1. LOCKED 360° PHRASE DICTIONARY (Verified paths only — matched BEFORE words)
// ---------------------------------------------------------------------------
const LOCKED_PHRASES: Record<string, { svgPath: string; label: string }> = {
  'cup of tea': { svgPath: '/symbols/spark_cup_of_tea.svg', label: 'Cup of Tea' },
  'hospital passport': { svgPath: '/symbols/spark_hospital_passport.svg', label: 'Hospital Passport' },
  'quiet break': { svgPath: '/symbols/break_time_1.svg', label: 'Quiet Break' },
  'take a break': { svgPath: '/symbols/break_time_1.svg', label: 'Take a Break' },
  'sensory room': { svgPath: '/symbols/spark_sensory_room.svg', label: 'Sensory Room' },
  'quiet space': { svgPath: '/symbols/spark_sensory_room.svg', label: 'Quiet Space' },
  'ear defenders': { svgPath: '/symbols/spark_ear_defenders.svg', label: 'Ear Defenders' },
  'wash hands': { svgPath: '/symbols/wash_hands_,_to.svg', label: 'Wash Hands' },
  'wash your hands': { svgPath: '/symbols/wash_hands_,_to.svg', label: 'Wash Your Hands' },
  'brush teeth': { svgPath: '/symbols/toothbrush.svg', label: 'Brush Teeth' },
  'brush your teeth': { svgPath: '/symbols/toothbrush.svg', label: 'Brush Your Teeth' },
  'going to': { svgPath: '/symbols/go_,_to.svg', label: 'Going To' },
  'rescue medication': { svgPath: '/symbols/spark_medication_round.svg', label: 'Rescue Medication' },
  'recovery position': { svgPath: '/symbols/spark_epilepsy_safety.svg', label: 'Recovery Position' },
  'epilepsy plan': { svgPath: '/symbols/spark_epilepsy_safety.svg', label: 'Epilepsy Plan' },
  'iddsi meal': { svgPath: '/symbols/spark_iddsi_meal.svg', label: 'IDDSI Meal' },
  'my choice': { svgPath: '/symbols/spark_consent_choice.svg', label: 'My Choice' },
  'good morning': { svgPath: '/symbols/happy_lady.svg', label: 'Good Morning' },
  'school bag': { svgPath: '/symbols/school_bag.svg', label: 'School Bag' },
  'packed lunch': { svgPath: '/symbols/packed_lunch.svg', label: 'Packed Lunch' },
  'deep breath': { svgPath: '/symbols/spark_calm.svg', label: 'Deep Breath' },
  'too loud': { svgPath: '/symbols/spark_ear_defenders.svg', label: 'Too Loud' },
  'ask for help': { svgPath: '/symbols/spark_help.svg', label: 'Ask for Help' },
  'call 999': { svgPath: '/symbols/mobile_phone.svg', label: 'Call 999' },
};

const SORTED_PHRASES = Object.keys(LOCKED_PHRASES).sort((a, b) => b.length - a.length);
const ESCAPED_PHRASES = SORTED_PHRASES.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');

// Inline regex: matches [REDACTED] tokens, OR whole multi-word phrases (\b...\b), OR individual words with attached punctuation
const LINE_TOKENISER_REGEX = new RegExp(
  `(\\[[A-Z_]+\\]|\\b(?:${ESCAPED_PHRASES})\\b[.,!?;:]?|\\S+)`,
  'gi'
);

export function tokeniseLineWithPhrases(line: string): ParsedSegment[] {
  const matches = line.match(LINE_TOKENISER_REGEX) || [];
  return matches.map((raw) => {
    const isRedactedToken = /^\[[A-Z_]+\]$/.test(raw);
    const clean = isRedactedToken ? raw : raw.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');
    const lower = clean.toLowerCase();
    const isPhrase = !isRedactedToken && Boolean(LOCKED_PHRASES[lower]);
    return { raw, clean, lower, isPhrase, isRedactedToken };
  });
}

// ---------------------------------------------------------------------------
// 2. LOCKED 360° CORE WORD DICTIONARY (Verified files — zero guesswork)
// ---------------------------------------------------------------------------
const CORE_VERIFIED_WORDS: Record<string, { svgPath: string; label: string }> = {
  // Pronouns & Core AAC
  i: { svgPath: '/symbols/I.svg', label: 'I' },
  me: { svgPath: '/symbols/I.svg', label: 'Me' },
  my: { svgPath: '/symbols/I.svg', label: 'My' },
  you: { svgPath: '/symbols/spark_you.svg', label: 'You' },
  your: { svgPath: '/symbols/spark_you.svg', label: 'Your' },
  we: { svgPath: '/symbols/spark_we.svg', label: 'We' },
  us: { svgPath: '/symbols/spark_we.svg', label: 'Us' },
  our: { svgPath: '/symbols/spark_we.svg', label: 'Our' },
  together: { svgPath: '/symbols/spark_we.svg', label: 'Together' },
  yes: { svgPath: '/symbols/spark_yes.svg', label: 'Yes' },
  agree: { svgPath: '/symbols/spark_yes.svg', label: 'Agree' },
  no: { svgPath: '/symbols/spark_no.svg', label: 'No' },
  not: { svgPath: '/symbols/spark_no.svg', label: 'Not' },
  dont: { svgPath: '/symbols/spark_no.svg', label: "Don't" },
  decline: { svgPath: '/symbols/spark_no.svg', label: 'Decline' },

  // Sequence & Time
  first: { svgPath: '/symbols/first.svg', label: 'First' },
  now: { svgPath: '/symbols/now.svg', label: 'Now' },
  next: { svgPath: '/symbols/next.svg', label: 'Next' },
  then: { svgPath: '/symbols/spark_then.svg', label: 'Then' },
  later: { svgPath: '/symbols/spark_then.svg', label: 'Later' },
  time: { svgPath: '/symbols/clock.svg', label: 'Time' },
  clock: { svgPath: '/symbols/clock.svg', label: 'Clock' },
  wait: { svgPath: '/symbols/wait_,_to.svg', label: 'Wait' },
  stop: { svgPath: '/symbols/stop_sign.svg', label: 'Stop' },
  finish: { svgPath: '/symbols/finish.svg', label: 'Finish' },
  finished: { svgPath: '/symbols/finish.svg', label: 'Finished' },
  done: { svgPath: '/symbols/finish.svg', label: 'Done' },

  // Core Actions
  want: { svgPath: '/symbols/spark_want.svg', label: 'I want' },
  wants: { svgPath: '/symbols/spark_want.svg', label: 'I want' },
  need: { svgPath: '/symbols/spark_want.svg', label: 'Need' },
  help: { svgPath: '/symbols/spark_help.svg', label: 'Help' },
  support: { svgPath: '/symbols/spark_help.svg', label: 'Support' },
  staff: { svgPath: '/symbols/spark_help.svg', label: 'Staff' },
  carer: { svgPath: '/symbols/spark_help.svg', label: 'Carer' },
  have: { svgPath: '/symbols/spark_have.svg', label: 'Have' },
  get: { svgPath: '/symbols/spark_have.svg', label: 'Get' },
  go: { svgPath: '/symbols/go_,_to.svg', label: 'Go' },
  going: { svgPath: '/symbols/go_,_to.svg', label: 'Going' },
  walk: { svgPath: '/symbols/walk_,_to.svg', label: 'Walk' },
  sit: { svgPath: '/symbols/sit_,_to.svg', label: 'Sit' },
  upright: { svgPath: '/symbols/sit_,_to.svg', label: 'Sit Upright' },
  see: { svgPath: '/symbols/look_,_to.svg', label: 'See' },
  look: { svgPath: '/symbols/look_,_to.svg', label: 'Look' },
  listen: { svgPath: '/symbols/communication_aid_listen_to_me.svg', label: 'Listen' },
  ask: { svgPath: '/symbols/ask_,_to.svg', label: 'Ask' },
  bring: { svgPath: '/symbols/bring_,_to.svg', label: 'Bring' },
  wash: { svgPath: '/symbols/wash_hands_,_to.svg', label: 'Wash' },
  brush: { svgPath: '/symbols/toothbrush.svg', label: 'Brush' },
  teeth: { svgPath: '/symbols/toothbrush.svg', label: 'Teeth' },
  eat: { svgPath: '/symbols/eat_,_to.svg', label: 'Eat' },
  drink: { svgPath: '/symbols/drink_,_to.svg', label: 'Drink' },
  play: { svgPath: '/symbols/play_,_to.svg', label: 'Play' },
  game: { svgPath: '/symbols/computer_game.svg', label: 'Game' },
  break: { svgPath: '/symbols/break_time_1.svg', label: 'Break' },
  rest: { svgPath: '/symbols/rest_,_to.svg', label: 'Rest' },
  relax: { svgPath: '/symbols/relax_,_to.svg', label: 'Relax' },
  sleep: { svgPath: '/symbols/sleep_female_,_to.svg', label: 'Sleep' },
  bed: { svgPath: '/symbols/bed_time.svg', label: 'Bed' },
  focus: { svgPath: '/symbols/spark_adhd_focus.svg', label: 'Focus' },
  task: { svgPath: '/symbols/spark_adhd_focus.svg', label: 'Task' },
  tasks: { svgPath: '/symbols/spark_adhd_focus.svg', label: 'Tasks' },
  step: { svgPath: '/symbols/spark_adhd_focus.svg', label: 'Step' },
  plan: { svgPath: '/symbols/spark_adhd_focus.svg', label: 'Plan' },
  checklist: { svgPath: '/symbols/spark_adhd_focus.svg', label: 'Checklist' },
  homework: { svgPath: '/symbols/spark_adhd_focus.svg', label: 'Homework' },

  // Places & Everyday Life (360°)
  home: { svgPath: '/symbols/house.svg', label: 'Home' },
  house: { svgPath: '/symbols/house.svg', label: 'House' },
  school: { svgPath: '/symbols/school.svg', label: 'School' },
  college: { svgPath: '/symbols/school.svg', label: 'College' },
  teacher: { svgPath: '/symbols/teacher_1a.svg', label: 'Teacher' },
  bus: { svgPath: '/symbols/bus.svg', label: 'Bus' },
  train: { svgPath: '/symbols/train.svg', label: 'Train' },
  cafe: { svgPath: '/symbols/cafe.svg', label: 'Café' },
  shop: { svgPath: '/symbols/shop.svg', label: 'Shop' },
  money: { svgPath: '/symbols/money.svg', label: 'Money' },
  pay: { svgPath: '/symbols/money.svg', label: 'Pay' },
  phone: { svgPath: '/symbols/mobile_phone.svg', label: 'Phone' },
  music: { svgPath: '/symbols/music.svg', label: 'Music' },
  headphones: { svgPath: '/symbols/headphones.svg', label: 'Headphones' },

  // Food & Drink
  cup: { svgPath: '/symbols/mug_2.svg', label: 'Cup' },
  mug: { svgPath: '/symbols/mug_2.svg', label: 'Mug' },
  tea: { svgPath: '/symbols/spark_cup_of_tea.svg', label: 'Tea' },
  cuppa: { svgPath: '/symbols/spark_cup_of_tea.svg', label: 'Cuppa' },
  coffee: { svgPath: '/symbols/coffee.svg', label: 'Coffee' },
  water: { svgPath: '/symbols/water.svg', label: 'Water' },
  lunch: { svgPath: '/symbols/lunch_1.svg', label: 'Lunch' },
  breakfast: { svgPath: '/symbols/breakfast_1.svg', label: 'Breakfast' },
  meal: { svgPath: '/symbols/lunch_1.svg', label: 'Meal' },

  // Feelings, Sensory & Neurodiversity
  feel: { svgPath: '/symbols/spark_feel.svg', label: 'Feel' },
  feeling: { svgPath: '/symbols/spark_feel.svg', label: 'Feeling' },
  happy: { svgPath: '/symbols/happy_lady.svg', label: 'Happy' },
  sad: { svgPath: '/symbols/sad_lady.svg', label: 'Sad' },
  angry: { svgPath: '/symbols/angry_lady.svg', label: 'Angry' },
  worried: { svgPath: '/symbols/worried_lady.svg', label: 'Worried' },
  anxious: { svgPath: '/symbols/worried_lady.svg', label: 'Anxious' },
  scared: { svgPath: '/symbols/spark_scared.svg', label: 'Scared' },
  overwhelmed: { svgPath: '/symbols/spark_scared.svg', label: 'Overwhelmed' },
  tired: { svgPath: '/symbols/spark_tired.svg', label: 'Tired' },
  quiet: { svgPath: '/symbols/quiet.svg', label: 'Quiet' },
  calm: { svgPath: '/symbols/spark_calm.svg', label: 'Calm' },
  breathe: { svgPath: '/symbols/spark_calm.svg', label: 'Breathe' },
  sensory: { svgPath: '/symbols/spark_sensory_room.svg', label: 'Sensory' },
  loud: { svgPath: '/symbols/spark_ear_defenders.svg', label: 'Loud' },
  choice: { svgPath: '/symbols/spark_consent_choice.svg', label: 'Choice' },
  choose: { svgPath: '/symbols/spark_consent_choice.svg', label: 'Choose' },
  consent: { svgPath: '/symbols/spark_consent_choice.svg', label: 'Consent' },
  decide: { svgPath: '/symbols/spark_consent_choice.svg', label: 'Decide' },
  decision: { svgPath: '/symbols/spark_consent_choice.svg', label: 'Decision' },

  // Health, Epilepsy & Care
  doctor: { svgPath: '/symbols/doctor_1a.svg', label: 'Doctor' },
  gp: { svgPath: '/symbols/doctor_1a.svg', label: 'GP' },
  nurse: { svgPath: '/symbols/nurse_1a.svg', label: 'Nurse' },
  dentist: { svgPath: '/symbols/dentist_1a.svg', label: 'Dentist' },
  dental: { svgPath: '/symbols/dentist_1a.svg', label: 'Dentist' },
  hospital: { svgPath: '/symbols/healthicons/places/hospital.svg', label: 'Hospital' },
  clinic: { svgPath: '/symbols/healthicons/places/ambulatory-clinic.svg', label: 'Clinic' },
  surgery: { svgPath: '/symbols/healthicons/places/ambulatory-clinic.svg', label: 'GP Surgery' },
  passport: { svgPath: '/symbols/spark_hospital_passport.svg', label: 'Hospital Passport' },
  epilepsy: { svgPath: '/symbols/spark_epilepsy_safety.svg', label: 'Epilepsy' },
  seizure: { svgPath: '/symbols/spark_epilepsy_safety.svg', label: 'Seizure' },
  neurology: { svgPath: '/symbols/healthicons/body/neurology.svg', label: 'Neurology' },
  wheelchair: { svgPath: '/symbols/healthicons/devices/wheelchair.svg', label: 'Wheelchair' },
  medication: { svgPath: '/symbols/spark_medication_round.svg', label: 'Medication' },
  medicine: { svgPath: '/symbols/spark_medication_round.svg', label: 'Medicine' },
  tablets: { svgPath: '/symbols/spark_medication_round.svg', label: 'Tablets' },
  pills: { svgPath: '/symbols/spark_medication_round.svg', label: 'Pills' },
  iddsi: { svgPath: '/symbols/spark_iddsi_meal.svg', label: 'IDDSI Meal' },
  pain: { svgPath: '/symbols/spark_pain_scale.svg', label: 'Pain' },
  hurt: { svgPath: '/symbols/spark_pain_scale.svg', label: 'Hurt' },
  sore: { svgPath: '/symbols/spark_pain_scale.svg', label: 'Sore' },
};

// Lens-specific refinements (e.g. clinical lens prefers Health Icons for clinicians)
const LENS_OVERRIDES: Partial<Record<AudienceLens, Record<string, { svgPath: string; label: string }>>> = {
  clinical: {
    doctor: { svgPath: '/symbols/healthicons/people/doctor.svg', label: 'Doctor' },
    gp: { svgPath: '/symbols/healthicons/people/doctor.svg', label: 'GP' },
    mental: { svgPath: '/symbols/healthicons/symbols/mental-health.svg', label: 'Mental Health' },
  },
  teens: {
    break: { svgPath: '/symbols/headphones.svg', label: 'Break' },
  },
};

// Dangerous collision filenames that must NEVER win automatic sentence matching
const AUTO_MATCH_BLOCKLIST = new Set([
  'break_,_to.svg',
  'cake_cup_cake.svg',
  'cup_non_spill.svg',
  'yesterday.svg',
  'retired.svg',
  'young.svg',
  'ant_eater.svg',
  'sleep_suit_baby.svg',
]);

function normaliseKey(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function deriveStems(word: string): string[] {
  const stems: string[] = [word];
  if (word.endsWith('ies') && word.length > 4) stems.push(word.slice(0, -3) + 'y');
  if (word.endsWith('es') && word.length > 4) stems.push(word.slice(0, -2));
  if (word.endsWith('s') && word.length > 3 && !word.endsWith('ss')) stems.push(word.slice(0, -1));
  if (word.endsWith('ing') && word.length > 5) {
    const base = word.slice(0, -3);
    stems.push(base, base + 'e');
  }
  if (word.endsWith('ed') && word.length > 4) {
    const base = word.slice(0, -2);
    stems.push(base, base + 'e');
  }
  return Array.from(new Set(stems));
}

export interface SymbolLookupIndex {
  exactLabel: Map<string, MulberrySymbol>;
  exactTag: Map<string, MulberrySymbol>;
}

function symbolPriority(sym: MulberrySymbol): number {
  let score = 0;
  if (sym.category.startsWith('Spark')) score += 120;
  else if (sym.svgPath.startsWith('/symbols/healthicons/')) score += 55;
  else if (sym.svgPath.startsWith('/symbols/') && !sym.svgPath.includes('/openmoji/')) score += 70;
  if (!sym.label.includes(' ')) score += 15;
  score -= Math.min(sym.label.length, 30) * 0.2;
  return score;
}

export function buildSymbolLookupIndex(symbols: MulberrySymbol[]): SymbolLookupIndex {
  const exactLabel = new Map<string, MulberrySymbol>();
  const exactTag = new Map<string, MulberrySymbol>();

  const sparkCoreBoost = (sym: MulberrySymbol): number => {
    if (!sym.svgPath.startsWith('/symbols/spark-core/')) return 0;
    const isPersonaVariant = /_(girl|boy|woman|man|older_woman|older_man)\.svg$/i.test(sym.svgPath);
    return isPersonaVariant ? 5000 : 10000;
  };

  const setIfBetter = (map: Map<string, MulberrySymbol>, key: string, sym: MulberrySymbol) => {
    if (!key) return;
    const prev = map.get(key);
    if (!prev || symbolPriority(sym) + sparkCoreBoost(sym) > symbolPriority(prev) + sparkCoreBoost(prev)) {
      map.set(key, sym);
    }
  };

  for (const sym of symbols) {
    if (AUTO_MATCH_BLOCKLIST.has(sym.filename)) continue;
    const isOpenMoji = sym.svgPath.includes('/openmoji/') || sym.category.toLowerCase().includes('openmoji');

    const cleanLabel = normaliseKey(sym.label.replace(/\(.*?\)/g, '').replace(/,\s*to$/i, ''));
    if (!isOpenMoji) {
      setIfBetter(exactLabel, cleanLabel, sym);
      const baseFile = normaliseKey(sym.filename.replace(/\.svg$/i, '').replace(/_,_to$/i, '').replace(/_/g, ' '));
      if (baseFile && !baseFile.includes(' ')) {
        setIfBetter(exactLabel, baseFile, sym);
      }
      for (const tag of sym.tags || []) {
        const cleanTag = normaliseKey(tag);
        if (cleanTag && cleanTag.length >= 3 && cleanTag.length <= 24) {
          setIfBetter(exactTag, cleanTag, sym);
        }
      }
    }
  }

  return { exactLabel, exactTag };
}

const SPARK_CORE_EASY_READ_OVERRIDES: Record<string, { svgPath: string; label: string }> = {
  "cup of tea": {
    "svgPath": "/symbols/spark-core/cup_of_tea.svg",
    "label": "Cup of Tea"
  },
  "tea": {
    "svgPath": "/symbols/spark-core/cup_of_tea.svg",
    "label": "Cup of Tea"
  },
  "cuppa": {
    "svgPath": "/symbols/spark-core/cup_of_tea.svg",
    "label": "Cuppa"
  },
  "quiet break": {
    "svgPath": "/symbols/spark-core/quiet_break.svg",
    "label": "Quiet Break"
  },
  "break": {
    "svgPath": "/symbols/spark-core/quiet_break.svg",
    "label": "Quiet Break"
  },
  "hospital passport": {
    "svgPath": "/symbols/spark-core/hospital_passport.svg",
    "label": "Hospital Passport"
  },
  "support worker": {
    "svgPath": "/symbols/spark-core/support_worker.svg",
    "label": "Support Worker"
  },
  "carer": {
    "svgPath": "/symbols/spark-core/support_worker.svg",
    "label": "Carer"
  },
  "staff": {
    "svgPath": "/symbols/spark-core/support_worker.svg",
    "label": "Staff"
  },
  "deep breath": {
    "svgPath": "/symbols/spark-core/calm.svg",
    "label": "Deep Breath"
  },
  "calm": {
    "svgPath": "/symbols/spark-core/calm.svg",
    "label": "Calm"
  },
  "breathe": {
    "svgPath": "/symbols/spark-core/calm.svg",
    "label": "Breathe"
  },
  "ask for help": {
    "svgPath": "/symbols/spark-core/help.svg",
    "label": "Ask for Help"
  },
  "help": {
    "svgPath": "/symbols/spark-core/help.svg",
    "label": "Help"
  },
  "support": {
    "svgPath": "/symbols/spark-core/help.svg",
    "label": "Support"
  },
  "ask": {
    "svgPath": "/symbols/spark-core/ask.svg",
    "label": "Ask"
  },
  "listen": {
    "svgPath": "/symbols/spark-core/listen.svg",
    "label": "Listen"
  },
  "doctor": {
    "svgPath": "/symbols/spark-core/doctor.svg",
    "label": "Doctor"
  },
  "gp": {
    "svgPath": "/symbols/spark-core/doctor.svg",
    "label": "GP"
  },
  "nurse": {
    "svgPath": "/symbols/spark-core/nurse.svg",
    "label": "Nurse"
  },
  "clinic": {
    "svgPath": "/symbols/spark-core/clinic.svg",
    "label": "Clinic"
  },
  "i": {
    "svgPath": "/symbols/spark-core/i_me.svg",
    "label": "I / Me"
  },
  "me": {
    "svgPath": "/symbols/spark-core/i_me.svg",
    "label": "I / Me"
  },
  "my": {
    "svgPath": "/symbols/spark-core/i_me.svg",
    "label": "My"
  },
  "you": {
    "svgPath": "/symbols/spark-core/you.svg",
    "label": "You"
  },
  "we": {
    "svgPath": "/symbols/spark-core/we.svg",
    "label": "We"
  },
  "he": {
    "svgPath": "/symbols/spark-core/he_him.svg",
    "label": "He"
  },
  "him": {
    "svgPath": "/symbols/spark-core/he_him.svg",
    "label": "Him"
  },
  "she": {
    "svgPath": "/symbols/spark-core/she_her.svg",
    "label": "She"
  },
  "her": {
    "svgPath": "/symbols/spark-core/she_her.svg",
    "label": "Her"
  },
  "they": {
    "svgPath": "/symbols/spark-core/they_them.svg",
    "label": "They"
  },
  "them": {
    "svgPath": "/symbols/spark-core/they_them.svg",
    "label": "Them"
  },
  "yes": {
    "svgPath": "/symbols/spark-core/yes.svg",
    "label": "Yes"
  },
  "agree": {
    "svgPath": "/symbols/spark-core/yes.svg",
    "label": "Agree"
  },
  "no": {
    "svgPath": "/symbols/spark-core/no.svg",
    "label": "No"
  },
  "not": {
    "svgPath": "/symbols/spark-core/no.svg",
    "label": "Not"
  },
  "dont": {
    "svgPath": "/symbols/spark-core/no.svg",
    "label": "Don't"
  },
  "decline": {
    "svgPath": "/symbols/spark-core/no.svg",
    "label": "Decline"
  },
  "home": {
    "svgPath": "/symbols/spark-core/home.svg",
    "label": "Home"
  },
  "house": {
    "svgPath": "/symbols/spark-core/home.svg",
    "label": "House"
  },
  "wait": {
    "svgPath": "/symbols/spark-core/wait.svg",
    "label": "Wait"
  },
  "time": {
    "svgPath": "/symbols/spark-core/time.svg",
    "label": "Time"
  },
  "first": {
    "svgPath": "/symbols/spark-core/first.svg",
    "label": "First"
  },
  "then": {
    "svgPath": "/symbols/spark-core/then.svg",
    "label": "Then"
  },
  "safe": {
    "svgPath": "/symbols/spark-core/safe.svg",
    "label": "Safe"
  },
  "decide": {
    "svgPath": "/symbols/spark-core/decide.svg",
    "label": "Decide"
  },
  "see": {
    "svgPath": "/symbols/spark-core/see.svg",
    "label": "See"
  },
  "bring": {
    "svgPath": "/symbols/spark-core/bring.svg",
    "label": "Bring"
  },
  "have": {
    "svgPath": "/symbols/spark-core/have.svg",
    "label": "Have"
  },
  "going to": {
    "svgPath": "/symbols/spark-core/going_to.svg",
    "label": "Going To"
  },
  "girl": {
    "svgPath": "/symbols/spark-core/girl.svg",
    "label": "Girl"
  },
  "boy": {
    "svgPath": "/symbols/spark-core/boy.svg",
    "label": "Boy"
  },
  "woman": {
    "svgPath": "/symbols/spark-core/woman.svg",
    "label": "Woman"
  },
  "man": {
    "svgPath": "/symbols/spark-core/man.svg",
    "label": "Man"
  },
  "older woman": {
    "svgPath": "/symbols/spark-core/older_woman.svg",
    "label": "Older Woman"
  },
  "older man": {
    "svgPath": "/symbols/spark-core/older_man.svg",
    "label": "Older Man"
  }
};

export function resolveTokenSymbol(
  rawSegment: string,
  index: SymbolLookupIndex,
  lens: AudienceLens
): { svgPath: string; label: string } | null {
  const clean = normaliseKey(rawSegment);
  if (!clean) return null;

  // 0. Tier-0 Spark Core overrides (always preferred + persona-aware)
  if (SPARK_CORE_EASY_READ_OVERRIDES[clean]) return SPARK_CORE_EASY_READ_OVERRIDES[clean];

  // 1. Locked multi-word phrase match
  if (LOCKED_PHRASES[clean]) return LOCKED_PHRASES[clean];

  // 2. Lens-specific override
  const lensMap = LENS_OVERRIDES[lens];
  if (lensMap && lensMap[clean]) return lensMap[clean];

  // 3. Locked 360° core word match
  if (CORE_VERIFIED_WORDS[clean]) return CORE_VERIFIED_WORDS[clean];

  // 4. Exact label match across clean word + stems (Mulberry / Spark / HealthIcons)
  const stems = deriveStems(clean);
  for (const candidate of stems) {
    if (CORE_VERIFIED_WORDS[candidate]) return CORE_VERIFIED_WORDS[candidate];
    const labelHit = index.exactLabel.get(candidate);
    if (labelHit) return { svgPath: labelHit.svgPath, label: labelHit.label };
  }

  // 5. Exact tag match (Spark / Mulberry / HealthIcons only — never OpenMoji collisions)
  for (const candidate of stems) {
    const tagHit = index.exactTag.get(candidate);
    if (tagHit) return { svgPath: tagHit.svgPath, label: tagHit.label };
  }

  return null;
}

export function searchRankedSymbols(
  symbols: MulberrySymbol[],
  query: string,
  lens: AudienceLens = 'adults',
  limit = 28
): MulberrySymbol[] {
  const q = normaliseKey(query);
  if (!q) return symbols.slice(0, limit);

  const scored: { sym: MulberrySymbol; score: number }[] = [];
  for (const sym of symbols) {
    const lbl = normaliseKey(sym.label);
    let score = 0;
    if (lbl === q) score = 200;
    else if (lbl.startsWith(q + ' ')) score = 140;
    else if (lbl.split(' ').includes(q)) score = 120;
    else if ((sym.tags || []).some((t) => normaliseKey(t) === q)) score = 105;
    else if (lbl.startsWith(q)) score = 65;
    else if (lbl.includes(q)) score = 40;
    else if ((sym.tags || []).some((t) => normaliseKey(t).includes(q))) score = 25;

    if (score > 0) {
      let lensBonus = 0;
      const isHealth = sym.svgPath.includes('/healthicons/');
      const isOpenMoji = sym.svgPath.includes('/openmoji/');
      if (lens === 'clinical' && isHealth) lensBonus = 30;
      if (lens === 'kids' && isOpenMoji) lensBonus = 18;
      scored.push({ sym, score: score + symbolPriority(sym) * 0.25 + lensBonus });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.sym);
}
