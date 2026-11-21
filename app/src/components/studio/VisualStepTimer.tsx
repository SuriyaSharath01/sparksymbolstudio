import React, { useEffect, useState } from 'react';

interface VisualStepTimerProps {
  totalSeconds: number;
  label?: string;
}

export const VisualStepTimer: React.FC<VisualStepTimerProps> = ({
  totalSeconds,
  label = 'Wait time',
}) => {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setRemaining(totalSeconds);
    setRunning(false);
  }, [totalSeconds]);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const timer = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setRunning(false);
          if ('speechSynthesis' in window) {
            const u = new SpeechSynthesisUtterance(`${label} finished`);
            u.lang = 'en-GB';
            window.speechSynthesis.speak(u);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, remaining, label]);

  const pct = totalSeconds > 0 ? Math.max(0, Math.min(100, (remaining / totalSeconds) * 100)) : 0;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const formatted = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="mt-2.5 w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-left">
      <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-800">
        <span>{remaining === 0 ? 'Finished' : label}</span>
        <span>{formatted}</span>
      </div>
      <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full transition-all duration-500 ${
            pct > 35 ? 'bg-emerald-500' : pct > 15 ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          disabled={remaining === 0}
          className="rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-slate-800 disabled:opacity-40"
        >
          {running ? 'Pause' : 'Start'}
        </button>
        <button
          type="button"
          onClick={() => {
            setRunning(false);
            setRemaining(totalSeconds);
          }}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
        >
          Reset
        </button>
      </div>
    </div>
  );
};
