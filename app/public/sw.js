const CACHE_NAME = 'spark-offline-v4';

const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <rect x="6" y="6" width="108" height="108" rx="16" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="3" stroke-dasharray="6 4"/>
  <circle cx="60" cy="48" r="18" fill="none" stroke="#64748B" stroke-width="3.5"/>
  <path d="M34 86c5-12 15-18 26-18s21 6 26 18" fill="none" stroke="#64748B" stroke-width="3.5" stroke-linecap="round"/>
</svg>`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll([
        '/',
        '/index.html',
        '/favicon.svg',
        '/icons.svg',
        '/openmoji-index.json',
        '/symbol-info.csv',
        '/fonts/OpenDyslexic-Regular.woff2',
        '/fonts/OpenDyslexic-Bold.woff2',
      ]);
      try {
        const res = await fetch('/index.html', { cache: 'no-store' });
        const html = await res.text();
        const assetMatches = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1]);
        if (assetMatches.length > 0) {
          await cache.addAll(assetMatches);
        }
      } catch {
        // ignore if offline during install
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isOpenMojiCdn = url.hostname === 'cdn.jsdelivr.net' && url.pathname.includes('openmoji');
  if (!isSameOrigin && !isOpenMojiCdn) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request)
          .then((res) => {
            if (res.ok || res.type === 'opaque') {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return res;
          })
          .catch(() => {
            if (url.pathname.endsWith('.svg')) {
              return new Response(FALLBACK_SVG, {
                status: 200,
                headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
              });
            }
            return new Response('', { status: 503, statusText: 'Offline' });
          })
    )
  );
});
