import { useEffect, useState, useCallback } from 'react';
import { ShieldCheck, Wifi, WifiOff, Database, HardDrive, X, RefreshCw, Download, CheckCircle2 } from 'lucide-react';

interface TelemetryState {
  isOnline: boolean;
  swActive: boolean;
  swScript: string;
  cachedBlobCount: number | null;
  cachedSwSymbols: number;
  usageMb: string | null;
  quotaMb: string | null;
}

function readSymbolBlobCount(): Promise<number | null> {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open('spark_symbol_cache_v1', 1);
      req.onerror = () => resolve(null);
      req.onsuccess = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('symbol_blobs')) {
          db.close();
          resolve(0);
          return;
        }
        const tx = db.transaction('symbol_blobs', 'readonly');
        const store = tx.objectStore('symbol_blobs');
        const countReq = store.count();
        countReq.onsuccess = () => {
          const count = countReq.result;
          db.close();
          resolve(count);
        };
        countReq.onerror = () => {
          db.close();
          resolve(null);
        };
      };
    } catch {
      resolve(null);
    }
  });
}

async function countCachedSwSymbols(): Promise<number> {
  try {
    const cache = await caches.open('spark-offline-v4');
    const keys = await cache.keys();
    return keys.filter((req) => new URL(req.url).pathname.startsWith('/symbols/')).length;
  } catch {
    return 0;
  }
}

export default function OfflineStatusPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [precaching, setPrecaching] = useState(false);
  const [precacheProgress, setPrecacheProgress] = useState<{ done: number; total: number } | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    swActive: false,
    swScript: 'Not registered',
    cachedBlobCount: null,
    cachedSwSymbols: 0,
    usageMb: null,
    quotaMb: null,
  });

  const refreshTelemetry = useCallback(async () => {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    let swActive = false;
    let swScript = 'None';

    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration().catch(() => undefined);
      const activeWorker = navigator.serviceWorker.controller || reg?.active;
      if (activeWorker) {
        swActive = true;
        swScript = activeWorker.scriptURL.split('/').pop() || 'sw.js';
      }
    }

    const [cachedBlobCount, cachedSwSymbols] = await Promise.all([
      readSymbolBlobCount(),
      countCachedSwSymbols(),
    ]);

    let usageMb: string | null = null;
    let quotaMb: string | null = null;
    if (navigator.storage?.estimate) {
      const est: StorageEstimate = await navigator.storage.estimate().catch((): StorageEstimate => ({}));
      if (typeof est.usage === 'number') {
        usageMb = (est.usage / (1024 * 1024)).toFixed(1);
      }
      if (typeof est.quota === 'number') {
        quotaMb = (est.quota / (1024 * 1024)).toFixed(0);
      }
    }

    setTelemetry({
      isOnline,
      swActive,
      swScript,
      cachedBlobCount,
      cachedSwSymbols,
      usageMb,
      quotaMb,
    });
  }, []);

  useEffect(() => {
    void refreshTelemetry();
    const handleOnline = () => void refreshTelemetry();
    const handleOffline = () => void refreshTelemetry();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshTelemetry]);

  useEffect(() => {
    if (isOpen) {
      void refreshTelemetry();
    }
  }, [isOpen, refreshTelemetry]);

  const handleDownloadFullOfflinePack = async () => {
    if (precaching || !navigator.onLine) return;
    setPrecaching(true);
    try {
      const csvRes = await fetch('/symbol-info.csv');
      const csvText = await csvRes.text();
      const lines = csvText.split(/\r?\n/).slice(1).filter(Boolean);
      const urls = Array.from(
        new Set(
          lines
            .map((line) => line.split(',')[5]?.trim())
            .filter(Boolean)
            .map((name) => `/symbols/${encodeURIComponent(name)}.svg`)
        )
      );

      const cache = await caches.open('spark-offline-v4');
      await cache.addAll([
        '/fonts/OpenDyslexic-Regular.woff2',
        '/fonts/OpenDyslexic-Bold.woff2',
      ]);

      const batchSize = 40;
      let done = 0;
      setPrecacheProgress({ done: 0, total: urls.length });

      for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (url) => {
            try {
              const existing = await cache.match(url);
              if (!existing) {
                const res = await fetch(url);
                if (res.ok) {
                  await cache.put(url, res);
                }
              }
            } catch {
              // skip any missing individual file
            }
          })
        );
        done = Math.min(i + batch.length, urls.length);
        setPrecacheProgress({ done, total: urls.length });
      }

      await refreshTelemetry();
    } finally {
      setPrecaching(false);
    }
  };

  return (
    <div className="no-print fixed bottom-4 left-4 z-40">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-slate-800"
      >
        {telemetry.isOnline ? (
          <Wifi className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <WifiOff className="h-3.5 w-3.5 text-amber-400" />
        )}
        <span>System &amp; Offline</span>
      </button>

      {isOpen && (
        <div className="fixed bottom-16 left-4 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-700 bg-slate-900 p-4 text-white shadow-2xl">
          <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div>
              <h3 className="text-sm font-extrabold text-white">System &amp; Offline Telemetry</h3>
              <p className="text-[11px] text-slate-400">Live runtime &amp; local cache verification</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => void refreshTelemetry()}
                title="Refresh telemetry"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close panel"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-slate-300">
                {telemetry.isOnline ? (
                  <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <WifiOff className="h-3.5 w-3.5 text-amber-400" />
                )}
                Network State
              </span>
              <span className={`font-mono font-bold ${telemetry.isOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
                {telemetry.isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Service Worker
              </span>
              <span className={`font-mono font-bold ${telemetry.swActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                {telemetry.swActive ? `ACTIVE (${telemetry.swScript})` : 'INACTIVE'}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Database className="h-3.5 w-3.5 text-sky-400" />
                Offline SVGs / Blobs
              </span>
              <span className="font-mono font-bold text-sky-400">
                {telemetry.cachedSwSymbols} SVGs · {telemetry.cachedBlobCount ?? 0} IDB
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-slate-300">
                <HardDrive className="h-3.5 w-3.5 text-purple-400" />
                Origin Storage
              </span>
              <span className="font-mono font-bold text-purple-300">
                {telemetry.usageMb && telemetry.quotaMb ? `${telemetry.usageMb} / ${telemetry.quotaMb} MB` : 'Unavailable'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
                Licence Policy
              </span>
              <span className="font-mono font-bold text-amber-300">COMMERCIAL-SAFE</span>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <button
              type="button"
              disabled={precaching || !telemetry.isOnline}
              onClick={() => void handleDownloadFullOfflinePack()}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {telemetry.cachedSwSymbols >= 3400 ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  All 3,435+ Symbols Cached Offline
                </>
              ) : precaching && precacheProgress ? (
                <span>
                  Caching Symbols ({precacheProgress.done} / {precacheProgress.total})...
                </span>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  Download Full Offline Symbol Pack
                </>
              )}
            </button>

            {precacheProgress && (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  style={{
                    width: `${Math.round((precacheProgress.done / Math.max(precacheProgress.total, 1)) * 100)}%`,
                  }}
                  className="h-full bg-emerald-400 transition-all"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
