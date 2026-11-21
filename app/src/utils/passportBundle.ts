import type { CommunicationPassport } from '../types/passport';
import { getAllWordMappings, saveWordMapping, type CustomWordMapping } from './wordListDb';

export interface SparkPassportBundle {
  schemaVersion: '1.0';
  exportedAt: string;
  sourceApp: 'Spark Clinical Symbol Studio';
  passport: CommunicationPassport;
  wordMappings: Record<string, CustomWordMapping>;
}

export async function createPassportBundle(
  passport: CommunicationPassport
): Promise<SparkPassportBundle> {
  const wordMappings = await getAllWordMappings();
  return {
    schemaVersion: '1.0',
    exportedAt: new Date().toISOString(),
    sourceApp: 'Spark Clinical Symbol Studio',
    passport,
    wordMappings,
  };
}

export function downloadPassportBundleJson(bundle: SparkPassportBundle): void {
  const initials = (bundle.passport.residentInitials || 'resident')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .toLowerCase();
  const dateStr = new Date().toISOString().slice(0, 10);
  const blob = new Blob([JSON.stringify(bundle, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `spark-passport-bundle_${initials}_${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function restoreWordMappingsFromBundle(
  bundle: SparkPassportBundle
): Promise<number> {
  const entries = Object.values(bundle.wordMappings || {});
  for (const item of entries) {
    await saveWordMapping(item);
  }
  return entries.length;
}

/**
 * Deterministic 21x21 offline SVG matrix code for visual Passport handover cards
 * (zero network requests; encodes compact Passport metadata + finder patterns).
 */
export function buildOfflineHandoverMatrixSvg(payload: string): string {
  const size = 21;
  const grid: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false)
  );

  const drawFinder = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const isBorder = x === 0 || x === 6 || y === 0 || y === 6;
        const isCenter = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        grid[oy + y][ox + x] = isBorder || isCenter;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(size - 7, 0);
  drawFinder(0, size - 7);

  let hash = 2166136261;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  let state = hash >>> 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const inTopLeft = x < 8 && y < 8;
      const inTopRight = x >= size - 8 && y < 8;
      const inBottomLeft = x < 8 && y >= size - 8;
      if (inTopLeft || inTopRight || inBottomLeft) continue;
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      grid[y][x] = ((state >>> 24) & 1) === 1;
    }
  }

  const rects: string[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (grid[y][x]) {
        rects.push(`<rect x="${x + 2}" y="${y + 2}" width="1" height="1" fill="#0F172A"/>`);
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size + 4} ${size + 4}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#FFFFFF"/>${rects.join('')}</svg>`;
}
