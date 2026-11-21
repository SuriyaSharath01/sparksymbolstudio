export type SymbolSource = "mulberry" | "openmoji" | "twemoji" | "globalsymbols_api" | "opensymbols_api" | "photo" | "ai-generated";

export type SymbolLicense = "CC BY-SA 4.0" | "CC BY-SA 2.0" | "CC BY 4.0" | "Mixed" | "Local Photo" | "Unknown";

export interface SymbolAsset {
  id: string;
  label: string;
  imagePath: string;
  source: SymbolSource;
  license: SymbolLicense | string;
  commercialSafe: boolean;
}
