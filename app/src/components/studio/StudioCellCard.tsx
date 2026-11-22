import React from 'react';
import type { StudioCell } from '../../types/studio';

interface Props {
  cell: StudioCell;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onCaptionChange: (id: string, caption: string) => void;
}

export const StudioCellCard: React.FC<Props> = ({
  cell,
  isSelected,
  onSelect,
  onCaptionChange,
}) => {
  const { displayMode, symbolSrc, caption, style } = cell;

  const renderSymbol = () =>
    displayMode !== 'text-only' && (
      <div className="flex flex-1 items-center justify-center p-1">
        {symbolSrc ? (
          <div className="relative inline-flex items-center justify-center">
            <img
              src={symbolSrc.startsWith('/') ? encodeURI(symbolSrc) : symbolSrc}
              alt={caption}
              style={{ filter: cell.symbolTintColor ? 'contrast(1.15)' : 'contrast(1.08) saturate(1.12)' }}
              className="max-h-24 w-auto max-w-full object-contain print:max-h-28"
            />
            {cell.symbolTintColor && (
              <span
                aria-hidden="true"
                style={{ backgroundColor: cell.symbolTintColor }}
                className="pointer-events-none absolute inset-0 rounded-lg mix-blend-multiply opacity-45"
              />
            )}
          </div>
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-slate-300 text-[11px] font-semibold text-slate-400">
            No symbol
          </div>
        )}
      </div>
    );

  const renderCaption = () => {
    if (displayMode === 'symbol-only') return null;
    return (
      <input
        type="text"
        value={caption}
        onChange={(e) => onCaptionChange(cell.id, e.target.value)}
        onClick={(e) => e.stopPropagation()}
        aria-label="Cell caption"
        className={`min-w-0 w-full rounded bg-transparent px-1 text-center font-extrabold leading-tight text-slate-900 focus:bg-white/80 focus:outline-none ${
          displayMode === 'text-only' ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
        } ${displayMode === 'symbol-text-below' ? 'mt-2' : ''} ${
          displayMode === 'symbol-text-above' ? 'mb-2' : ''
        }`}
      />
    );
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(cell.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(cell.id);
        }
      }}
      style={{
        borderColor: style.borderColor,
        borderWidth: `${style.borderWidth}px`,
        borderStyle: style.borderStyle,
        borderRadius: `${style.borderRadius}px`,
        backgroundColor: style.backgroundColor,
      }}
      className={`group relative flex min-h-[156px] cursor-pointer flex-col items-center justify-center p-3 transition select-none ${
        isSelected
          ? 'ring-3 ring-[#E36C2B] ring-offset-2 print:ring-0 print:ring-offset-0'
          : 'hover:shadow-sm'
      }`}
    >
      {cell.negated && (
        <span className="absolute top-2 right-2 z-10 rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-black tracking-wide text-white shadow-2xs">
          NO / NOT
        </span>
      )}
      {displayMode === 'symbol-text-above' && renderCaption()}
      {renderSymbol()}
      {displayMode === 'symbol-text-below' && renderCaption()}
      {displayMode === 'text-only' && renderCaption()}
    </div>
  );
};
