import type { MulberrySymbol } from '../data/symbols';

export type GrammarOverlay = 'none' | 'negation' | 'question' | 'past' | 'future' | 'plural';

export type SemanticTone = 'who' | 'doing' | 'what' | 'where' | 'describing' | 'social';

export const SMALL_FILLER_WORDS = new Set([
  'a', 'an', 'the', 'of', 'to', 'in', 'on', 'at', 'for', 'by', 'with',
  'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
  'will', 'shall', 'would', 'could', 'should', 'can', 'may', 'might',
  'that', 'this', 'these', 'those', 'it', 'its', 'as', 'from', 'into',
  'and', 'or', 'but', 'if', 'so', 'than', 'very', 'just', 'about',
]);

const WHO_WORDS = new Set([
  'i', 'me', 'my', 'mine', 'you', 'your', 'we', 'us', 'our', 'he', 'him', 'she', 'her', 'they', 'them',
  'staff', 'carer', 'doctor', 'gp', 'nurse', 'dentist', 'mum', 'dad', 'family', 'friend', 'resident', 'person', 'manager',
]);

const DOING_WORDS = new Set([
  'want', 'need', 'help', 'go', 'going', 'walk', 'eat', 'eating', 'drink', 'drinking', 'wash', 'brush',
  'sit', 'stand', 'sleep', 'rest', 'wait', 'stop', 'listen', 'talk', 'speak', 'tell', 'ask', 'explain',
  'decide', 'agree', 'decline', 'take', 'have', 'bring', 'feel', 'feeling', 'read', 'write', 'look', 'choose',
]);

const WHERE_WORDS = new Set([
  'home', 'hospital', 'clinic', 'surgery', 'toilet', 'loo', 'bathroom', 'bedroom', 'kitchen', 'garden',
  'shop', 'park', 'room', 'sensory', 'outside', 'inside', 'upstairs', 'downstairs', 'bus', 'car',
]);

const DESCRIBING_WORDS = new Set([
  'happy', 'sad', 'angry', 'worried', 'anxious', 'calm', 'quiet', 'loud', 'hot', 'cold', 'tired', 'sore',
  'pain', 'hurt', 'unwell', 'sick', 'safe', 'slowly', 'good', 'bad', 'ready', 'finished', 'done', 'more',
  'soft', 'pureed', 'upright', 'before', 'after', 'first', 'next', 'then', 'now', 'later', 'today', 'tomorrow',
]);

export function classifySemanticTone(word: string): SemanticTone {
  const w = word.toLowerCase().trim();
  if (WHO_WORDS.has(w)) return 'who';
  if (DOING_WORDS.has(w)) return 'doing';
  if (WHERE_WORDS.has(w)) return 'where';
  if (DESCRIBING_WORDS.has(w)) return 'describing';
  if (['yes', 'no', 'please', 'thank', 'thanks', 'hello', 'hi', 'bye', 'sorry', 'excuse'].includes(w)) {
    return 'social';
  }
  return 'what';
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

const VERIFIED_WORD_OVERRIDES: Record<string, { svgPath: string; label: string }> = {
  want: { svgPath: '/symbols/spark_want.svg', label: 'I want' },
  wants: { svgPath: '/symbols/spark_want.svg', label: 'I want' },
  help: { svgPath: '/symbols/spark_help.svg', label: 'Help' },
  cup: { svgPath: '/symbols/cup_non_spill.svg', label: 'Cup' },
  mug: { svgPath: '/symbols/cup_non_spill.svg', label: 'Mug' },
  hospital: { svgPath: '/symbols/spark_hospital_passport.svg', label: 'Hospital Passport' },
  passport: { svgPath: '/symbols/spark_hospital_passport.svg', label: 'Hospital Passport' },
  iddsi: { svgPath: '/symbols/spark_iddsi_meal.svg', label: 'IDDSI Texture Meal' },
  pureed: { svgPath: '/symbols/spark_iddsi_meal.svg', label: 'IDDSI Texture Meal' },
  sensory: { svgPath: '/symbols/spark_sensory_room.svg', label: 'Sensory Room' },
  consent: { svgPath: '/symbols/spark_consent_choice.svg', label: 'My Choice & Consent' },
  choice: { svgPath: '/symbols/spark_consent_choice.svg', label: 'My Choice & Consent' },
  choose: { svgPath: '/symbols/spark_consent_choice.svg', label: 'My Choice & Consent' },
  decide: { svgPath: '/symbols/spark_consent_choice.svg', label: 'My Choice & Consent' },
  medication: { svgPath: '/symbols/spark_medication_round.svg', label: 'Medication Round' },
  medicine: { svgPath: '/symbols/spark_medication_round.svg', label: 'Medication Round' },
  tablets: { svgPath: '/symbols/spark_medication_round.svg', label: 'Medication Round' },
  pills: { svgPath: '/symbols/spark_medication_round.svg', label: 'Medication Round' },
  pain: { svgPath: '/symbols/spark_pain_scale.svg', label: 'Pain & Discomfort' },
  hurt: { svgPath: '/symbols/spark_pain_scale.svg', label: 'Pain & Discomfort' },
  hurts: { svgPath: '/symbols/spark_pain_scale.svg', label: 'Pain & Discomfort' },
  sore: { svgPath: '/symbols/spark_pain_scale.svg', label: 'Pain & Discomfort' },
  ache: { svgPath: '/symbols/spark_pain_scale.svg', label: 'Pain & Discomfort' },
};

const UK_WORD_ALIASES: Record<string, string[]> = {
  cuppa: ['tea', 'drink hot', 'cup'],
  brew: ['tea', 'drink hot'],
  loo: ['toilet', 'bathroom'],
  wc: ['toilet'],
  gp: ['doctor', 'clinic'],
  surgery: ['doctor', 'clinic'],
  chemist: ['pharmacy', 'medication'],
  paracetamol: ['medication', 'medicine'],
  carer: ['help', 'support', 'staff'],
  staff: ['help', 'support'],
  meal: ['dinner', 'lunch', 'eat'],
  mealtime: ['dinner', 'eat'],
  breakfast: ['eat', 'food'],
  lunch: ['eat', 'food'],
  dinner: ['eat', 'food'],
  hands: ['hand', 'clean hands', 'wash'],
  teeth: ['toothbrush', 'tooth', 'brush'],
  worried: ['anxious', 'sad', 'scared'],
  quiet: ['quiet', 'calm', 'sensory'],
  calm: ['quiet', 'relax', 'sensory'],
  break: ['break', 'rest', 'pause'],
  finished: ['finish', 'done', 'stop'],
  done: ['finish', 'stop'],
  slowly: ['slow', 'wait'],
  upright: ['sit', 'chair'],
  explain: ['talk', 'speak', 'listen'],
  agree: ['yes', 'consent'],
  decline: ['no', 'stop'],
  dental: ['dentist', 'tooth', 'toothbrush'],
  appointment: ['calendar', 'doctor', 'clinic'],
  morning: ['morning', 'sun', 'wake'],
  water: ['water', 'drink'],
  tea: ['tea', 'drink hot'],
  wash: ['wash', 'clean hands'],
  brush: ['toothbrush', 'brush'],
};

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
  if (sym.category === 'Spark UK Care & PECS') score += 100;
  if (sym.svgPath.startsWith('/symbols/') && !sym.svgPath.includes('/openmoji/')) score += 40;
  if (!sym.label.includes(' ')) score += 15;
  score -= Math.min(sym.label.length, 30) * 0.2;
  return score;
}

