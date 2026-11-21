import { useEffect, useState, useCallback } from 'react';
import { ShieldCheck, Wifi, WifiOff, Database, HardDrive, X, RefreshCw } from 'lucide-react';

interface TelemetryState {
  isOnline: boolean;
  swActive: boolean;
  swScript: string;
  cachedBlobCount: number | null;
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

export default function OfflineStatusPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    swActive: false,
    swScript: 'Not registered',
    cachedBlobCount: null,
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

    const cachedBlobCount = await readSymbolBlobCount();

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
                IDB Symbol Blobs
              </span>
              <span className="font-mono font-bold text-sky-400">
                {telemetry.cachedBlobCount !== null ? `${telemetry.cachedBlobCount} stored` : 'Checking...'}
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

          <p className="mt-3 rounded-lg bg-slate-800/70 p-2 text-[11px] leading-snug text-slate-300">
            Local Mulberry symbols &amp; shell cache in browser storage; remote symbol blobs persist in IndexedDB.
          </p>
        </div>
      )}
    </div>
  );
}
