import React, { useState } from 'react';
import { Delete, Lock, RotateCcw, Unlock, Volume2 } from 'lucide-react';
import type { StudioCell, StudioPage } from '../../types/studio';

interface Props {
  page: StudioPage;
  onExit: () => void;
}

export const LiveTalkerOverlay: React.FC<Props> = ({ page, onExit }) => {
  const [spokenStrip, setSpokenStrip] = useState<StudioCell[]>([]);
  const [staffPin] = useState<string>('1234');
  const [showUnlockPrompt, setShowUnlockPrompt] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);

  const speakPhrase = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  };

  const handleCellTap = (cell: StudioCell) => {
    const phrase = cell.negated ? `No ${cell.caption}` : cell.caption;
    setSpokenStrip((prev) => [...prev, cell]);
    speakPhrase(phrase);
  };

  const handleSpeakStrip = () => {
    if (!spokenStrip.length) return;
    const sentence = spokenStrip
      .map((c) => (c.negated ? `No ${c.caption}` : c.caption))
      .join(' ');
    speakPhrase(sentence);
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === staffPin) {
      onExit();
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  return (
    <div
      style={{ backgroundColor: page.background }}
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto p-4 sm:p-6"
    >
      {/* Top AAC Sentence Bar & PIN Exit */}
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-slate-300 bg-white p-3 shadow-sm">
        <div className="flex min-h-[56px] flex-1 flex-wrap items-center gap-2">
          {spokenStrip.length === 0 ? (
            <span className="px-2 text-sm font-bold text-slate-400">
              Tap any card below to speak aloud...
            </span>
          ) : (
            spokenStrip.map((item, idx) => (
              <span
                key={`${item.id}-${idx}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-1 text-sm font-extrabold text-slate-900"
              >
                {item.symbolSrc && (
                  <img src={item.symbolSrc} alt="" className="h-6 w-6 object-contain" />
                )}
                <span>{item.negated ? `NO: ${item.caption}` : item.caption}</span>
              </span>
            ))
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSpeakStrip}
            disabled={spokenStrip.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#E36C2B] px-4 py-2.5 text-xs font-extrabold text-white hover:bg-[#c85a1e] disabled:opacity-40"
          >
            <Volume2 className="h-4 w-4" />
            Speak Strip
          </button>
          <button
            type="button"
            onClick={() => setSpokenStrip((prev) => prev.slice(0, -1))}
            disabled={spokenStrip.length === 0}
            aria-label="Backspace"
            className="rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
          >
            <Delete className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setSpokenStrip([])}
            disabled={spokenStrip.length === 0}
            aria-label="Clear strip"
            className="rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setShowUnlockPrompt((v) => !v);
              setPinError(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-900 bg-slate-900 px-3 py-2.5 text-xs font-extrabold text-white hover:bg-slate-800"
          >
            <Lock className="h-3.5 w-3.5" />
            Staff Exit
          </button>
        </div>
      </div>

      {/* Staff PIN Unlock Drawer */}
      {showUnlockPrompt && (
        <form
          onSubmit={handleVerifyPin}
          className="mx-auto mt-3 flex w-full max-w-md items-center justify-between gap-2 rounded-2xl border border-slate-300 bg-white p-3.5 shadow-md"
        >
          <div className="flex items-center gap-2">
            <Unlock className="h-4 w-4 text-[#E36C2B]" />
            <span className="text-xs font-extrabold text-slate-800">
              Enter Staff PIN (1234):
            </span>
          </div>
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="••••"
            className="w-24 rounded-lg border border-slate-300 px-2.5 py-1 text-center text-sm font-extrabold tracking-widest"
          />
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-extrabold text-white"
          >
            Unlock
          </button>
          {pinError && (
            <span className="text-[11px] font-bold text-red-600">Wrong PIN</span>
          )}
        </form>
      )}

      {/* Touch-to-Speak AAC Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${page.columns}, minmax(0, 1fr))`,
          gap: `${Math.max(page.gapPx, 16)}px`,
        }}
        className="mx-auto mt-5 w-full max-w-6xl flex-1"
      >
        {page.cells.map((cell) => (
          <button
            key={cell.id}
            type="button"
            onClick={() => handleCellTap(cell)}
            style={{
              borderColor: cell.style.borderColor,
              borderWidth: `${Math.max(cell.style.borderWidth, 3)}px`,
              borderStyle: cell.style.borderStyle,
              borderRadius: `${cell.style.borderRadius}px`,
              backgroundColor: cell.style.backgroundColor,
            }}
            className="relative flex min-h-[150px] flex-col items-center justify-center p-4 text-center shadow-sm transition active:scale-[0.98]"
          >
            {cell.negated && (
              <span className="absolute top-2.5 right-2.5 rounded-md bg-red-600 px-2 py-0.5 text-xs font-black text-white">
                NO / NOT
              </span>
            )}
            {cell.displayMode !== 'text-only' && cell.symbolSrc && (
              <img
                src={cell.symbolSrc}
                alt={cell.caption}
                className="max-h-28 w-auto max-w-full object-contain"
              />
            )}
            {cell.displayMode !== 'symbol-only' && (
              <span className="mt-2.5 text-base font-extrabold text-slate-900 sm:text-lg">
                {cell.caption}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
