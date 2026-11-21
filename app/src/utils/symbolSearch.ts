import { CORE_CARDS } from "../data/core-cards";
import { RESOURCE_REGISTRY_LIST } from "../data/resource-registry";
import type { SymbolAsset } from "../types/symbols";

interface OpenMojiManifestEntry {
  id: string;
  label: string;
  hex: string;
  group?: string;
}

export function isNonCommercialLicense(license?: string): boolean {
  if (!license) return true;
  const n = license.toLowerCase().trim();
  return n.includes("nc") || n.includes("non-commercial") || n.includes("noncommercial");
}

export function getMulberryCatalog(): SymbolAsset[] {
  const seen = new Map<string, SymbolAsset>();
  for (const card of Object.values(CORE_CARDS)) {
    if (card.imageSrc && card.imageSrc.startsWith("/")) {
      seen.set(card.imageSrc, { id: `mulberry_core_${card.id}`, label: card.label, imagePath: card.imageSrc, source: "mulberry", license: "CC BY-SA 4.0", commercialSafe: true });
    }
  }
  for (const pack of RESOURCE_REGISTRY_LIST) {
    for (const step of pack.steps) {
      if (step.symbol && step.symbol.startsWith("/") && !seen.has(step.symbol)) {
        seen.set(step.symbol, { id: `mulberry_${step.id}`, label: step.label, imagePath: step.symbol, source: "mulberry", license: "CC BY-SA 4.0", commercialSafe: true });
      }
    }
  }
  return Array.from(seen.values());
}

let cachedOpenMojiCatalog: SymbolAsset[] | null = null;

export async function loadOpenMojiCatalog(): Promise<SymbolAsset[]> {
  if (cachedOpenMojiCatalog) return cachedOpenMojiCatalog;
  const mod = await import("../data/openmoji-manifest.json");
  const entries = (mod.default ?? mod) as OpenMojiManifestEntry[];
  cachedOpenMojiCatalog = entries.map((entry) => ({
    id: entry.id,
    label: entry.label,
    imagePath: `https://cdn.jsdelivr.net/npm/openmoji@15.1.0/color/svg/${entry.hex}.svg`,
    source: "openmoji" as const,
    license: "CC BY-SA 4.0",
    commercialSafe: true,
  }));
  return cachedOpenMojiCatalog;
}

export function getOpenMojiCatalog(): SymbolAsset[] {
  return cachedOpenMojiCatalog ?? [];
}

export function filterCommercialSafe(assets: SymbolAsset[]): SymbolAsset[] {
  return assets.filter((item) => Boolean(item.commercialSafe) && !isNonCommercialLicense(item.license));
}

export function searchLocalSymbols(query: string, openMojiAssets: SymbolAsset[] = getOpenMojiCatalog()): SymbolAsset[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const mulberryMatches = getMulberryCatalog().filter((s) => s.label.toLowerCase().includes(q));
  const openMojiMatches = filterCommercialSafe(openMojiAssets).filter((s) => s.label.toLowerCase().includes(q)).map((s) => ({ ...s, source: "openmoji" as const, license: "CC BY-SA 4.0", commercialSafe: true }));
  return filterCommercialSafe([...mulberryMatches, ...openMojiMatches]);
}
