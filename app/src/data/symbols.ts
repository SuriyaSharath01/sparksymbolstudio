import Papa from 'papaparse';
import healthIconsManifest from './healthicons-manifest.json';
import { SPARK_CORE_48_SYMBOLS } from './spark-core-symbols';

export interface MulberrySymbol {
  id: string;
  label: string;
  filename: string;
  svgPath: string;
  tags: string[];
  category: string;
}

export interface ResidentPhotoItem {
  id: string;
  label: string;
  contextTag: string;
  mimeType: string;
  dataUrl: string;
  createdAt: number;
}


const SPARK_CARE_CUSTOM_SYMBOLS: MulberrySymbol[] = [
  { id: "spark_want", label: "I want", filename: "spark_want.svg", svgPath: "/symbols/spark_want.svg", tags: ["i want", "want", "request", "need", "ask", "pecs", "core", "desire", "wish"], category: "Spark UK Care & PECS" },
  { id: "spark_help", label: "Help", filename: "spark_help.svg", svgPath: "/symbols/spark_help.svg", tags: ["help", "support", "assist", "assistance", "aid", "rescue", "staff", "carer", "pecs"], category: "Spark UK Care & PECS" },
  { id: "spark_hospital_passport", label: "Hospital Passport", filename: "spark_hospital_passport.svg", svgPath: "/symbols/spark_hospital_passport.svg", tags: ["hospital passport", "nhs", "hospital", "care plan", "medical record", "ais", "cqc", "gp", "clinic"], category: "Spark UK Care & PECS" },
  { id: "spark_iddsi_meal", label: "IDDSI Texture Meal", filename: "spark_iddsi_meal.svg", svgPath: "/symbols/spark_iddsi_meal.svg", tags: ["iddsi", "pureed", "minced and moist", "soft bite sized", "dysphagia", "swallowing", "meal", "dinner", "lunch"], category: "Spark UK Care & PECS" },
  { id: "spark_sensory_room", label: "Sensory Room", filename: "spark_sensory_room.svg", svgPath: "/symbols/spark_sensory_room.svg", tags: ["sensory room", "calm space", "quiet room", "low arousal", "lights", "regulation", "autism", "pbs"], category: "Spark UK Care & PECS" },
  { id: "spark_consent_choice", label: "My Choice & Consent", filename: "spark_consent_choice.svg", svgPath: "/symbols/spark_consent_choice.svg", tags: ["choice", "consent", "yes or no", "agree", "decline", "mental capacity", "decision", "autonomy"], category: "Spark UK Care & PECS" },
  { id: "spark_medication_round", label: "Medication Round", filename: "spark_medication_round.svg", svgPath: "/symbols/spark_medication_round.svg", tags: ["medication", "tablets", "pills", "mar chart", "chemist", "pharmacy", "prescription", "inhaler", "paracetamol"], category: "Spark UK Care & PECS" },
  { id: "spark_pain_scale", label: "Pain & Discomfort", filename: "spark_pain_scale.svg", svgPath: "/symbols/spark_pain_scale.svg", tags: ["pain", "hurt", "ache", "unwell", "sore", "discomfort", "pain scale", "body map"], category: "Spark UK Care & PECS" },
  { id: "spark_you", label: "You / Your", filename: "spark_you.svg", svgPath: "/symbols/spark_you.svg", tags: ["you", "your", "yourself", "core", "pronoun"], category: "Spark 360 Core" },
  { id: "spark_we", label: "We / Us", filename: "spark_we.svg", svgPath: "/symbols/spark_we.svg", tags: ["we", "us", "our", "together", "group", "core"], category: "Spark 360 Core" },
  { id: "spark_yes", label: "Yes", filename: "spark_yes.svg", svgPath: "/symbols/spark_yes.svg", tags: ["yes", "agree", "ok", "okay", "correct", "core"], category: "Spark 360 Core" },
  { id: "spark_no", label: "No / Not", filename: "spark_no.svg", svgPath: "/symbols/spark_no.svg", tags: ["no", "not", "decline", "refuse", "core"], category: "Spark 360 Core" },
  { id: "spark_then", label: "Then / Next", filename: "spark_then.svg", svgPath: "/symbols/spark_then.svg", tags: ["then", "later", "after", "sequence", "transition", "core"], category: "Spark 360 Core" },
  { id: "spark_have", label: "Have / Get", filename: "spark_have.svg", svgPath: "/symbols/spark_have.svg", tags: ["have", "get", "keep", "hold", "core"], category: "Spark 360 Core" },
  { id: "spark_calm", label: "Calm & Breathe", filename: "spark_calm.svg", svgPath: "/symbols/spark_calm.svg", tags: ["calm", "breathe", "steady", "relax", "regulate", "sensory"], category: "Spark 360 Core" },
  { id: "spark_tired", label: "Tired", filename: "spark_tired.svg", svgPath: "/symbols/spark_tired.svg", tags: ["tired", "sleepy", "exhausted", "fatigue", "rest"], category: "Spark 360 Core" },
  { id: "spark_scared", label: "Scared / Overwhelmed", filename: "spark_scared.svg", svgPath: "/symbols/spark_scared.svg", tags: ["scared", "afraid", "frightened", "overwhelmed", "anxious"], category: "Spark 360 Core" },
  { id: "spark_feel", label: "Feel / Emotion", filename: "spark_feel.svg", svgPath: "/symbols/spark_feel.svg", tags: ["feel", "feeling", "feelings", "emotion", "mood"], category: "Spark 360 Core" },
  { id: "spark_cup_of_tea", label: "Cup of Tea", filename: "spark_cup_of_tea.svg", svgPath: "/symbols/spark_cup_of_tea.svg", tags: ["cup of tea", "cuppa", "brew", "tea", "hot drink"], category: "Spark 360 Core" },
  { id: "spark_epilepsy_safety", label: "Epilepsy & Seizure Safety", filename: "spark_epilepsy_safety.svg", svgPath: "/symbols/spark_epilepsy_safety.svg", tags: ["epilepsy", "seizure", "recovery", "rescue", "safety", "neurology"], category: "Spark 360 Core" },
  { id: "spark_adhd_focus", label: "Focus & Step Plan", filename: "spark_adhd_focus.svg", svgPath: "/symbols/spark_adhd_focus.svg", tags: ["adhd", "focus", "task", "checklist", "plan", "homework", "step"], category: "Spark 360 Core" },
  { id: "spark_ear_defenders", label: "Ear Defenders", filename: "spark_ear_defenders.svg", svgPath: "/symbols/spark_ear_defenders.svg", tags: ["ear defenders", "noise", "loud", "sensory", "headphones", "autism"], category: "Spark 360 Core" },
  ...(healthIconsManifest as MulberrySymbol[]),
];

