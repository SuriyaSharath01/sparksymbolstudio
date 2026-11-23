import QRCode from 'qrcode';
import type { SymbolTheme } from '../components/common/SparkSymbol';

export interface QrBridgeCard {
  w: string; // Word / phrase label
  s?: string; // Compact symbol path (e.g. "spark_cup_of_tea" or "healthicons/places/hospital")
}

export interface QrBridgePayload {
  t: string; // Title
  sub?: string; // Subtitle
  th?: SymbolTheme; // Visual theme
  l: string[]; // Full sentences
  c: QrBridgeCard[]; // Key tap-to-speak cards
}

export function compactSymbolPath(svgPath?: string | null): string | undefined {
  if (!svgPath) return undefined;
  if (svgPath.startsWith('/symbols/') && svgPath.endsWith('.svg')) {
    return svgPath.slice('/symbols/'.length, -'.svg'.length);
  }
  return svgPath;
}

export function expandSymbolPath(compact?: string): string | undefined {
  if (!compact) return undefined;
  if (compact.startsWith('/') || compact.startsWith('http://') || compact.startsWith('https://')) {
    return compact;
  }
  return `/symbols/${compact}.svg`;
}

function encodeBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeBase64Url(encoded: string): string {
  const padded = encoded.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((encoded.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function buildKioskQrUrl(payload: QrBridgePayload, origin?: string): string {
  const safePayload: QrBridgePayload = {
    t: (payload.t || 'Spark Communication Sheet').slice(0, 72),
    sub: payload.sub ? payload.sub.slice(0, 80) : undefined,
    th: payload.th || 'color',
    l: (payload.l || []).slice(0, 6).map((line) => line.slice(0, 140)),
    c: (payload.c || []).slice(0, 16).map((item) => ({
      w: item.w.slice(0, 32),
      s: compactSymbolPath(item.s),
    })),
  };

  const baseOrigin =
    origin ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://spark-symbol-studio.vercel.app');
  const encoded = encodeBase64Url(JSON.stringify(safePayload));
  return `${baseOrigin}/kiosk#v1=${encoded}`;
}

export function decodeKioskPayloadFromHash(hash: string): QrBridgePayload | null {
  if (!hash) return null;
  const match = hash.match(/v1=([A-Za-z0-9_-]+)/);
  if (!match) return null;
  try {
    const jsonStr = decodeBase64Url(match[1]);
    const parsed = JSON.parse(jsonStr) as QrBridgePayload;
    if (!parsed || typeof parsed.t !== 'string') return null;
    return {
      t: parsed.t,
      sub: typeof parsed.sub === 'string' ? parsed.sub : undefined,
      th: parsed.th === 'high-contrast' || parsed.th === 'mono' ? parsed.th : 'color',
      l: Array.isArray(parsed.l) ? parsed.l.filter((x) => typeof x === 'string') : [],
      c: Array.isArray(parsed.c)
        ? parsed.c
            .filter((x) => x && typeof x.w === 'string')
            .map((x) => ({ w: x.w, s: expandSymbolPath(x.s) }))
        : [],
    };
  } catch {
    return null;
  }
}

export async function generateQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 220,
    color: {
      dark: '#0F172A',
      light: '#FFFFFF',
    },
  });
}
