import React, { useState } from 'react';
import { OctagonX, Ban, LogOut, Check } from 'lucide-react';

export type SafetyAction = 'NO' | 'STOP' | 'I_NEED_OUT';

interface ExitBarProps {
  onTrigger?: (action: SafetyAction) => void;
  onExitScreen?: () => void;
  activeLabel?: string;
}

export const ExitBar: React.FC<ExitBarProps> = ({
  onTrigger,
  onExitScreen,
  activeLabel,
}) => {
  const [acknowledged, setAcknowledged] = useState<{
    action: SafetyAction;
    text: string;
  } | null>(null);

  const handleAction = (action: SafetyAction, text: string) => {
    // Immediate action — never ask "Are you sure?" or block refusal
    setAcknowledged({ action, text });
    onTrigger?.(action);

    if (action === 'I_NEED_OUT') {
      onExitScreen?.();
    }
  };

  return (
    <section
      aria-label="Immediate refusal and exit controls"
      className="sticky top-0 z-50 w-full border-b-2 border-slate-900 bg-slate-950 text-white print:hidden"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:px-4">
        <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:gap-3">
          <button
            type="button"
            onClick={() => handleAction('NO', 'No')}
            aria-label="No"
            className="flex min-h-[54px] items-center justify-center gap-2 rounded-lg border-2 border-amber-300 bg-amber-400 px-4 py-2.5 text-lg font-extrabold tracking-wide text-slate-950 transition active:scale-[0.98]"
          >
            <Ban className="h-6 w-6 shrink-0" strokeWidth={2.6} />
            <span>NO</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction('STOP', 'Stop')}
            aria-label="Stop"
            className="flex min-h-[54px] items-center justify-center gap-2 rounded-lg border-2 border-rose-300 bg-rose-600 px-4 py-2.5 text-lg font-extrabold tracking-wide text-white transition active:scale-[0.98]"
          >
            <OctagonX className="h-6 w-6 shrink-0" strokeWidth={2.6} />
            <span>STOP</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction('I_NEED_OUT', 'I need out')}
            aria-label="I need out"
            className="flex min-h-[54px] items-center justify-center gap-2 rounded-lg border-2 border-sky-200 bg-sky-700 px-4 py-2.5 text-base font-extrabold tracking-wide text-white transition active:scale-[0.98] sm:text-lg"
          >
            <LogOut className="h-6 w-6 shrink-0" strokeWidth={2.6} />
            <span>I NEED OUT</span>
          </button>
        </div>

        {acknowledged && (
          <div
            role="status"
            aria-live="polite"
            className="flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-100 sm:w-auto sm:gap-4"
          >
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400" strokeWidth={2.8} />
              <span>
                Selected: <strong>{acknowledged.text}</strong>
                {activeLabel ? ` (${activeLabel})` : ''}
              </span>
            </span>

            <button
              type="button"
              onClick={() => setAcknowledged(null)}
              className="rounded border border-slate-600 px-2.5 py-1 text-xs font-bold text-slate-200 hover:bg-slate-800"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </section>
  );
};