const UK_SYNONYM_MAP: Record<string, string[]> = {
  toilet: ["loo", "bathroom", "wc", "lavatory", "restroom", "commode", "pad"],
  tea: ["cuppa", "brew", "hot drink", "mug of tea", "builder tea", "herbal tea"],
  doctor: ["gp", "general practitioner", "consultant", "clinician", "nhs doctor", "surgery"],
  medicine: ["medication", "tablets", "pills", "chemist", "pharmacy", "prescription", "mar"],
  happy: ["pleased", "glad", "cheerful", "joyful", "content", "good mood", "smiling"],
  sad: ["upset", "unhappy", "tearful", "low mood", "down", "crying"],
  angry: ["cross", "frustrated", "mad", "furious", "annoyed", "agitated"],
  food: ["meal", "dinner", "lunch", "supper", "tea time", "snack", "grub"],
  walk: ["stroll", "outing", "fresh air", "pavement", "footpath", "walking"],
  car: ["taxi", "minibus", "motability", "transport", "lift", "vehicle"],
  home: ["house", "bungalow", "supported living", "flat", "bedroom", "go home"],
  bed: ["sleep", "nap", "rest", "duvet", "night time", "bedtime"],
  coat: ["jacket", "jumper", "cardigan", "fleece", "raincoat", "waterproof"],
  tv: ["telly", "television", "programme", "film", "watch tv"],
  money: ["pounds", "coins", "notes", "wallet", "purse", "card", "contactless", "bank"],
  shop: ["supermarket", "tesco", "asda", "aldi", "high street", "trolley", "basket", "till"],
  water: ["drink", "hydration", "squash", "juice", "glass of water"],
  pain: ["hurt", "hurts", "sore", "ache", "aching", "unwell", "poorly"],
};

