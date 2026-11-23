import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Play, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import { SparkSymbol, type SymbolTheme } from '../common/SparkSymbol';
import { decodeKioskPayloadFromHash, type QrBridgePayload } from '../../utils/qrBridge';

const DEFAULT_CARDS = [
  { label: 'I need help', phrase: 'I need help please', svgPath: '/symbols/spark_help.svg' },
  { label: 'Cup of tea', phrase: 'I would like a cup of tea', svgPath: '/symbols/spark_cup_of_tea.svg' },
  { label: 'Quiet break', phrase: 'I need a quiet break please', svgPath: '/symbols/break_time_1.svg' },
  { label: 'Feel calm', phrase: 'I want to feel calm and safe', svgPath: '/symbols/spark_calm.svg' },
  { label: 'Pain / Sore', phrase: 'Something feels sore or uncomfortable', svgPath: '/symbols/spark_pain_scale.svg' },
  { label: 'All done', phrase: 'I am finished with this now', svgPath: '/symbols/finish.svg' },
];

export const KioskTalkerView: React.FC = () => {
  const [hashStr, setHashStr] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.hash : ''
  );

  useEffect(() => {
    const onHashChange = () => setHashStr(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const qrSheet: QrBridgePayload | null = useMemo(
    () => decodeKioskPayloadFromHash(hashStr),
    [hashStr]
  );

  const [theme, setTheme] = useState<SymbolTheme>(qrSheet?.th || 'color');
  const [spoken, setSpoken] = useState<string>('Tap any card or sentence to speak aloud');

  useEffect(() => {
    if (qrSheet?.th) setTheme(qrSheet.th);
  }, [qrSheet]);

  const speak = (phrase: string) => {
    const clean = phrase.replace(/\[[A-Z_]+\]/g, '').trim();
    if (!clean) return;
    setSpoken(clean);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(clean);
      utter.lang = 'en-GB';
      utter.rate = 0.92;
      window.speechSynthesis.speak(utter);
    }
  };

  const speakWholeSheet = () => {
    if (!qrSheet) return;
    const text = [qrSheet.t, ...qrSheet.l].join('. ');
    speak(text);
  };

  const isHC = theme === 'high-contrast';

  return (
    <div
      className={`min-h-screen p-5 sm:p-8 flex flex-col justify-between transition-colors ${
        isHC ? 'bg-black text-[#FFF04B]' : 'bg-slate-950 text-white'
      }`}
    >
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Header Bar */}
        <div
          className={`flex flex-wrap items-center justify-between gap-4 border-b pb-4 ${
            isHC ? 'border-[#FFF04B]' : 'border-slate-800'
          }`}
        >
          <div>
            <div
              className={`inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider ${
                isHC ? 'text-[#FFF04B]' : 'text-amber-400'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{qrSheet ? 'QR-Bridge Mobile Talker • Zero-PII' : 'Spark Live Kiosk Talker'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1 tracking-tight">
              {qrSheet ? qrSheet.t : 'Touch-to-Speak Communication Board'}
            </h1>
            {qrSheet?.sub && (
              <p className={`text-xs font-semibold mt-0.5 ${isHC ? 'text-yellow-200' : 'text-slate-400'}`}>
                {qrSheet.sub}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Live Visual Theme Switcher */}
            <div
              className={`inline-flex items-center rounded-xl border p-1 text-xs font-bold ${
                isHC ? 'border-[#FFF04B] bg-black' : 'border-slate-800 bg-slate-900'
              }`}
            >
              <Eye className="h-3.5 w-3.5 mx-1.5 opacity-70" />
              {([
                { id: 'color', label: 'Colour' },
                { id: 'high-contrast', label: 'High-Contrast' },
                { id: 'mono', label: 'Mono' },
              ] as const).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTheme(opt.id)}
                  className={`rounded-lg px-2.5 py-1 transition ${
                    theme === opt.id
                      ? isHC
                        ? 'bg-[#FFF04B] text-black font-black'
                        : 'bg-amber-500 text-slate-950 font-black'
                      : isHC
                        ? 'text-[#FFF04B] hover:bg-neutral-900'
                        : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {qrSheet && qrSheet.l.length > 0 && (
              <button
                type="button"
                onClick={speakWholeSheet}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black transition ${
                  isHC
                    ? 'bg-[#FFF04B] text-black hover:bg-yellow-300'
                    : 'bg-[#D45A1A] text-white hover:bg-[#B84710]'
                }`}
              >
                <Play className="h-3.5 w-3.5" />
                <span>Read Whole Sheet</span>
              </button>
            )}

            <Link
              to="/studio"
              className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                isHC
                  ? 'border-[#FFF04B] text-[#FFF04B] hover:bg-neutral-900'
                  : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
              }`}
            >
              Open Studio
            </Link>
          </div>
        </div>

        {/* Live Speech Banner */}
        <div
          className={`rounded-2xl border-2 p-4 sm:p-5 flex items-center justify-between gap-4 ${
            isHC
              ? 'border-[#FFF04B] bg-[#FFF04B] text-black'
              : 'border-slate-800 bg-slate-900/90 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Volume2 className={`h-6 w-6 shrink-0 ${isHC ? 'text-black' : 'text-amber-400'}`} />
            <span className="text-lg sm:text-xl font-extrabold leading-snug">{spoken}</span>
          </div>
          <button
            type="button"
            onClick={() => speak(spoken)}
            title="Repeat last phrase"
            className={`shrink-0 rounded-xl p-2.5 transition ${
              isHC ? 'bg-black text-[#FFF04B]' : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
            }`}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Full Sentence Strips (when opened from a QR-Bridge A4 Sheet) */}
        {qrSheet && qrSheet.l.length > 0 && (
          <div className="space-y-2.5">
            <p
              className={`text-[11px] font-extrabold uppercase tracking-wider ${
                isHC ? 'text-[#FFF04B]' : 'text-slate-400'
              }`}
            >
              Tap a step to hear it aloud
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              {qrSheet.l.map((line, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => speak(line)}
                  className={`w-full rounded-2xl border-2 px-5 py-4 text-left flex items-center justify-between gap-4 transition ${
                    isHC
                      ? 'border-[#FFF04B] bg-black text-[#FFF04B] hover:bg-[#FFF04B] hover:text-black'
                      : 'border-slate-800 bg-slate-900 text-white hover:border-amber-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-base sm:text-lg font-bold leading-snug">{line}</span>
                  <Volume2 className="h-5 w-5 shrink-0 opacity-80" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tap-to-Speak Visual Symbol Cards */}
        <div className="space-y-2.5">
          <p
            className={`text-[11px] font-extrabold uppercase tracking-wider ${
              isHC ? 'text-[#FFF04B]' : 'text-slate-400'
            }`}
          >
            {qrSheet ? 'Key Word & Symbol Cards' : 'Quick Communication Cards'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {qrSheet && qrSheet.c.length > 0
              ? qrSheet.c.map((card, idx) => (
                  <button
                    key={`${card.w}-${idx}`}
                    type="button"
                    onClick={() => speak(card.w)}
                    className={`rounded-2xl border-2 p-5 flex flex-col items-center justify-between gap-3 min-h-[168px] transition active:scale-[0.98] ${
                      isHC
                        ? 'border-[#FFF04B] bg-[#FFF04B] text-black hover:bg-yellow-300'
                        : 'border-slate-800 bg-white text-slate-950 hover:border-amber-400 shadow-sm'
                    }`}
                  >
                    <div className="h-20 w-20 flex items-center justify-center">
                      {card.s ? (
                        <SparkSymbol src={card.s} alt={card.w} theme={theme} className="h-20 w-20" />
                      ) : (
                        <Volume2 className="h-10 w-10 opacity-40" />
                      )}
                    </div>
                    <span className="text-lg font-black text-center leading-tight">{card.w}</span>
                  </button>
                ))
              : DEFAULT_CARDS.map((card) => (
                  <button
                    key={card.label}
                    type="button"
                    onClick={() => speak(card.phrase)}
                    className={`rounded-2xl border-2 p-5 flex flex-col items-center justify-between gap-3 min-h-[176px] transition active:scale-[0.98] ${
                      isHC
                        ? 'border-[#FFF04B] bg-[#FFF04B] text-black hover:bg-yellow-300'
                        : 'border-slate-800 bg-white text-slate-950 hover:border-amber-400 shadow-sm'
                    }`}
                  >
                    <div className="h-20 w-20 flex items-center justify-center">
                      <SparkSymbol src={card.svgPath} alt={card.label} theme={theme} className="h-20 w-20" />
                    </div>
                    <span className="text-lg font-black text-center leading-tight">{card.label}</span>
                  </button>
                ))}
          </div>
        </div>
      </div>

      <footer
        className={`max-w-5xl mx-auto w-full pt-8 mt-8 border-t text-xs flex flex-wrap justify-between gap-2 ${
          isHC ? 'border-neutral-800 text-yellow-200' : 'border-slate-900 text-slate-500'
        }`}
      >
        <span>Spark Symbol Studio • Offline Zero-PII Kiosk Talker</span>
        <Link to="/" className="hover:underline">
          Platform Home
        </Link>
      </footer>
    </div>
  );
};
