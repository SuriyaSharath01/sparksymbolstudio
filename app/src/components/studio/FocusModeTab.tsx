import { Layers } from 'lucide-react';
import { FocusCard, type FocusStep } from '../FocusCard';
import type { CommunityPreset } from '../../data/studio-presets';

interface FocusModeTabProps {
  presets: { key: string; preset: CommunityPreset }[];
  selectedPresetKey: string;
  onSelectPreset: (key: string) => void;
  activePreset: CommunityPreset;
  steps: FocusStep[];
}

export function FocusModeTab({
  presets,
  selectedPresetKey,
  onSelectPreset,
  activePreset,
  steps,
}: FocusModeTabProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {presets.map(({ key, preset }) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelectPreset(key)}
            className={`min-h-[36px] rounded-full border px-3.5 py-1 text-xs font-bold transition ${
              selectedPresetKey === key
                ? 'border-[#E36C2B] bg-[#E36C2B] text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Layers className="mr-1 inline-block" />
            {preset.name}
          </button>
        ))}
      </div>
      <FocusCard
        routineId={`${selectedPresetKey}_${steps.length}`}
        routineTitle={activePreset.name}
        steps={steps}
      />
    </section>
  );
}