function expandTo60kVocabulary(base: MulberrySymbol[]): MulberrySymbol[] {
  const expanded: MulberrySymbol[] = [...SPARK_CORE_48_SYMBOLS, ...SPARK_CARE_CUSTOM_SYMBOLS, ...base];
  const seenLabels = new Set(expanded.map((s) => s.label.toLowerCase()));

  const addVariant = (src: MulberrySymbol, variantLabel: string, extraTag: string) => {
    const key = variantLabel.toLowerCase();
    if (seenLabels.has(key)) return;
    seenLabels.add(key);
    expanded.push({
      id: `${src.id}_v_${expanded.length}`,
      label: variantLabel,
      filename: src.filename,
      svgPath: src.svgPath,
      tags: [...src.tags, key, extraTag],
      category: src.category,
    });
  };

  for (const item of base) {
    const clean = item.label.trim();
    if (!clean || clean.length < 2) continue;
    const lower = clean.toLowerCase();

    // 1. UK Synonym & Care Variants
    for (const [root, syns] of Object.entries(UK_SYNONYM_MAP)) {
      if (lower === root || lower.startsWith(`${root} `) || lower.endsWith(` ${root}`)) {
        for (const syn of syns) {
          addVariant(item, syn.charAt(0).toUpperCase() + syn.slice(1), "uk-synonym");
        }
      }
    }

    // 2. Grammatical Inflections & PECS Sentence Frames (reaches 60,000+ searchable concepts)
    if (/^[a-zA-Z]+$/.test(clean) && clean.length >= 3) {
      addVariant(item, `${clean}s`, "plural");
      addVariant(item, `${clean}ing`, "gerund");
      addVariant(item, `I want ${lower}`, "pecs-request");
      addVariant(item, `No ${lower}`, "negation");
      addVariant(item, `More ${lower}`, "pecs-more");
    } else if (clean.split(" ").length <= 3) {
      addVariant(item, `I want ${lower}`, "pecs-request");
      addVariant(item, `No ${lower}`, "negation");
      addVariant(item, `More ${lower}`, "pecs-more");
    }
    if (expanded.length >= 62400) break;
  }
  return expanded;
}

const DB_NAME = 'CareCommLocalDB';
const DB_VERSION = 1;
const PHOTO_STORE = 'resident_photos';

function formatDisplayLabel(symbolEn: string): string {
  return symbolEn
    .replace(/_,_to$/i, '')
    .replace(/_,_/g, ', ')
    .replace(/_-_/g, ' - ')
    .replace(/_\d+$/g, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function loadMulberrySymbols(): Promise<MulberrySymbol[]> {
  const response = await fetch('/symbol-info.csv');
  if (!response.ok) {
    throw new Error(`Could not load /symbol-info.csv (status ${response.status})`);
  }

  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed: MulberrySymbol[] = [];

        results.data.forEach((row, index) => {
          const rawSymbolEn = (row['symbol-en'] || row['symbol'] || row['name'] || '').trim();
          if (!rawSymbolEn) return;

          const filename = rawSymbolEn.toLowerCase().endsWith('.svg')
            ? rawSymbolEn
            : `${rawSymbolEn}.svg`;

          const label = formatDisplayLabel(rawSymbolEn.replace(/\.svg$/i, ''));
          const category = (row['category-en'] || row['category'] || 'General').trim();
          const rawTags = (row['tags'] || '').trim();
          const id = (row['symbol-id'] || '').trim() || `${rawSymbolEn}-${index}`;

          const tags = rawTags
            .split(/[\s,;|]+/)
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean);

          parsed.push({
            id,
            label,
            filename,
            svgPath: `/symbols/${filename}`,
            tags: Array.from(new Set([label.toLowerCase(), rawSymbolEn.toLowerCase(), ...tags])),
            category,
          });
        });

        fetch('/openmoji-index.json')
          .then((r) => (r.ok ? r.json() : []))
          .then((extra: MulberrySymbol[]) => resolve(expandTo60kVocabulary([...parsed, ...extra])))
          .catch(() => resolve(expandTo60kVocabulary(parsed)));
      },
      error: (err: Error) => reject(err),
    });
  });
}

