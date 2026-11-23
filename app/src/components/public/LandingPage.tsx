import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  WifiOff,
  Volume2,
  Layers,
  UserCheck,
  ClipboardCheck,
} from 'lucide-react';
import { PublicLayout } from './PublicLayout';
import {
  getMulberryCatalog,
  loadOpenMojiCatalog,
  searchLocalSymbols,
} from '../../utils/symbolSearch';
import type { SymbolAsset } from '../../types/symbols';

interface DemoToken {
  word: string;
  label: string;
  imageSrc?: string;
  toneClass: string;
  isAbstract: boolean;
}

const ABSTRACT_WORDS = new Set([
  'a',
  'an',
  'the',
  'to',
  'of',
  'in',
  'on',
  'at',
  'for',
  'with',
  'is',
  'are',
  'was',
  'were',
  'my',
  'your',
]);

const SAMPLE_SENTENCES = [
  'I want a cup of tea',
  'Go to hospital appointment',
  'Feeling quiet need break',
  'Wash hands before lunch',
];

function classifyTone(word: string): string {
  const w = word.toLowerCase();
  if (['i', 'me', 'my', 'you', 'your', 'we', 'us', 'staff', 'carer', 'nurse', 'doctor'].includes(w)) {
    return 'border-amber-400 bg-amber-50/70 text-amber-950';
  }
  if (['want', 'need', 'go', 'wash', 'eat', 'drink', 'help', 'wait', 'stop', 'open', 'take'].includes(w)) {
    return 'border-emerald-500 bg-emerald-50/70 text-emerald-950';
  }
  if (['quiet', 'calm', 'happy', 'sad', 'pain', 'sore', 'tired', 'hot', 'cold', 'good'].includes(w)) {
    return 'border-sky-400 bg-sky-50/70 text-sky-950';
  }
  return 'border-orange-400 bg-orange-50/60 text-slate-900';
}

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [symbols, setSymbols] = useState<SymbolAsset[]>(() => getMulberryCatalog());
  const [inputText, setInputText] = useState<string>('I want a cup of tea');
  const [hideAbstract, setHideAbstract] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    loadOpenMojiCatalog()
      .then((extra) => {
        if (active && extra.length > 0) {
          setSymbols([...getMulberryCatalog(), ...extra]);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const words = inputText
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 12);

  const HERO_VERIFIED_FALLBACKS: Record<string, string> = {
    want: '/symbols/spark_want.svg',
    help: '/symbols/spark_help.svg',
    wait: '/symbols/wait_,_to.svg',
    quiet: '/symbols/quiet.svg',
    stop: '/symbols/stop_sign.svg',
    listen: '/symbols/communication_aid_listen_to_me.svg',
    cup: '/symbols/mug_2.svg',
    tea: '/symbols/spark_cup_of_tea.svg',
    drink: '/symbols/drink_,_to.svg',
    break: '/symbols/break_time_1.svg',
    wash: '/symbols/clean_hands.svg',
    hands: '/symbols/clean_hands.svg',
  };

  const tokens: DemoToken[] = words.map((rawWord) => {
    const clean = rawWord.replace(/^[^\w]+|[^\w]+$/g, '');
    const lower = (clean || rawWord).toLowerCase();
    const isAbstract = ABSTRACT_WORDS.has(lower);
    const match = isAbstract ? undefined : searchLocalSymbols(clean || rawWord, symbols)[0];
    const resolvedSrc = isAbstract ? undefined : (HERO_VERIFIED_FALLBACKS[lower] || match?.imagePath);
    return {
      word: clean || rawWord,
      label: match?.label || clean || rawWord,
      imageSrc: resolvedSrc,
      toneClass: classifyTone(clean || rawWord),
      isAbstract,
    };
  });

  const visibleTokens = hideAbstract ? tokens.filter((t) => !t.isAbstract) : tokens;
  const exceedsClinicalGuideline = visibleTokens.length > 8;

  const speakSentence = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const textToSpeak = visibleTokens.map((t) => t.word).join(' ').trim();
    if (!textToSpeak) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(textToSpeak);
    utter.lang = 'en-GB';
    utter.rate = 0.92;
    window.speechSynthesis.speak(utter);
  };

  const openInStudio = () => {
    const phrase = visibleTokens.map((t) => t.word).join(' ').trim();
    navigate(phrase ? `/studio?sentence=${encodeURIComponent(phrase)}` : '/studio');
  };

  return (
    <PublicLayout>
      <section className="bg-gradient-to-b from-slate-50 via-white to-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-3.5 py-1.5 text-xs font-bold text-[#B84710]">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>NHS AIS Step 6 Ready • CQC Reg 9 Evidence • Zero-PII Offline</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950 leading-[1.08]">
              Symbol communication built for care, health &amp; education—with{' '}
              <span className="text-[#D45A1A]">zero lock-in.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Create visual support boards, plain-English Easy Read sheets, Resident DNA profiles, and touch-to-speak talkers in one offline-first platform—with no 100-symbol cap and no per-symbol royalty traps.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/studio"
                className="inline-flex items-center gap-2 rounded-xl bg-[#D45A1A] px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#b84710] transition"
              >
                <span>Open Spark Studio</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/trust"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-800 hover:bg-slate-50 transition"
              >
                <span>Procurement &amp; DPIA Hub</span>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/80 text-xs">
              <div>
                <div className="text-lg font-extrabold text-slate-900">20,500+</div>
                <div className="text-slate-500">Commercial-safe symbols</div>
              </div>
              <div>
                <div className="text-lg font-extrabold text-slate-900">100% Local</div>
                <div className="text-slate-500">IndexedDB &amp; Service Worker</div>
              </div>
              <div>
                <div className="text-lg font-extrabold text-slate-900">£0 Royalties</div>
                <div className="text-slate-500">No 100-symbol limit</div>
              </div>
            </div>
          </div>

          <div id="live-demo" className="lg:col-span-6">
            <div className="rounded-2xl bg-white border border-slate-200 shadow-lg p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#D45A1A]">
                    Try It Live — No Sign-Up Required
                  </span>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Type a sentence to preview symbol support
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setHideAbstract((v) => !v)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                    hideAbstract
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {hideAbstract ? 'Showing Key Words Only' : 'Simplify (Hide Small Words)'}
                </button>
              </div>

              <div>
                <label htmlFor="hero-sentence-input" className="sr-only">
                  Enter a phrase to symbolise
                </label>
                <input
                  id="hero-sentence-input"
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type e.g. I want a cup of tea..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 focus:border-[#D45A1A] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_SENTENCES.map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setInputText(sample)}
                    className="rounded-full bg-slate-100 hover:bg-amber-50 hover:text-[#B84710] px-3 py-1 text-xs font-semibold text-slate-700 transition"
                  >
                    {sample}
                  </button>
                ))}
              </div>

              {exceedsClinicalGuideline && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs font-semibold text-amber-950">
                  Comprehension guide: Keeping symbol strips to 8 or fewer symbols reduces visual overload.
                </div>
              )}

              <div className="min-h-[146px] rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 flex flex-wrap gap-2.5 items-end">
                {visibleTokens.length === 0 ? (
                  <p className="text-xs text-slate-500 m-auto py-8">
                    Type a phrase above to see matching symbol cards appear here.
                  </p>
                ) : (
                  visibleTokens.map((tok, idx) =>
                    tok.imageSrc ? (
                      <div
                        key={`${tok.word}-${idx}`}
                        className={`w-[88px] rounded-xl border-2 p-2 flex flex-col items-center text-center shadow-2xs ${tok.toneClass}`}
                      >
                        <div className="h-12 w-12 flex items-center justify-center mb-1.5">
                          <img
                            src={tok.imageSrc}
                            alt={tok.label}
                            className="max-h-12 max-w-12 object-contain"
                            loading="lazy"
                          />
                        </div>
                        <span className="text-xs font-extrabold leading-tight break-words w-full">
                          {tok.word}
                        </span>
                      </div>
                    ) : (
                      <div
                        key={`${tok.word}-${idx}`}
                        className="px-1.5 pb-2.5 flex items-end justify-center"
                      >
                        <span className="text-sm font-bold text-slate-600">
                          {tok.word}
                        </span>
                      </div>
                    )
                  )
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={speakSentence}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 transition"
                >
                  <Volume2 className="h-4 w-4 text-[#D45A1A]" />
                  <span>Speak Aloud (UK)</span>
                </button>

                <button
                  type="button"
                  onClick={openInStudio}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
                >
                  <span>Edit &amp; Print in Studio</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 mx-auto max-w-7xl px-6">
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-[#D45A1A] mb-2">
            Why Care &amp; Education Teams Switch
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Designed around real UK care shifts—not fragmented licences
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: UserCheck,
              title: 'Resident DNA Adaptation',
              body: 'Store individual font, background tint, and support preferences locally so visual supports adapt without rebuilding from scratch.',
            },
            {
              icon: ClipboardCheck,
              title: 'CQC Reg 9 & AIS Step 6',
              body: 'Track review dates, log communication adjustments, and export clean audit evidence for care inspections.',
            },
            {
              icon: WifiOff,
              title: 'Offline-First & Zero-PII',
              body: 'Service Worker caching and IndexedDB keep symbol libraries and resident materials working even on patchy Wi-Fi.',
            },
            {
              icon: Layers,
              title: 'Open .obf Portability',
              body: 'Export and import portable Open Board Format (.obf) files and A4/Pocket PDFs with zero proprietary lock-in.',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 hover:border-slate-300 hover:shadow-sm transition"
              >
                <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-[#D45A1A] mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mb-2">{card.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{card.body}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-14 rounded-2xl border border-slate-200 bg-slate-50/60 overflow-hidden">
          <div className="px-6 py-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-extrabold text-slate-900">
              How Spark Compares to Traditional Fragmented Symbol Suites
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              Practical workflow &amp; governance comparison
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                  <th className="py-3.5 px-6 font-bold">Capability</th>
                  <th className="py-3.5 px-6 font-bold text-[#B84710]">Spark Symbol Studio</th>
                  <th className="py-3.5 px-6 font-bold text-slate-600">Traditional Multi-Tool Suites</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                <tr>
                  <td className="py-3.5 px-6 font-semibold text-slate-900">Symbol Distribution Cap</td>
                  <td className="py-3.5 px-6 text-slate-800">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      Unlimited across commercial-safe open symbols (CC BY-SA 4.0 / OpenMoji)
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-600">
                    Often restricts cumulative symbol counts or requires extra publishing licences
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-semibold text-slate-900">Boards, Easy Read &amp; Talker</td>
                  <td className="py-3.5 px-6 text-slate-800">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      Unified in one web app + PIN-locked Kiosk view
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-600">
                    Split across separate desktop, web, and standalone tablet apps
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-semibold text-slate-900">UK Care &amp; AIS Step 6 Audit</td>
                  <td className="py-3.5 px-6 text-slate-800">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      Built-in review stamps, Zero-PII local scrubbing &amp; CSV audit export
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-600">
                    Manual spreadsheets and separate compliance tracking outside the editor
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-semibold text-slate-900">File Portability &amp; Offline Use</td>
                  <td className="py-3.5 px-6 text-slate-800">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      Open Board Format (.obf) + local IndexedDB offline cache
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-600">
                    Proprietary formats and cloud-first workflows vulnerable to drop-outs
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};