export function buildSymbolLookupIndex(symbols: MulberrySymbol[]): SymbolLookupIndex {
  const exactLabel = new Map<string, MulberrySymbol>();
  const exactTag = new Map<string, MulberrySymbol>();

  const setIfBetter = (map: Map<string, MulberrySymbol>, key: string, sym: MulberrySymbol) => {
    if (!key) return;
    const prev = map.get(key);
    if (!prev || symbolPriority(sym) > symbolPriority(prev)) {
      map.set(key, sym);
    }
  };

  for (const sym of symbols) {
    const cleanLabel = normaliseKey(sym.label.replace(/\(.*?\)/g, '').replace(/,\s*to$/i, ''));
    setIfBetter(exactLabel, cleanLabel, sym);

    // Also index base filename (e.g. "drink_,_to.svg" -> "drink")
    const baseFile = normaliseKey(sym.filename.replace(/\.svg$/i, '').replace(/_,_to$/i, '').replace(/_/g, ' '));
    if (baseFile && !baseFile.includes(' ')) {
      setIfBetter(exactLabel, baseFile, sym);
    }

    for (const tag of sym.tags || []) {
      const cleanTag = normaliseKey(tag);
      if (cleanTag && cleanTag.length >= 2 && cleanTag.length <= 24) {
        setIfBetter(exactTag, cleanTag, sym);
      }
    }
  }

  return { exactLabel, exactTag };
}

export function resolveWordSymbol(
  rawWord: string,
  index: SymbolLookupIndex
): { svgPath: string; label: string } | null {
  const clean = normaliseKey(rawWord);
  if (!clean) return null;

  // 1. Curated Spark & UK Care verified overrides (prevents "cup" -> cupcake)
  if (VERIFIED_WORD_OVERRIDES[clean]) {
    return VERIFIED_WORD_OVERRIDES[clean];
  }

  // 2. Exact label match across word + morphological stems
  const stems = deriveStems(clean);
  for (const candidate of stems) {
    const labelHit = index.exactLabel.get(candidate);
    if (labelHit) return { svgPath: labelHit.svgPath, label: labelHit.label };
  }

  // 3. UK Care alias map
  const aliases = UK_WORD_ALIASES[clean];
  if (aliases) {
    for (const alias of aliases) {
      if (VERIFIED_WORD_OVERRIDES[alias]) return VERIFIED_WORD_OVERRIDES[alias];
      const labelHit = index.exactLabel.get(alias);
      if (labelHit) return { svgPath: labelHit.svgPath, label: labelHit.label };
      const tagHit = index.exactTag.get(alias);
      if (tagHit) return { svgPath: tagHit.svgPath, label: tagHit.label };
    }
  }

  // 4. Exact tag match (only exact token, never substring prefix)
  for (const candidate of stems) {
    const tagHit = index.exactTag.get(candidate);
    if (tagHit) return { svgPath: tagHit.svgPath, label: tagHit.label };
  }

  return null;
}

export function searchRankedSymbols(
  symbols: MulberrySymbol[],
  query: string,
  limit = 24
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
    else if ((sym.tags || []).some((t) => normaliseKey(t) === q)) score = 110;
    else if (lbl.startsWith(q)) score = 70;
    else if (lbl.includes(q)) score = 45;
    else if ((sym.tags || []).some((t) => normaliseKey(t).includes(q))) score = 30;

    if (score > 0) {
      scored.push({ sym, score: score + symbolPriority(sym) * 0.25 });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.sym);
}
