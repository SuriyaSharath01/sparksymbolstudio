import { SymbolPointPopover, findSymbolMatches, type PointPopoverSymbol } from "./studio/SymbolPointPopover";
import React, { useState } from "react";
import { Volume2, Delete, RotateCcw, CaseSensitive, Sparkles, Palette, Plus } from "lucide-react";

export interface StripSymbolItem {
  id: string;
  label: string;
  imageSrc: string;
  imageAlt?: string;
}

interface WidgitSentenceStripProps {
  items: StripSymbolItem[];
  onRemoveLast: () => void;
  onRemoveAt?: (index: number) => void;
  onClearAll: () => void;
  onAddSymbol?: (symbol: PointPopoverSymbol) => void;
  title?: string;
  symbols?: PointPopoverSymbol[];
  onSwapSymbol?: (index: number, symbol: PointPopoverSymbol) => void;
}

type FitzgeraldCategory = "person" | "verb" | "noun" | "descriptor" | "social";

const PRONOUN_OR_PERSON = new Set(["i", "me", "my", "you", "your", "he", "him", "she", "her", "we", "us", "they", "them", "mum", "dad", "staff", "carer", "doctor", "nurse"]);
const COMMON_VERBS = new Set(["want", "need", "go", "stop", "eat", "drink", "help", "like", "look", "see", "wash", "sleep", "walk", "sit", "give", "take", "open", "close", "play", "listen", "wait", "feel"]);
const DESCRIPTORS = new Set(["happy", "sad", "tired", "hungry", "thirsty", "hot", "cold", "good", "bad", "big", "small", "quiet", "loud", "more", "finished", "hurt", "pain"]);
const SOCIAL_WORDS = new Set(["please", "thank", "thanks", "hello", "hi", "bye", "goodbye", "yes", "no", "what", "where", "when", "who", "why", "how"]);

function classifyFitzgerald(label: string): FitzgeraldCategory {
  const primary = label.toLowerCase().trim().split(/[^a-z]+/)[0] || "";
  if (PRONOUN_OR_PERSON.has(primary)) return "person";
  if (COMMON_VERBS.has(primary) || label.toLowerCase().includes(", to")) return "verb";
  if (DESCRIPTORS.has(primary)) return "descriptor";
  if (SOCIAL_WORDS.has(primary)) return "social";
  return "noun";
}

function getFitzgeraldBorderClass(label: string, enabled: boolean): string {
  if (!enabled) return "border-slate-800 bg-white";
  const cat = classifyFitzgerald(label);
  switch (cat) {
    case "person": return "border-amber-400 bg-amber-50/40";
    case "verb": return "border-emerald-600 bg-emerald-50/40";
    case "descriptor": return "border-sky-600 bg-sky-50/40";
    case "social": return "border-rose-500 bg-rose-50/40";
    default: return "border-orange-600 bg-orange-50/30";
  }
}

