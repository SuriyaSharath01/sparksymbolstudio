export type CellDisplayMode =
  | 'symbol-text-below'
  | 'symbol-text-above'
  | 'symbol-only'
  | 'text-only';

export type CellBorderStyle = 'solid' | 'dashed' | 'dotted';

export interface CellStyle {
  borderColor: string;
  borderWidth: number;
  borderStyle: CellBorderStyle;
  borderRadius: number;
  backgroundColor: string;
}

export interface StudioCell {
  id: string;
  symbolId: string;
  symbolSrc: string;
  caption: string;
  displayMode: CellDisplayMode;
  negated?: boolean;
  symbolTintColor?: string;
  style: CellStyle;
}

export interface StudioPage {
  id: string;
  title: string;
  orientation: 'portrait' | 'landscape';
  background: string;
  columns: 2 | 3 | 4;
  gapPx: number;
  cells: StudioCell[];
}
