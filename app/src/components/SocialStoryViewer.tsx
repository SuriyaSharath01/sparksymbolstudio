import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Plus,
  RotateCcw,
  ArrowUpRight,
  Pencil,
  Trash2,
} from 'lucide-react';
import { CardVisual } from './AnchorCard';
import { CORE_CARDS, type CoreCardId } from '../data/core-cards';
import type { SocialStory, SocialStoryPage } from '../data/social-stories';

interface SocialStoryViewerProps {
  stories: SocialStory[];
  selectedStoryId: string;
  onSelectStory: (storyId: string) => void;
  onResetStories: () => void;
  onAddStoryToGrid: (story: SocialStory) => void;
  onCreateCustomStory: (
    title: string,
    category: SocialStory['category'],
    sentence: string,
    symbol: string
  ) => void;
  onUpdateStory: (updatedStory: SocialStory) => void;
}

function StoryPageVisual({ page }: { page: SocialStoryPage }) {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [page.symbol, page.coreCardId]);

  if (page.coreCardId && CORE_CARDS[page.coreCardId]) {
    return (
      <div className="flex h-28 w-28 items-center justify-center">
        <CardVisual card={CORE_CARDS[page.coreCardId]} />
      </div>
    );
  }

  if (!page.symbol || broken) {
    return (
      <div className="flex h-28 w-28 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-2 text-center text-xs font-extrabold text-slate-700">
        {page.heading}
      </div>
    );
  }

  return (
    <img
      src={page.symbol}
      alt={page.heading}
      onError={() => setBroken(true)}
      className="h-28 w-28 object-contain"
    />
  );
}

const VERIFIED_STORY_VISUALS: {
  label: string;
  symbol?: string;
  coreCardId?: CoreCardId;
  valueKey: string;
}[] = [
  { label: 'Wake Up', symbol: '/symbols/wake_up_,_to.svg', valueKey: 'sym:/symbols/wake_up_,_to.svg' },
  { label: 'Wash Face', symbol: '/symbols/wash_face_,_to.svg', valueKey: 'sym:/symbols/wash_face_,_to.svg' },
  { label: 'Brush Teeth', symbol: '/symbols/toothbrush.svg', valueKey: 'sym:/symbols/toothbrush.svg' },
  { label: 'Walk', symbol: '/symbols/walk_,_to.svg', valueKey: 'sym:/symbols/walk_,_to.svg' },
  { label: 'Wash Hands', symbol: '/symbols/wash_hands_,_to.svg', valueKey: 'sym:/symbols/wash_hands_,_to.svg' },
  { label: 'Dry Hands', symbol: '/symbols/dry_hands_,_to.svg', valueKey: 'sym:/symbols/dry_hands_,_to.svg' },
  { label: 'Ear Muffs', symbol: '/symbols/ear_muffs.svg', valueKey: 'sym:/symbols/ear_muffs.svg' },
  { label: 'Core: Stop', symbol: CORE_CARDS.stop.imageSrc, coreCardId: 'stop', valueKey: 'core:stop' },
  { label: 'Core: Quiet', symbol: CORE_CARDS.quiet.imageSrc, coreCardId: 'quiet', valueKey: 'core:quiet' },
  { label: 'Core: Home', symbol: CORE_CARDS.home.imageSrc, coreCardId: 'home', valueKey: 'core:home' },
  { label: 'Core: Hot Drink', symbol: CORE_CARDS.hot_drink.imageSrc, coreCardId: 'hot_drink', valueKey: 'core:hot_drink' },
];

function getVisualValueKey(page: SocialStoryPage): string {
  if (page.coreCardId) return `core:${page.coreCardId}`;
  return `sym:${page.symbol || '/symbols/walk_,_to.svg'}`;
}

