import { usePersona, Persona } from '../context/PersonaContext';

const PERSONA_OPTIONS: { id: Persona; label: string; icon: string }[] = [
  { id: 'neutral', label: 'Default', icon: '/symbols/spark-core/i_me.svg' },
  { id: 'girl', label: 'Girl', icon: '/symbols/spark-core/girl.svg' },
  { id: 'boy', label: 'Boy', icon: '/symbols/spark-core/boy.svg' },
  { id: 'woman', label: 'Woman', icon: '/symbols/spark-core/woman.svg' },
  { id: 'man', label: 'Man', icon: '/symbols/spark-core/man.svg' },
  { id: 'older_woman', label: 'Older Woman', icon: '/symbols/spark-core/older_woman.svg' },
  { id: 'older_man', label: 'Older Man', icon: '/symbols/spark-core/older_man.svg' },
];

export const PersonaSwitcher = () => {
  const { activePersona, setPersona } = usePersona();

  return (
    <div
      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100/90 p-1"
      role="group"
      aria-label="Board Persona"
    >
      {PERSONA_OPTIONS.map((p) => {
        const active = activePersona === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => setPersona(p.id)}
            title={p.label}
            className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-all ${
              active
                ? 'bg-white text-slate-900 shadow-sm ring-2 ring-[#E36C2B]'
                : 'text-slate-600 opacity-75 hover:bg-white/60 hover:opacity-100'
            }`}
          >
            <img src={p.icon} alt="" className="h-6 w-6 object-contain" />
            <span className="hidden sm:inline">{p.label}</span>
          </button>
        );
      })}
    </div>
  );
};
