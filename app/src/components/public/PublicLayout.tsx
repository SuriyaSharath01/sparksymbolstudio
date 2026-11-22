import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Building2,
  FileCheck2,
  WifiOff,
  ArrowUpRight,
} from 'lucide-react';
import SparkLogo from '../SparkLogo';

interface PublicLayoutProps {
  children: React.ReactNode;
}

type MegaMenuKey = 'platform' | 'symbols' | 'sectors' | 'resources' | null;

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const [openMenu, setOpenMenu] = useState<MegaMenuKey>(null);
  const location = useLocation();

  const toggleMenu = (key: MegaMenuKey) => {
    setOpenMenu((prev) => (prev === key ? null : key));
  };

  const closeMenus = () => setOpenMenu(null);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans antialiased">
      <div className="bg-slate-950 text-slate-200 text-xs border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            <span>
              <strong>Unlimited Symbol Printing.</strong> No 100-symbol caps. No hidden royalty fees. CC BY-SA 4.0 &amp; OpenMoji ready.
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span className="inline-flex items-center gap-1">
              <WifiOff className="h-3.5 w-3.5 text-amber-400" />
              Zero-PII Offline PWA
            </span>
            <Link to="/trust" onClick={closeMenus} className="underline hover:text-white">
              CQC &amp; AIS Step 6 Hub
            </Link>
          </div>
        </div>
      </div>

      <header
        className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200"
        onMouseLeave={closeMenus}
      >
        <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between gap-4">
          <Link to="/" onClick={closeMenus} className="flex items-center gap-3 group">
            <SparkLogo className="h-10 w-10 text-[#D45A1A] transition-transform group-hover:scale-105" />
            <div>
              <div className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                Spark
              </div>
              <div className="text-[11px] font-semibold text-slate-500 tracking-wide mt-0.5">
                Accessible Communication OS
              </div>
            </div>
          </Link>

          <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-1">
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleMenu('platform')}
                onMouseEnter={() => setOpenMenu('platform')}
                className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                  location.pathname === '/' && openMenu === 'platform'
                    ? 'bg-amber-50 text-[#D45A1A]'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <span>Platform</span>
                <ChevronDown className="h-4 w-4 opacity-70" />
              </button>
              {openMenu === 'platform' && (
                <div className="absolute left-0 top-full mt-1 w-[460px] rounded-2xl bg-white p-5 shadow-xl border border-slate-200 grid grid-cols-1 gap-3">
                  <Link
                    to="/#live-demo"
                    onClick={closeMenus}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition"
                  >
                    <Sparkles className="h-5 w-5 text-[#D45A1A] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-slate-900">Live Sentence Strip Demo</div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Type any everyday sentence and test live symbol matching and UK speech right on the page.
                      </p>
                    </div>
                  </Link>
                  <Link
                    to="/studio"
                    onClick={closeMenus}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition"
                  >
                    <BookOpen className="h-5 w-5 text-slate-800 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-slate-900">Spark Studio Workspace</div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Boards, Now/Next/Then sequences, Easy Read scrubbing, Resident DNA, A4/Pocket print, and Live Talker.
                      </p>
                    </div>
                  </Link>
                  <Link
                    to="/trust"
                    onClick={closeMenus}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition"
                  >
                    <ShieldCheck className="h-5 w-5 text-emerald-700 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-slate-900">Procurement, DPIA &amp; Governance</div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Zero-PII offline storage, CQC Regulation 9 evidence export, AIS Step 6 tracking, and open .obf portability.
                      </p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => toggleMenu('symbols')}
                onMouseEnter={() => setOpenMenu('symbols')}
                className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                  location.pathname.startsWith('/about-symbols')
                    ? 'bg-amber-50 text-[#D45A1A]'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <span>About Symbols</span>
                <ChevronDown className="h-4 w-4 opacity-70" />
              </button>
              {openMenu === 'symbols' && (
                <div className="absolute left-0 top-full mt-1 w-[460px] rounded-2xl bg-white p-5 shadow-xl border border-slate-200 grid grid-cols-1 gap-3">
                  <Link
                    to="/about-symbols"
                    onClick={closeMenus}
                    className="block p-3 rounded-xl hover:bg-slate-50 transition"
                  >
                    <div className="text-sm font-bold text-slate-900">What Symbols Are &amp; Who Uses Them</div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Supporting adults with learning disabilities, autism, aphasia, dyslexia, and English as an additional language.
                    </p>
                  </Link>
                  <Link
                    to="/about-symbols#non-reader-test"
                    onClick={closeMenus}
                    className="block p-3 rounded-xl hover:bg-slate-50 transition"
                  >
                    <div className="text-sm font-bold text-slate-900">Non-Reader Comprehension Challenge</div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Experience unfamiliar vocabulary first-hand and see how clear symbol support restores meaning.
                    </p>
                  </Link>
                  <Link
                    to="/about-symbols#clinical-rules"
                    onClick={closeMenus}
                    className="block p-3 rounded-xl hover:bg-slate-50 transition"
                  >
                    <div className="text-sm font-bold text-slate-900">Good Symbol Practice &amp; UK Legal Duties</div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Short sentence length, plain English, Equality Act 2010, and NHS Accessible Information Standard (AIS).
                    </p>
                  </Link>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => toggleMenu('sectors')}
                onMouseEnter={() => setOpenMenu('sectors')}
                className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                  location.pathname.startsWith('/sectors')
                    ? 'bg-amber-50 text-[#D45A1A]'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <span>Sectors</span>
                <ChevronDown className="h-4 w-4 opacity-70" />
              </button>
              {openMenu === 'sectors' && (
                <div className="absolute left-0 top-full mt-1 w-[440px] rounded-2xl bg-white p-5 shadow-xl border border-slate-200 grid grid-cols-1 gap-2">
                  {[
                    {
                      to: '/sectors/adult-social-care',
                      title: 'Adult Social Care & Supported Living',
                      desc: 'Care plans, hospital passports, daily routines, and CQC Regulation 9 / AIS Step 6 audit readiness.',
                    },
                    {
                      to: '/sectors/nhs-health',
                      title: 'NHS, Acute Care & Emergency',
                      desc: 'Pain scales, clinical procedure explanations, sensory support, and low-stress patient communication.',
                    },
                    {
                      to: '/sectors/send-education',
                      title: 'SEND & Inclusive Education',
                      desc: 'Visual timetables, Now/Next/Then transitions, emotional regulation, and EAL vocabulary support.',
                    },
                    {
                      to: '/sectors/families-carers',
                      title: 'Families, Carers & Independent Living',
                      desc: 'Practical home routines, choice boards, and touch-to-speak talker boards without subscription lock-in.',
                    },
                  ].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={closeMenus}
                      className="block p-3 rounded-xl hover:bg-slate-50 transition"
                    >
                      <div className="text-sm font-bold text-slate-900">{item.title}</div>
                      <p className="text-xs text-slate-600 mt-0.5">{item.desc}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/resources"
              onClick={closeMenus}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                location.pathname.startsWith('/resources')
                  ? 'bg-amber-50 text-[#D45A1A]'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              Resources
            </Link>

            <Link
              to="/trust"
              onClick={closeMenus}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                location.pathname.startsWith('/trust')
                  ? 'bg-amber-50 text-[#D45A1A]'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              Trust &amp; CQC
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/kiosk"
              onClick={closeMenus}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition"
            >
              <span>Kiosk Talker</span>
            </Link>
            <Link
              to="/studio"
              onClick={closeMenus}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#D45A1A] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#b94b13] transition"
            >
              <span>Open Spark Studio</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <SparkLogo className="h-8 w-8 text-[#E36C2B]" />
              <span className="text-lg font-extrabold text-white">Spark Symbol Studio</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Offline-first visual communication, Easy Read, and touch-to-speak platform designed for UK adult social care, healthcare, and inclusive education.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-[11px] text-emerald-300">
              <FileCheck2 className="h-3.5 w-3.5 shrink-0" />
              <span>Open Board Format (.obf) • Zero Lock-In</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-[#E36C2B]" />
              <span>Sectors</span>
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/sectors/adult-social-care" className="hover:text-white transition">Adult Social Care &amp; Care Homes</Link></li>
              <li><Link to="/sectors/nhs-health" className="hover:text-white transition">NHS, Acute Care &amp; Emergency</Link></li>
              <li><Link to="/sectors/send-education" className="hover:text-white transition">SEND &amp; Inclusive Education</Link></li>
              <li><Link to="/sectors/families-carers" className="hover:text-white transition">Families, Carers &amp; Home</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-[#E36C2B]" />
              <span>Symbols &amp; Guidance</span>
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/about-symbols" className="hover:text-white transition">What Symbols Are &amp; Who Uses Them</Link></li>
              <li><Link to="/about-symbols#non-reader-test" className="hover:text-white transition">Non-Reader Comprehension Test</Link></li>
              <li><Link to="/about-symbols#clinical-rules" className="hover:text-white transition">Good Symbol Content &amp; Legal Duties</Link></li>
              <li><Link to="/resources" className="hover:text-white transition">Ready-Made Care &amp; Routine Packs</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#E36C2B]" />
              <span>Governance &amp; Trust</span>
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/trust" className="hover:text-white transition">Procurement &amp; DPIA Overview</Link></li>
              <li><Link to="/trust#zero-pii" className="hover:text-white transition">Zero-PII &amp; UK GDPR Architecture</Link></li>
              <li><Link to="/trust#cqc-ais" className="hover:text-white transition">CQC Reg 9 &amp; AIS Step 6 Readiness</Link></li>
              <li><Link to="/trust#licensing" className="hover:text-white transition">Symbol Licensing &amp; Open Standards</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/90 bg-slate-950">
          <div className="mx-auto max-w-7xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} Spark Symbol Studio. Built for accessible UK communication.</p>
            <p>
              Symbol sets include commercial-safe open symbols (CC BY-SA 4.0 &amp; OpenMoji) with local IndexedDB persistence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
