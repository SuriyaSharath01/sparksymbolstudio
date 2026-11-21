import Papa from 'papaparse';

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

const DB_NAME = 'CareCommLocalDB';
const DB_VERSION = 1;
const PHOTO_STORE = 'resident_photos';

function formatDisplayLabel(symbolEn: string): string {
  return symbolEn
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
          .then((extra: MulberrySymbol[]) => resolve([...parsed, ...extra]))
          .catch(() => resolve(parsed));
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
