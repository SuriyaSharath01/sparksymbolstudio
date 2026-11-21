import type { SymbolAsset } from "../types/symbols";
import { filterCommercialSafe, loadOpenMojiCatalog, searchLocalSymbols } from "./symbolSearch";
import { cacheSymbolAssets, cacheSymbolBlob, getCachedSymbolsByQuery } from "./symbolCacheDb";

interface OpenSymbolsApiHit {
  id?: string | number;
  name?: string;
  image_url?: string;
  license?: string;
  repo?: string;
}

const COMMERCIAL_SAFE_LICENSES = new Set([
  "cc-by-sa-4.0",
  "cc by-sa 4.0",
  "cc-by-sa-2.0",
  "cc by-sa 2.0",
  "cc-by-4.0",
  "cc by 4.0",
  "cc-by-2.0",
  "cc by 2.0",
  "cc0",
  "public domain",
  "mit",
]);

export function isLicenseCommercialSafe(licenseText?: string): boolean {
  if (!licenseText) return false;
  const normalized = licenseText.trim().toLowerCase();
  if (normalized.includes("nc") || normalized.includes("non-commercial")) {
    return false;
  }
  return COMMERCIAL_SAFE_LICENSES.has(normalized);
}

export async function persistRemoteSymbolOffline(asset: SymbolAsset): Promise<void> {
  if (!asset.commercialSafe) return;
  await cacheSymbolAssets([asset]);
  if (asset.imagePath.startsWith("http")) {
    await cacheSymbolBlob(asset.id, asset.imagePath);
  }
}

export async function searchSymbolsCommercialSafe(
  query: string,
  options: { includeRemote?: boolean; timeoutMs?: number } = {}
): Promise<SymbolAsset[]> {
  const openMojiList = query.trim() ? await loadOpenMojiCatalog() : [];
  const localMatches = filterCommercialSafe(searchLocalSymbols(query, openMojiList));
  const cachedMatches = query.trim() ? await getCachedSymbolsByQuery(query) : [];

  const mergedBase = new Map<string, SymbolAsset>();
  for (const item of [...localMatches, ...cachedMatches]) {
    mergedBase.set(item.imagePath, item);
  }

  if (!options.includeRemote || !query.trim()) {
    return filterCommercialSafe(Array.from(mergedBase.values()));
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), options.timeoutMs ?? 5000);

  try {
    const url = `https://www.opensymbols.org/api/v1/symbols/search?q=${encodeURIComponent(query.trim())}`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return filterCommercialSafe(Array.from(mergedBase.values()));

    const data = (await res.json()) as OpenSymbolsApiHit[];
    if (!Array.isArray(data)) return filterCommercialSafe(Array.from(mergedBase.values()));

    const safeRemote: SymbolAsset[] = [];

    for (const hit of data) {
      if (!hit.image_url || !hit.name) continue;
      if (!isLicenseCommercialSafe(hit.license)) continue;
      if (mergedBase.has(hit.image_url)) continue;

      const asset: SymbolAsset = {
        id: `remote_${hit.id ?? safeRemote.length}`,
        label: hit.name,
        imagePath: hit.image_url,
        source: "globalsymbols_api",
        license: "Mixed",
        commercialSafe: true,
      };
      mergedBase.set(hit.image_url, asset);
      safeRemote.push(asset);
    }

    if (safeRemote.length > 0) {
      void cacheSymbolAssets(safeRemote);
    }

    return filterCommercialSafe(Array.from(mergedBase.values()));
  } catch {
    return filterCommercialSafe(Array.from(mergedBase.values()));
  } finally {
    window.clearTimeout(timer);
  }
}
