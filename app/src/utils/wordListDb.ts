const DB_NAME = 'SparkWordListDB';
const DB_VERSION = 1;
const STORE_NAME = 'wordMappings';

export interface CustomWordMapping {
  word: string; // normalized lowercase key
  symbolId: string;
  symbolSrc: string;
  caption: string;
  tintColor?: string;
  updatedAt: string;
}

function openWordDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'word' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveWordMapping(mapping: CustomWordMapping): Promise<void> {
  const db = await openWordDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({
      ...mapping,
      word: mapping.word.trim().toLowerCase(),
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllWordMappings(): Promise<Record<string, CustomWordMapping>> {
  const db = await openWordDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => {
      const map: Record<string, CustomWordMapping> = {};
      for (const item of req.result as CustomWordMapping[]) {
        map[item.word] = item;
      }
      resolve(map);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteWordMapping(word: string): Promise<void> {
  const db = await openWordDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(word.trim().toLowerCase());
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
