import type { SymbolAsset } from "../types/symbols";
import { filterCommercialSafe } from "./symbolSearch";

const DB_NAME = "spark_symbol_cache_v1";
const DB_VERSION = 1;
const META_STORE = "symbol_meta";
const BLOB_STORE = "symbol_blobs";

function openCacheDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      resolve(null);
      return;
    }
    try {
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(BLOB_STORE)) {
          db.createObjectStore(BLOB_STORE, { keyPath: "id" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function cacheSymbolAssets(assets: SymbolAsset[]): Promise<void> {
  const safeAssets = filterCommercialSafe(assets);
  if (!safeAssets.length) return;
  const db = await openCacheDb();
  if (!db) return;
  try {
    const tx = db.transaction(META_STORE, "readwrite");
    const store = tx.objectStore(META_STORE);
    const now = Date.now();
    for (const asset of safeAssets) {
      store.put({ ...asset, cachedAt: now });
    }
  } catch {
    // ignore storage quota errors
  }
}

export async function getCachedSymbolsByQuery(query: string): Promise<SymbolAsset[]> {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const db = await openCacheDb();
  if (!db) return [];
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(META_STORE, "readonly");
      const store = tx.objectStore(META_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const all = Array.isArray(req.result) ? (req.result as SymbolAsset[]) : [];
        resolve(filterCommercialSafe(all).filter((item) => item.label.toLowerCase().includes(q)));
      };
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

export async function cacheSymbolBlob(id: string, imageUrl: string): Promise<void> {
  if (!id || !imageUrl) return;
  const db = await openCacheDb();
  if (!db) return;
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return;
    const blob = await res.blob();
    const tx = db.transaction(BLOB_STORE, "readwrite");
    const store = tx.objectStore(BLOB_STORE);
    const now = Date.now();
    store.put({ id, blob, cachedAt: now });
    store.put({ id: `src:${imageUrl}`, blob, cachedAt: now });
  } catch {
    // ignore offline/CORS errors
  }
}

export async function getCachedSymbolBlobUrl(id: string): Promise<string | null> {
  if (!id) return null;
  const db = await openCacheDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(BLOB_STORE, "readonly");
      const req = tx.objectStore(BLOB_STORE).get(id);
      req.onsuccess = () => {
        const record = req.result as { blob?: Blob } | undefined;
        if (record?.blob && typeof URL !== "undefined") {
          resolve(URL.createObjectURL(record.blob));
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function getCachedSymbolBlobUrlBySrc(imageUrl: string): Promise<string | null> {
  if (!imageUrl || !/^https?:\/\//i.test(imageUrl)) return null;
  return getCachedSymbolBlobUrl(`src:${imageUrl}`);
}
