import React from 'react';
import { Trash2, Copy } from 'lucide-react';
import type { CellBorderStyle, CellDisplayMode, StudioCell } from '../../types/studio';

interface Props {
  cell: StudioCell | null;
  onUpdate: (patch: Partial<StudioCell>) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onSaveWordBinding?: (cell: StudioCell) => void;
  savedBindingNotice?: boolean;
}

const DISPLAY_MODES: { value: CellDisplayMode; label: string }[] = [
  { value: 'symbol-text-below', label: 'Symbol + Text Below' },
  { value: 'symbol-text-above', label: 'Symbol + Text Above' },
  { value: 'symbol-only', label: 'Symbol Only (Guess / AAC)' },
  { value: 'text-only', label: 'Text Only' },
];

const SKIN_TONE_SWATCHES = [
  { label: 'Default', color: '' },
  { label: 'Light', color: '#FDE2D2' },
  { label: 'Medium-Light', color: '#E8B89A' },
  { label: 'Medium', color: '#C68642' },
  { label: 'Medium-Dark', color: '#8D5524' },
  { label: 'Deep', color: '#5C3824' },
  { label: 'Yellow Bus', color: '#FACC15' },
  { label: 'Sky Blue', color: '#38BDF8' },
];

const FITZGERALD_SWATCHES = [
  { label: 'Person (Amber)', color: '#D97706', bg: '#FFFBEB' },
  { label: 'Verb (Emerald)', color: '#059669', bg: '#ECFDF5' },
  { label: 'Noun (Orange)', color: '#E36C2B', bg: '#FFF7ED' },
  { label: 'Descriptor (Sky)', color: '#0284C7', bg: '#F0F9FF' },
  { label: 'Social (Rose)', color: '#E11D48', bg: '#FFF1F2' },
  { label: 'Neutral Slate', color: '#334155', bg: '#FFFFFF' },
];

export const CellInspector: React.FC<Props> = ({
  cell,
  onUpdate,
  onDuplicate,
  onDelete,
  onSaveWordBinding,
  savedBindingNotice,
}) => {
  if (!cell) {
    return (
      <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs print:hidden">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
          Cell Inspector
        </h3>
        <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">
          Click any cell on the canvas to switch between <strong>Symbol + Text</strong>,{' '}
          <strong>Symbol Only</strong>, or <strong>Text Only</strong>, edit captions
          independently, or apply Colourful Semantics / Fitzgerald Key borders.
        </p>
      </aside>
    );
  }

  return (
    <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs print:hidden">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
          Cell Inspector
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDuplicate(cell.id)}
            title="Duplicate cell"
            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(cell.id)}
            title="Remove cell"
            className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-600">
          Cell Display Mode
        </label>
        <div className="mt-1.5 grid grid-cols-1 gap-1.5">
          {DISPLAY_MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => onUpdate({ displayMode: m.value })}
              className={`rounded-lg border px-2.5 py-1.5 text-left text-xs font-bold transition ${
                cell.displayMode === m.value
                  ? 'border-[#E36C2B] bg-orange-50 text-slate-900'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={() => onUpdate({ negated: !cell.negated })}
          className={`w-full rounded-lg border px-2.5 py-1.5 text-xs font-extrabold transition ${cell.negated ? 'border-red-600 bg-red-600 text-white' : 'border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100'}`}
        >
          {cell.negated ? 'Negation Badge Active (No / Not)' : 'Mark as Negative (No / Not)'}
        </button>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-600">
          Independent Cell Caption
        </label>
        <input
          type="text"
          value={cell.caption}
          onChange={(e) => onUpdate({ caption: e.target.value })}
          placeholder="Custom label (keeps symbol)"
          className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:border-slate-600 focus:outline-none"
        />
      </div>

      <div>
        <span className="block text-[11px] font-bold text-slate-600">
          SVG Skin Tone &amp; Object Recolour
        </span>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {SKIN_TONE_SWATCHES.map((tone) => (
            <button
              key={tone.label}
              type="button"
              title={tone.label}
              onClick={() => onUpdate({ symbolTintColor: tone.color || undefined })}
              className={`flex h-6 items-center gap-1 rounded-md border px-1.5 text-[10px] font-bold ${(cell.symbolTintColor || '') === tone.color ? 'border-[#E36C2B] bg-orange-50 text-slate-900' : 'border-slate-200 bg-white text-slate-700'}`}
            >
              <span
                className="h-3 w-3 rounded-full border border-slate-300"
                style={{ backgroundColor: tone.color || '#FFFFFF' }}
              />
              <span>{tone.label === 'Default' ? 'Reset' : ''}</span>
            </button>
          ))}
        </div>
      </div>

      {onSaveWordBinding && (
        <div>
          <button
            type="button"
            onClick={() => onSaveWordBinding(cell)}
            className="w-full rounded-lg border border-emerald-600 bg-emerald-50 px-2.5 py-1.5 text-xs font-extrabold text-emerald-900 hover:bg-emerald-100"
          >
            {savedBindingNotice ? 'Saved to Device Word List ✓' : 'Save Word → Symbol to Device'}
          </button>
        </div>
      )}

      <div>
        <span className="block text-[11px] font-bold text-slate-600">
          Colourful Semantics / Fitzgerald Key
        </span>
        <div className="mt-1.5 grid grid-cols-3 gap-1.5">
          {FITZGERALD_SWATCHES.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() =>
                onUpdate({
                  style: {
                    ...cell.style,
                    borderColor: s.color,
                    backgroundColor: s.bg,
                  },
                })
              }
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-50"
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="truncate">{s.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-bold text-slate-600">
            Border Colour
          </label>
          <input
            type="color"
            value={cell.style.borderColor}
            onChange={(e) =>
              onUpdate({ style: { ...cell.style, borderColor: e.target.value } })
            }
            className="mt-1 h-8 w-full cursor-pointer rounded border border-slate-300"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-600">
            Cell Fill
          </label>
          <input
            type="color"
            value={cell.style.backgroundColor}
            onChange={(e) =>
              onUpdate({
                style: { ...cell.style, backgroundColor: e.target.value },
              })
            }
            className="mt-1 h-8 w-full cursor-pointer rounded border border-slate-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[11px] font-bold text-slate-600">
            Width (px)
          </label>
          <input
            type="number"
            min={0}
            max={8}
            value={cell.style.borderWidth}
            onChange={(e) =>
              onUpdate({
                style: { ...cell.style, borderWidth: Number(e.target.value) },
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-600">
            Style
          </label>
          <select
            value={cell.style.borderStyle}
            onChange={(e) =>
              onUpdate({
                style: {
                  ...cell.style,
                  borderStyle: e.target.value as CellBorderStyle,
                },
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-1.5 py-1 text-xs font-semibold"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-600">
            Radius
          </label>
          <input
            type="number"
            min={0}
            max={32}
            value={cell.style.borderRadius}
            onChange={(e) =>
              onUpdate({
                style: { ...cell.style, borderRadius: Number(e.target.value) },
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold"
          />
        </div>
      </div>
    </aside>
  );
};