export const WidgitSentenceStrip: React.FC<WidgitSentenceStripProps> = ({ items, onRemoveLast, onRemoveAt, onAddSymbol, symbols = [], onSwapSymbol, onClearAll, title = "Communication Sentence Strip" }) => {
  const [isUppercase, setIsUppercase] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [fitzgeraldEnabled, setFitzgeraldEnabled] = useState(true);
  const [phraseInput, setPhraseInput] = useState("");

  const formatWord = (word: string) => isUppercase ? word.toUpperCase() : word.toLowerCase();

  const handlePhraseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddSymbol || !symbols.length) return;
    const words = phraseInput.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return;
    for (const rawWord of words) {
      const clean = rawWord.replace(/[^a-zA-Z0-9'-]/g, "");
      if (!clean) continue;
      const matches = findSymbolMatches(clean, symbols, 1);
      if (matches[0]) {
        onAddSymbol(matches[0]);
      }
    }
    setPhraseInput("");
  };

  const handleReadAloud = () => {
    if (!items.length || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const sentence = items.map((item) => item.label.trim()).join(" ");
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = "en-GB";
    utterance.rate = 0.92;
    const voices = window.speechSynthesis.getVoices();
    const ukVoice = voices.find((v) => v.lang === "en-GB" && v.name.includes("Natural")) || voices.find((v) => v.lang === "en-GB") || voices.find((v) => v.lang.startsWith("en"));
    if (ukVoice) utterance.voice = ukVoice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section aria-label={title} className="rounded-xl border-2 border-slate-900 bg-white p-3 shadow-sm sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#D45A1A]" />
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 sm:text-sm">{title}</h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">{items.length} {items.length === 1 ? "symbol" : "symbols"}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button type="button" onClick={() => setFitzgeraldEnabled((prev) => !prev)} title="Toggle Fitzgerald Key word-type colour coding" className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${fitzgeraldEnabled ? "border-amber-400 bg-amber-50 text-amber-950" : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"}`}>
            <Palette className="h-3.5 w-3.5" />
            <span>{fitzgeraldEnabled ? "Key: ON" : "Key: OFF"}</span>
          </button>
          <button type="button" onClick={() => setIsUppercase((prev) => !prev)} title="Toggle uppercase or lowercase labels" className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100">
            <CaseSensitive className="h-4 w-4 text-slate-600" />
            <span>{isUppercase ? "ABC" : "abc"}</span>
          </button>
          <button type="button" onClick={onRemoveLast} disabled={items.length === 0} title="Remove last symbol" className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-amber-50 hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-40">
            <Delete className="h-4 w-4 text-amber-600" />
            <span>Backspace</span>
          </button>
          <button type="button" onClick={onClearAll} disabled={items.length === 0} title="Clear sentence strip" className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-rose-50 hover:border-rose-400 disabled:cursor-not-allowed disabled:opacity-40">
            <RotateCcw className="h-4 w-4 text-rose-600" />
            <span>Clear</span>
          </button>
          <button type="button" onClick={handleReadAloud} disabled={items.length === 0} className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-extrabold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${isSpeaking ? "bg-emerald-600 ring-2 ring-emerald-300" : "bg-[#D45A1A] hover:bg-[#b84a12]"}`}>
            <Volume2 className="h-4 w-4" />
            <span>{isSpeaking ? "Speaking..." : "Read Aloud"}</span>
          </button>
        </div>
      </div>
      {onAddSymbol && symbols.length > 0 && (
        <form onSubmit={handlePhraseSubmit} className="mb-3 flex items-center gap-2">
          <input type="text" value={phraseInput} onChange={(e) => setPhraseInput(e.target.value)} placeholder="Type words to auto-build symbols (e.g. want tea)..." aria-label="Type words to build symbols" className="h-8 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#D45A1A] focus:bg-white focus:outline-none" />
          <button type="submit" className="inline-flex h-8 items-center gap-1 rounded-lg bg-slate-900 px-3 text-xs font-bold text-white transition hover:bg-slate-800">
            <Plus className="h-3.5 w-3.5" />
            <span>Add Phrase</span>
          </button>
        </form>
      )}
      {items.length === 0 ? (
        <div className="flex min-h-[112px] items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
          <p className="text-xs font-semibold text-slate-500 sm:text-sm">Tap any symbol below to build a clear word-under-symbol sentence strip.</p>
        </div>
      ) : (
        <div role="list" className="flex min-h-[112px] flex-wrap items-end gap-2.5 rounded-lg border border-slate-200 bg-[#FAFAF8] p-3 sm:gap-3">
          {items.map((item, idx) => {
            const altCount = onSwapSymbol && symbols.length > 0 ? findSymbolMatches(item.label, symbols, 5).length : 0;
            const borderTone = getFitzgeraldBorderClass(item.label, fitzgeraldEnabled);
            return (
              <div key={`${item.id}-${idx}`} className={`group relative flex w-24 flex-col items-center justify-between overflow-visible rounded-lg border-2 p-2 shadow-xs transition hover:-translate-y-0.5 hover:border-[#D45A1A] focus:outline-none focus:ring-2 focus:ring-[#D45A1A] sm:w-28 ${borderTone}`}>
                <button type="button" onClick={() => onRemoveAt && onRemoveAt(idx)} title={onRemoveAt ? `Tap symbol to remove "${item.label}"` : item.label} className="flex h-16 w-full cursor-pointer items-center justify-center overflow-hidden focus:outline-none sm:h-20">
                  <img src={item.imageSrc} alt={item.imageAlt || item.label} className="max-h-full max-w-full object-contain" />
                </button>
                {onSwapSymbol && altCount > 0 ? (
                  <div className="mt-1.5 flex w-full items-center justify-center border-t border-slate-200 pt-1">
                    <SymbolPointPopover word={item.label} symbols={symbols} maxResults={5} activeSvgPath={item.imageSrc} triggerMode="click" onSelectSymbol={(sym) => onSwapSymbol(idx, sym)} className="max-w-full">
                      <span title="Tap word to swap symbol meaning" className="inline-flex max-w-full items-center gap-0.5 truncate text-center text-sm font-extrabold tracking-tight text-slate-900 hover:text-[#C85A1E] sm:text-base">
                        <span className="truncate">{formatWord(item.label)}</span>
                        {altCount > 1 && <span className="shrink-0 text-[10px] font-bold text-[#E36C2B]" aria-hidden="true">▾</span>}
                      </span>
                    </SymbolPointPopover>
                  </div>
                ) : (
                  <span className="mt-1.5 w-full truncate border-t border-slate-200 pt-1 text-center text-sm font-extrabold tracking-tight text-slate-900 sm:text-base">{formatWord(item.label)}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default WidgitSentenceStrip;
