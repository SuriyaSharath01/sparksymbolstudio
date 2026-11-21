import React from 'react';
import { VisualStepTimer } from './VisualStepTimer';

export interface RoutineStepItem<TCoreId extends string = string> {
  id: string;
  label: string;
  actionInstruction: string;
  imageSrc?: string;
  imagePath?: string;
  coreCardId?: TCoreId;
  waitSeconds?: number;
}

export interface RoutinePresetItem<TCoreId extends string = string> {
  key?: string;
  name: string;
  locationHint?: string;
  steps: RoutineStepItem<TCoreId>[];
}

export interface StripSymbolItem {
  id: string;
  label: string;
  imageSrc: string;
}

interface RoutinePresetsPanelProps<TCoreId extends string = string> {
  presets: (RoutinePresetItem<TCoreId> & { key: string })[];
  selectedPresetKey: string;
  onSelectPreset: (key: string) => void;
  activePreset: RoutinePresetItem<TCoreId>;
  onLoadPresetToStrip: (items: StripSymbolItem[]) => void;
  onAppendSymbolToStrip: (label: string, imageSrc: string) => void;
  renderTileVisual: (params: {
    src?: string;
    alt: string;
    label: string;
    coreCardId?: TCoreId;
    sizeClass?: string;
  }) => React.ReactNode;
}

export function RoutinePresetsPanel<TCoreId extends string = string>({
  presets,
  selectedPresetKey,
  onSelectPreset,
  activePreset,
  onLoadPresetToStrip,
  onAppendSymbolToStrip,
  renderTileVisual,
}: RoutinePresetsPanelProps<TCoreId>) {
  const getStepImage = (step: RoutineStepItem<TCoreId>) =>
    step.imageSrc || step.imagePath || '';

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {presets.map((preset) => {
          const isSelected = preset.key === selectedPresetKey;
          return (
            <button
              key={preset.key}
              type="button"
              onClick={() => onSelectPreset(preset.key)}
              className={`min-h-[40px] rounded-xl border-2 px-4 py-1.5 text-xs font-black transition ${
                isSelected
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 bg-white text-slate-800 hover:border-slate-900'
              }`}
            >
              {preset.name}
            </button>
          );
        })}
      </div>

      {activePreset.locationHint && (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700">
          {activePreset.locationHint}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-600">
          {activePreset.steps.length} steps in routine
        </span>
        <button
          type="button"
          onClick={() =>
            onLoadPresetToStrip(
              activePreset.steps.map((s, idx) => ({
                id: `${s.id}_strip_${idx}_${Date.now()}`,
                label: s.label,
                imageSrc: getStepImage(s),
              }))
            )
          }
          className="min-h-[36px] rounded-xl border-2 border-slate-900 bg-emerald-500 px-3.5 py-1 text-xs font-black text-slate-950 shadow-sm transition hover:bg-emerald-400"
        >
          Load Preset to Strip
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {activePreset.steps.map((step, index) => (
          <article
            key={step.id}
            className="flex flex-col items-center rounded-xl border-2 border-slate-900 bg-white p-4 text-center"
          >
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase text-slate-700">
                Step {index + 1}
              </span>
              {step.waitSeconds && (
                <VisualStepTimer totalSeconds={step.waitSeconds} label="Wait timer" />
              )}
            </div>

            <div className="my-3">
              {renderTileVisual({
                src: step.imageSrc,
                alt: step.label,
                label: step.label,
                coreCardId: step.coreCardId,
                sizeClass: 'h-16 w-16',
              })}
            </div>

            <h3 className="text-sm font-extrabold text-slate-950">{step.label}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              {step.actionInstruction}
            </p>

            <button
              type="button"
              onClick={() => onAppendSymbolToStrip(step.label, getStepImage(step))}
              className="mt-3 w-full rounded-lg border border-slate-900 bg-slate-100 px-2.5 py-1.5 text-xs font-extrabold text-slate-900 transition hover:bg-amber-200"
            >
              + Strip
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