export const SocialStoryViewer: React.FC<SocialStoryViewerProps> = ({
  stories,
  selectedStoryId,
  onSelectStory,
  onResetStories,
  onAddStoryToGrid,
  onCreateCustomStory,
  onUpdateStory,
}) => {
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [showCreator, setShowCreator] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<SocialStory['category']>('Routines & Transitions');
  const [newSentence, setNewSentence] = useState<string>('');
  const [newSymbol, setNewSymbol] = useState<string>('/symbols/walk_,_to.svg');

  const activeStory = stories.find((s) => s.id === selectedStoryId) || stories[0];

  useEffect(() => {
    setPageIndex(0);
    setIsEditing(false);
  }, [selectedStoryId]);

  useEffect(() => {
    if (activeStory && pageIndex >= activeStory.pages.length) {
      setPageIndex(Math.max(0, activeStory.pages.length - 1));
    }
  }, [activeStory, pageIndex]);

  if (!activeStory) return null;

  const currentPage = activeStory.pages[pageIndex] || activeStory.pages[0];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSentence.trim()) return;
    onCreateCustomStory(newTitle.trim(), newCategory, newSentence.trim(), newSymbol);
    setNewTitle('');
    setNewSentence('');
    setShowCreator(false);
  };

  const renumberPages = (pages: SocialStoryPage[]): SocialStoryPage[] =>
    pages.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));

  const handleStoryMetaChange = (field: 'title' | 'category', value: string) => {
    onUpdateStory({
      ...activeStory,
      [field]: value,
    });
  };

  const handlePageFieldChange = (
    idx: number,
    patch: Partial<SocialStoryPage>
  ) => {
    const nextPages = activeStory.pages.map((p, i) =>
      i === idx ? { ...p, ...patch } : p
    );
    onUpdateStory({
      ...activeStory,
      pages: renumberPages(nextPages),
    });
  };

  const handlePageVisualChange = (idx: number, valueKey: string) => {
    const matched = VERIFIED_STORY_VISUALS.find((v) => v.valueKey === valueKey);
    if (!matched) return;
    handlePageFieldChange(idx, {
      symbol: matched.symbol,
      coreCardId: matched.coreCardId,
    });
  };

  const handleAddPage = () => {
    const nextIndex = activeStory.pages.length;
    const newPage: SocialStoryPage = {
      id: `${activeStory.id}_p_${Date.now()}`,
      pageNumber: nextIndex + 1,
      heading: `Step ${nextIndex + 1}`,
      sentence: 'I can take this step calmly at my own pace.',
      guidanceNote: 'Keep instructions short and concrete.',
      symbol: '/symbols/walk_,_to.svg',
    };
    const nextPages = renumberPages([...activeStory.pages, newPage]);
    onUpdateStory({
      ...activeStory,
      pages: nextPages,
    });
    setPageIndex(nextPages.length - 1);
  };

  const handleMovePage = (idx: number, direction: -1 | 1) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= activeStory.pages.length) return;
    const copy = [...activeStory.pages];
    const [moved] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, moved);
    onUpdateStory({
      ...activeStory,
      pages: renumberPages(copy),
    });
    setPageIndex(targetIdx);
  };

  const handleDeletePage = (idx: number) => {
    if (activeStory.pages.length <= 1) return;
    const nextPages = renumberPages(activeStory.pages.filter((_, i) => i !== idx));
    onUpdateStory({
      ...activeStory,
      pages: nextPages,
    });
    setPageIndex((prev) => Math.min(prev, nextPages.length - 1));
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2.5">
          <BookOpen className="text-[#E36C2B]" />
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              JSON Social Story Viewer &amp; Editor
            </h2>
            <p className="text-xs text-slate-500">
              Multi-page stories using local Mulberry symbols, core cards, and browser localStorage.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsEditing((prev) => !prev);
              setShowCreator(false);
            }}
            className={`inline-flex min-h-[34px] items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
              isEditing
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Pencil />
            <span>{isEditing ? 'Done Editing' : 'Edit Story'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowCreator((prev) => !prev);
              setIsEditing(false);
            }}
            className="inline-flex min-h-[34px] items-center gap-1 rounded-lg bg-[#E36C2B] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#D45A1A]"
          >
            <Plus />
            <span>{showCreator ? 'Close Builder' : 'New Story'}</span>
          </button>

          <button
            type="button"
            onClick={onResetStories}
            className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
          >
            <RotateCcw />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {stories.map((story) => {
          const isSelected = story.id === activeStory.id;
          return (
            <button
              key={story.id}
              type="button"
              onClick={() => onSelectStory(story.id)}
              className={`min-h-[36px] rounded-full border px-3.5 py-1 text-xs font-bold transition ${
                isSelected
                  ? 'border-[#E36C2B] bg-[#E36C2B] text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {story.title} ({story.pages.length}p)
            </button>
          );
        })}
      </div>

      {showCreator && (
        <form
          onSubmit={handleCreateSubmit}
          className="space-y-3 rounded-xl border border-slate-300 bg-white p-4"
        >
          <h3 className="text-sm font-extrabold text-slate-900">
            Save a New Story to Local Storage
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Story title (e.g. Going on a Short Walk)"
              className="min-h-[38px] rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            />

            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as SocialStory['category'])}
              className="min-h-[38px] rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold"
            >
              <option value="Routines & Transitions">Routines &amp; Transitions</option>
              <option value="Sensory & Calm Support">Sensory &amp; Calm Support</option>
              <option value="Everyday Living & Care">Everyday Living &amp; Care</option>
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={newSentence}
              onChange={(e) => setNewSentence(e.target.value)}
              placeholder="Clear step sentence (e.g. I can put on my shoes and walk calmly.)"
              className="min-h-[38px] rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
            />

            <select
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              className="min-h-[38px] rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold"
            >
              {VERIFIED_STORY_VISUALS.filter((v) => v.symbol).map((sym) => (
                <option key={sym.valueKey} value={sym.symbol}>
                  Symbol: {sym.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
            >
              Save Story
            </button>
          </div>
        </form>
      )}

      {isEditing && (
        <div className="space-y-4 rounded-xl border border-slate-300 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
              Edit Story &amp; Pages ({activeStory.pages.length} Pages)
            </h3>
            <button
              type="button"
              onClick={handleAddPage}
              className="inline-flex min-h-[34px] items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
            >
              <Plus />
              <span>Add Page</span>
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500">
                Story Title
              </label>
              <input
                type="text"
                value={activeStory.title}
                onChange={(e) => handleStoryMetaChange('title', e.target.value)}
                className="mt-1 min-h-[38px] w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500">
                Care Category
              </label>
              <select
                value={activeStory.category}
                onChange={(e) => handleStoryMetaChange('category', e.target.value)}
                className="mt-1 min-h-[38px] w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold"
              >
                <option value="Routines & Transitions">Routines &amp; Transitions</option>
                <option value="Sensory & Calm Support">Sensory &amp; Calm Support</option>
                <option value="Everyday Living & Care">Everyday Living &amp; Care</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {activeStory.pages.map((p, idx) => (
              <div
                key={p.id}
                className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5"
              >
                <div className="mb-2.5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setPageIndex(idx)}
                    className="text-xs font-extrabold text-[#D45A1A] hover:underline"
                  >
                    Page {idx + 1} (Click to preview in reader)
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMovePage(idx, -1)}
                      className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-35"
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      disabled={idx === activeStory.pages.length - 1}
                      onClick={() => handleMovePage(idx, 1)}
                      className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-35"
                    >
                      Down
                    </button>
                    {activeStory.pages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeletePage(idx)}
                        aria-label={`Delete page ${idx + 1}`}
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                      >
                        <Trash2 />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  <input
                    type="text"
                    value={p.heading}
                    onChange={(e) => handlePageFieldChange(idx, { heading: e.target.value })}
                    placeholder="Page heading"
                    className="min-h-[36px] rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-bold"
                  />

                  <select
                    value={getVisualValueKey(p)}
                    onChange={(e) => handlePageVisualChange(idx, e.target.value)}
                    aria-label={`Page ${idx + 1} symbol`}
                    className="min-h-[36px] rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold"
                  >
                    {VERIFIED_STORY_VISUALS.map((v) => (
                      <option key={v.valueKey} value={v.valueKey}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  value={p.sentence}
                  onChange={(e) => handlePageFieldChange(idx, { sentence: e.target.value })}
                  placeholder="Main story sentence"
                  className="mt-2 min-h-[36px] w-full rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs"
                />

                <input
                  type="text"
                  value={p.guidanceNote || ''}
                  onChange={(e) =>
                    handlePageFieldChange(idx, { guidanceNote: e.target.value })
                  }
                  placeholder="Optional staff guidance note"
                  className="mt-2 min-h-[36px] w-full rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs text-slate-600"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border-2 border-slate-900 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <span className="rounded bg-orange-100 px-2.5 py-0.5 text-[11px] font-extrabold text-[#D45A1A]">
              {activeStory.category}
            </span>
            <h3 className="mt-1.5 text-lg font-extrabold text-slate-900">
              {activeStory.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">
              Page {pageIndex + 1} of {activeStory.pages.length}
            </span>
            <button
              type="button"
              onClick={() => onAddStoryToGrid(activeStory)}
              className="inline-flex min-h-[34px] items-center gap-1 rounded-lg bg-slate-900 px-3 py-1 text-xs font-bold text-white hover:bg-slate-800"
            >
              <span>Load Pages into Grid</span>
              <ArrowUpRight />
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center text-center">
          <div className="flex h-36 w-36 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <StoryPageVisual page={currentPage} />
          </div>

          <h4 className="mt-4 text-base font-extrabold text-[#4A6B8A]">
            {currentPage.heading}
          </h4>

          <p className="mt-2 max-w-2xl text-lg font-bold leading-relaxed text-slate-900">
            {currentPage.sentence}
          </p>

          {currentPage.guidanceNote && (
            <p className="mt-3 max-w-2xl rounded-lg bg-slate-50 px-3.5 py-2 text-xs text-slate-600">
              <strong>Staff note:</strong> {currentPage.guidanceNote}
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
          <button
            type="button"
            disabled={pageIndex === 0}
            onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft />
            <span>Previous</span>
          </button>

          <div className="flex gap-1.5">
            {activeStory.pages.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                aria-label={`Go to page ${idx + 1}`}
                onClick={() => setPageIndex(idx)}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  idx === pageIndex ? 'bg-[#E36C2B]' : 'bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            disabled={pageIndex >= activeStory.pages.length - 1}
            onClick={() =>
              setPageIndex((prev) => Math.min(activeStory.pages.length - 1, prev + 1))
            }
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#E36C2B] px-4 py-2 text-xs font-bold text-white hover:bg-[#D45A1A] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span>Next</span>
            <ChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
};

export default SocialStoryViewer;
