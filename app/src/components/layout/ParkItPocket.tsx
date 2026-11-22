import React, { useEffect, useState } from 'react';

interface ParkedThought {
  id: string;
  text: string;
  createdAt: string;
}

const STORAGE_KEY = 'spark_park_it_thoughts_v1';

export const ParkItPocket: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [thoughts, setThoughts] = useState<ParkedThought[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(thoughts));
    } catch {
      // Ignore storage quota errors
    }
  }, [thoughts]);

  const handleParkThought = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    const now = new Date().toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
    setThoughts((prev) => [
      { id: `${Date.now()}`, text: trimmed, createdAt: now },
      ...prev,
    ]);
    setDraft('');
  };

  const removeThought = (id: string) => {
    setThoughts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <aside className="fixed bottom-2.5 right-3 z-40 print:hidden">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-slate-900 bg-amber-300 px-3.5 py-1.5 text-xs font-black text-slate-950 shadow-md transition hover:bg-amber-200"
        >
          <span>Park It</span>
          {thoughts.length > 0 && (
            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-extrabold text-white">
              {thoughts.length}
            </span>
          )}
        </button>
      ) : (
        <div className="w-80 rounded-2xl border-2 border-slate-900 bg-amber-50 p-4 shadow-2xl sm:w-96">
          <div className="flex items-center justify-between border-b border-amber-300 pb-2">
            <div>
              <h3 className="text-sm font-black text-slate-950">Park It Pocket</h3>
              <p className="text-[11px] font-medium text-slate-700">
                Drop stray thoughts here so you stay on your current step.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg border border-slate-400 bg-white px-2.5 py-1 text-xs font-bold text-slate-800 hover:bg-slate-100"
            >
              Hide
            </button>
          </div>

          <form onSubmit={handleParkThought} className="mt-3 flex gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write thought & park it..."
              className="min-h-[40px] flex-1 rounded-xl border-2 border-slate-900 bg-white px-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="min-h-[40px] rounded-xl bg-slate-900 px-3.5 text-xs font-black text-white hover:bg-slate-800"
            >
              Park
            </button>
          </form>

          <div className="mt-3 max-h-48 space-y-2 overflow-y-auto">
            {thoughts.length === 0 ? (
              <p className="py-3 text-center text-xs text-slate-500">
                Nothing parked yet. Keep your focus clear.
              </p>
            ) : (
              thoughts.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-2 rounded-xl border border-amber-300 bg-white p-2.5 text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{item.text}</p>
                    <span className="text-[10px] font-bold text-slate-400">
                      Parked at {item.createdAt}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeThought(item.id)}
                    aria-label="Clear parked thought"
                    className="rounded px-1.5 py-0.5 text-[11px] font-bold text-slate-500 hover:bg-red-50 hover:text-red-700"
                  >
                    Done
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
