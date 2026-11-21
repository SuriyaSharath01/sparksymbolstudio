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
    setAcknowledged({ action, text });
    onTrigger?.(action);

    if (action === 'I_NEED_OUT') {
      onExitScreen?.();
    }
  };

  return (
    <section
      aria-label="Immediate refusal and exit controls"
      className="no-print sticky top-0 z-50 w-full border-b-2 border-slate-200 bg-white/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-3.5">
        <div className="grid w-full grid-cols-3 gap-3 sm:flex sm:w-auto">
          <button
            type="button"
            onClick={() => handleAction('NO', 'No')}
            aria-label="No"
            className="flex min-h-[50px] items-center justify-center gap-2 rounded-lg border-2 border-red-400 bg-red-100 px-6 py-2.5 text-base font-bold tracking-wide text-red-900 transition hover:bg-red-200 active:scale-[0.98]"
          >
            <Ban strokeWidth={2.4} />
            <span>NO</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction('STOP', 'Stop')}
            aria-label="Stop"
            className="flex min-h-[50px] items-center justify-center gap-2 rounded-lg border-2 border-red-600 bg-red-50 px-6 py-2.5 text-base font-bold tracking-wide text-red-950 transition hover:bg-red-100 active:scale-[0.98]"
          >
            <OctagonX strokeWidth={2.4} />
            <span>STOP</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction('I_NEED_OUT', 'I need out')}
            aria-label="I need out"
            className="flex min-h-[50px] items-center justify-center gap-2 rounded-lg border-2 border-slate-400 bg-slate-100 px-6 py-2.5 text-base font-bold tracking-wide text-slate-900 transition hover:bg-slate-200 active:scale-[0.98]"
          >
            <LogOut strokeWidth={2.4} />
            <span>I NEED OUT</span>
          </button>
        </div>

        {acknowledged && (
          <div
            role="status"
            aria-live="polite"
            className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-800 sm:w-auto sm:gap-4"
          >
            <span className="flex items-center gap-2">
              <Check className="text-emerald-700" strokeWidth={2.6} />
              <span>
                Selected: <strong>{acknowledged.text}</strong>
                {activeLabel ? ` (${activeLabel})` : ''}
              </span>
            </span>

            <button
              type="button"
              onClick={() => setAcknowledged(null)}
              className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
