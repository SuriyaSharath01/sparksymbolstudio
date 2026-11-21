import React, { useEffect, useState } from 'react';
import {
  Check,
  PauseCircle,
  PlayCircle,
  Pin,
  Trash2,
  Clock,
  ChevronLeft,
  ChevronRight,
  ListChecks,
} from 'lucide-react';

export interface FocusStep {
  id: string;
  label: string;
  actionInstruction: string;
  imageSrc?: string;
  imageAlt?: string;
  waitSeconds?: number;
}

interface ParkedThought {
  id: string;
  text: string;
  savedAt: string;
}

interface FocusCardProps {
  routineId: string;
  routineTitle: string;
  steps: FocusStep[];
  onCompleteRoutine?: () => void;
}

export const FocusCard: React.FC<FocusCardProps> = ({
  routineId,
  routineTitle,
  steps,
  onCompleteRoutine,
}) => {
  const storageKey = `carecomm_focus_${routineId}`;
  const parkStorageKey = `carecomm_parked_thoughts`;

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const saved = localStorage.getItem(storageKey);
    const parsed = saved ? Number(saved) : 0;
    return Number.isFinite(parsed) && parsed >= 0 && parsed < steps.length
      ? parsed
      : 0;
  });

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showAllSteps, setShowAllSteps] = useState<boolean>(false);
  const [stepCompletedFlash, setStepCompletedFlash] = useState<boolean>(false);
  const [imgBroken, setImgBroken] = useState<boolean>(false);

  const activeStep = steps[currentIndex];
  const initialWait = activeStep?.waitSeconds ?? 0;
  const [secondsLeft, setSecondsLeft] = useState<number>(initialWait);
  const [timerRunning, setTimerRunning] = useState<boolean>(initialWait > 0);

  const [parkInput, setParkInput] = useState<string>('');
  const [parkedThoughts, setParkedThoughts] = useState<ParkedThought[]>(() => {
    try {
      const raw = localStorage.getItem(parkStorageKey);
      return raw ? (JSON.parse(raw) as ParkedThought[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    setImgBroken(false);
    localStorage.setItem(storageKey, String(currentIndex));
    const nextWait = steps[currentIndex]?.waitSeconds ?? 0;
    setSecondsLeft(nextWait);
    setTimerRunning(nextWait > 0 && !isPaused);
  }, [currentIndex, storageKey, steps, isPaused]);

  useEffect(() => {
    localStorage.setItem(parkStorageKey, JSON.stringify(parkedThoughts));
  }, [parkedThoughts, parkStorageKey]);

  useEffect(() => {
    if (!timerRunning || isPaused || secondsLeft <= 0) return;

    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerRunning, isPaused, secondsLeft]);

  if (!steps.length || !activeStep) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-left text-slate-800">
        <p className="text-lg font-bold">No steps loaded yet.</p>
        <p className="mt-1 text-sm text-slate-600">
          Add a card or choose an outing when you are ready.
        </p>
      </div>
    );
  }

  const handleMarkDone = () => {
    setStepCompletedFlash(true);
    window.setTimeout(() => {
      setStepCompletedFlash(false);
      if (currentIndex < steps.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        onCompleteRoutine?.();
      }
    }, 300);
  };

  const handleParkThought = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = parkInput.trim();
    if (!trimmed) return;

    const item: ParkedThought = {
      id: `park_${Date.now()}`,
      text: trimmed,
      savedAt: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setParkedThoughts((prev) => [item, ...prev]);
    setParkInput('');
  };

  const removeParkedThought = (id: string) => {
    setParkedThoughts((prev) => prev.filter((item) => item.id !== id));
  };

  const totalWait = activeStep.waitSeconds ?? 0;
  const remainingPercent =
    totalWait > 0 ? Math.max(0, Math.min(100, (secondsLeft / totalWait) * 100)) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {isPaused && (
          <div
            role="status"
            className="mb-4 rounded-xl border border-slate-300 bg-slate-100 px-5 py-3.5 text-left text-slate-900"
          >
            <p className="font-bold">Paused — ready when you are.</p>
            <p className="text-sm text-slate-600">
              Your place is saved on Step {currentIndex + 1}. Take as long as you need.
            </p>
          </div>
        )}

        <article
          className={`rounded-2xl border p-8 text-left shadow-xs transition-colors ${
            stepCompletedFlash
              ? 'border-emerald-500 bg-emerald-50/60'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {routineTitle} • Step {currentIndex + 1} of {steps.length}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPaused((p) => !p)}
                className="flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                {isPaused ? (
                  <>
                    <PlayCircle className="text-emerald-700" />
                    <span>Resume</span>
                  </>
                ) : (
                  <>
                    <PauseCircle className="text-slate-600" />
                    <span>Pause</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowAllSteps((s) => !s)}
                className="flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <ListChecks className="text-slate-600" />
                <span>{showAllSteps ? 'One step' : 'All steps'}</span>
              </button>
            </div>
          </div>

          <h2 className="mt-2 mb-6 text-3xl font-extrabold tracking-tight text-slate-900">
            {activeStep.label}
          </h2>

          <div className="mb-6 flex h-56 w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
            {activeStep.imageSrc && !imgBroken ? (
              <img
                src={activeStep.imageSrc}
                alt={activeStep.imageAlt || activeStep.label}
                onError={() => setImgBroken(true)}
                className="max-h-44 w-auto object-contain"
              />
            ) : (
              <div className="rounded-lg bg-slate-200/80 px-5 py-3 text-sm font-bold uppercase tracking-wider text-slate-600">
                {activeStep.label}
              </div>
            )}
          </div>

          <p className="mb-7 text-xl leading-relaxed text-slate-700">
            {activeStep.actionInstruction}
          </p>

          {totalWait > 0 && (
            <div className="mb-7 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Clock className="text-emerald-700" />
                  <span>
                    {secondsLeft > 0
                      ? `Visual time left: ${Math.floor(secondsLeft / 60)}m ${
                          secondsLeft % 60
                        }s`
                      : 'Time finished — ready when you are'}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setSecondsLeft(totalWait)}
                  className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Reset timer
                </button>
              </div>

              <div
                aria-hidden="true"
                className="h-4 w-full overflow-hidden rounded-full bg-slate-200"
              >
                <div
                  className="h-full bg-emerald-600 transition-all duration-700 ease-linear"
                  style={{ width: `${remainingPercent}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleMarkDone}
            className="mb-4 flex min-h-[64px] w-full items-center justify-center gap-2.5 rounded-xl bg-emerald-600 px-6 py-4 text-xl font-bold text-white transition hover:bg-emerald-700 active:scale-[0.99]"
          >
            <Check strokeWidth={2.8} />
            <span>
              {currentIndex < steps.length - 1
                ? 'Done — Show next step'
                : 'Finished'}
            </span>
          </button>

          <div className="flex items-center justify-between pt-2 text-sm text-slate-500">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              className="flex min-h-[40px] items-center gap-1 rounded-lg px-2.5 py-1.5 font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft />
              <span>Previous</span>
            </button>

            <span className="text-xs font-medium text-slate-400">
              No timeout — take your time
            </span>

            <button
              type="button"
              disabled={currentIndex >= steps.length - 1}
              onClick={() =>
                setCurrentIndex((i) => Math.min(steps.length - 1, i + 1))
              }
              className="flex min-h-[40px] items-center gap-1 rounded-lg px-2.5 py-1.5 font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              <span>Skip for now</span>
              <ChevronRight />
            </button>
          </div>
        </article>

        {showAllSteps && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 text-left">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              All steps in this sequence
            </h4>
            <ol className="space-y-2">
              {steps.map((step, idx) => (
                <li key={step.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowAllSteps(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold ${
                      idx === currentIndex
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span>
                      {idx + 1}. {step.label}
                    </span>
                    {idx === currentIndex && (
                      <span className="text-xs uppercase">Current</span>
                    )}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <aside
        aria-label="Park It thought pocket"
        className="h-fit rounded-2xl border border-yellow-200 bg-yellow-50 p-6 text-left"
      >
        <div className="flex items-center gap-2 text-yellow-900">
          <Pin className="text-yellow-700" />
          <h3 className="text-lg font-extrabold">Park It</h3>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-yellow-800">
          Got a sudden thought? Park it here safely so you do not lose your place.
        </p>

        <form onSubmit={handleParkThought} className="mt-4 space-y-2.5">
          <input
            type="text"
            value={parkInput}
            onChange={(e) => setParkInput(e.target.value)}
            placeholder="e.g. Check oven, bring ear defenders..."
            className="min-h-[44px] w-full rounded-lg border border-yellow-400 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-yellow-600 focus:outline-none"
          />
          <button
            type="submit"
            className="min-h-[42px] w-full rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-yellow-950 transition hover:bg-yellow-500"
          >
            Save note
          </button>
        </form>

        <ul className="mt-4 space-y-2">
          {parkedThoughts.length === 0 ? (
            <li className="rounded-lg border border-dashed border-yellow-300 px-3 py-2.5 text-xs text-yellow-800/80">
              Nothing parked right now.
            </li>
          ) : (
            parkedThoughts.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-2 rounded-lg border border-yellow-200 bg-white p-3 text-sm text-slate-800"
              >
                <div>
                  <p className="font-medium">{item.text}</p>
                  <span className="text-xs text-slate-400">
                    Parked at {item.savedAt}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeParkedThought(item.id)}
                  aria-label={`Remove note: ${item.text}`}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <Trash2 />
                </button>
              </li>
            ))
          )}
        </ul>
      </aside>
    </div>
  );
};