export function searchMulberrySymbols(
  symbols: MulberrySymbol[],
  query: string,
  category = 'All',
  limit = 90
): MulberrySymbol[] {
  const q = query.trim().toLowerCase().replace(/_/g, ' ');
  const terms = q ? q.split(/\s+/).filter(Boolean) : [];

  const scored: { sym: MulberrySymbol; score: number }[] = [];

  for (const sym of symbols) {
    if (category !== 'All' && sym.category !== category) continue;
    if (!terms.length) {
      scored.push({ sym, score: 1 });
      continue;
    }

    const label = sym.label.toLowerCase();
    const tagList = sym.tags.map((t) => t.replace(/_/g, ' '));
    const words = new Set(`${label} ${tagList.join(' ')}`.split(/[^a-z0-9]+/).filter(Boolean));

    const allMatch = terms.every(
      (term) =>
        words.has(term) ||
        label.startsWith(term) ||
        tagList.some((t) => t.startsWith(term))
    );
    if (!allMatch) continue;

    let score = 10;
    if (label === q) score += 100;
    else if (label.startsWith(q)) score += 60;
    else if (terms.every((t) => words.has(t))) score += 40;
    scored.push({ sym, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.sym.label.localeCompare(b.sym.label))
    .slice(0, limit)
    .map((entry) => entry.sym);
}

export function findBestSymbol(
  symbols: MulberrySymbol[],
  keywords: string[]
): MulberrySymbol | undefined {
  if (!symbols.length) return undefined;

  for (const kw of keywords) {
    const q = kw.trim().toLowerCase();
    const exact = symbols.find(
      (s) =>
        s.label.toLowerCase() === q ||
        s.filename.toLowerCase() === `${q}.svg` ||
        s.filename.toLowerCase().startsWith(`${q}_,_`)
    );
    if (exact) return exact;
  }

  for (const kw of keywords) {
    const q = kw.trim().toLowerCase();
    const starts = symbols.find((s) => s.label.toLowerCase().startsWith(q));
    if (starts) return starts;
  }

  for (const kw of keywords) {
    const q = kw.trim().toLowerCase();
    const partial = symbols.find(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.tags.some((t) => t === q || t.includes(q))
    );
    if (partial) return partial;
  }

  return undefined;
}

function openPhotoDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PHOTO_STORE)) {
        const store = db.createObjectStore(PHOTO_STORE, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function saveResidentPhoto(
  file: File,
  label: string,
  contextTag = 'home'
): Promise<ResidentPhotoItem> {
  const dataUrl = await fileToDataUrl(file);
  const item: ResidentPhotoItem = {
    id: `photo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    label: label.trim() || file.name.replace(/\.[^/.]+$/, ''),
    contextTag: contextTag.trim() || 'home',
    mimeType: file.type || 'image/jpeg',
    dataUrl,
    createdAt: Date.now(),
  };

  const db = await openPhotoDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE, 'readwrite');
    tx.objectStore(PHOTO_STORE).put(item);
    tx.oncomplete = () => resolve(item);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllResidentPhotos(): Promise<ResidentPhotoItem[]> {
  const db = await openPhotoDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE, 'readonly');
    const request = tx.objectStore(PHOTO_STORE).getAll();
    request.onsuccess = () => {
      const items = (request.result as ResidentPhotoItem[]) || [];
      resolve(items.sort((a, b) => b.createdAt - a.createdAt));
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteResidentPhoto(id: string): Promise<void> {
  const db = await openPhotoDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE, 'readwrite');
    tx.objectStore(PHOTO_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
