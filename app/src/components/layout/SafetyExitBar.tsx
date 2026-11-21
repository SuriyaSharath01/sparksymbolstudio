import React, { useState } from 'react';

interface SafetyExitBarProps {
  onTriggerExit?: (phrase: string) => void;
}

export const SafetyExitBar: React.FC<SafetyExitBarProps> = ({ onTriggerExit }) => {
  const [calmMode, setCalmMode] = useState(false);
  const [activePhrase, setActivePhrase] = useState<string | null>(null);

  const speakPhrase = (phrase: string, enterCalm = false) => {
    setActivePhrase(phrase);
    if (enterCalm) setCalmMode(true);
    onTriggerExit?.(phrase);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = 'en-GB';
      utterance.rate = 0.92;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-50 border-b-2 border-slate-900 bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
            Always Available
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => speakPhrase('No')}
              className="min-h-[44px] rounded-xl border-2 border-red-800 bg-red-600 px-5 py-2 text-sm font-black tracking-wide text-white shadow-sm transition hover:bg-red-700 active:scale-95"
            >
              NO
            </button>
            <button
              type="button"
              onClick={() => speakPhrase('Stop')}
              className="min-h-[44px] rounded-xl border-2 border-amber-900 bg-amber-500 px-5 py-2 text-sm font-black tracking-wide text-slate-950 shadow-sm transition hover:bg-amber-400 active:scale-95"
            >
              STOP
            </button>
            <button
              type="button"
              onClick={() => speakPhrase('I need a break', true)}
              className="min-h-[44px] rounded-xl border-2 border-slate-900 bg-slate-900 px-5 py-2 text-sm font-black tracking-wide text-white shadow-sm transition hover:bg-slate-800 active:scale-95"
            >
              I NEED OUT / BREAK
            </button>
          </div>
        </div>
      </div>

      {calmMode && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 p-6 text-center text-white">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-300">
            Quiet Space Active
          </p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            {activePhrase || 'Take all the time you need.'}
          </h2>
          <p className="mt-3 max-w-md text-base text-slate-300">
            No rush. No questions. Tap below only when you feel ready to return.
          </p>
          <button
            type="button"
            onClick={() => {
              setCalmMode(false);
              setActivePhrase(null);
            }}
            className="mt-8 min-h-[52px] rounded-2xl border-2 border-emerald-400 bg-emerald-500 px-8 py-3 text-base font-black text-slate-950 transition hover:bg-emerald-400"
          >
            I Am Ready to Return
          </button>
        </div>
      )}
    </>
  );
};
