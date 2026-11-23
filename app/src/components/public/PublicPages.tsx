import { KioskTalkerView } from './KioskTalkerView';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { PublicLayout } from './PublicLayout';
import { RESOURCE_REGISTRY_LIST, type SupportPack } from '../../data/resource-registry';
import { CORE_CARDS } from '../../data/core-cards';
import { exportCQCEvidence } from '../../utils/cqcExport';

const NON_READER_WORDS = [
  { term: 'förberedelse', clue: 'Getting ready before a change', plain: 'Prepare' },
  { term: 'vårdplan', clue: 'Daily care and support guide', plain: 'Care Plan' },
  { term: 'överkänslighet', clue: 'Strong reaction to noise or light', plain: 'Sensory Overload' },
  { term: 'tillgänglighet', clue: 'Easy to reach and understand', plain: 'Accessibility' },
  { term: 'samtycke', clue: 'Clear agreement and choice', plain: 'Consent' },
  { term: 'återhämtning', clue: 'Rest and calm recovery time', plain: 'Calm Down' },
];

export const AboutSymbolsPage: React.FC = () => {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const toggleReveal = (term: string) => {
    setRevealed((prev) => ({ ...prev, [term]: !prev[term] }));
  };

  return (
    <PublicLayout>
      <section className="bg-slate-50 border-b border-slate-200 py-14 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-xs font-bold uppercase tracking-wider text-[#D45A1A] mb-2">
            Symbol Literacy &amp; Clinical Practice
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 mb-4">
            About Symbols, Comprehension &amp; UK Legal Duties
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Symbols pair clear visual concepts with concise text so adults, children, and patients with communication or literacy barriers can understand information and make informed choices.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-14 space-y-16">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: 'Adults & Children with Learning Disabilities or Autism',
              text: 'Visual supports reduce reliance on dense written text or fleeting spoken instructions, supporting autonomy, routine predictability, and emotional regulation.',
            },
            {
              title: 'People with Aphasia, Stroke or Neuro-Conditions',
              text: 'Clear symbol boards and touch-to-speak talkers help individuals express pain, choices, and everyday needs when speech is limited or fatigued.',
            },
            {
              title: 'Dyslexia & Low Functional Literacy',
              text: 'Pairing structured text with calm layouts, dyslexia-friendly fonts (OpenDyslexic / Lexend), and symbols lowers cognitive load.',
            },
            {
              title: 'English as an Additional Language (EAL)',
              text: 'Shared visual concepts bridge language gaps in care homes, clinics, and classrooms while supporting bilingual understanding.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-base font-extrabold text-slate-900 mb-2">{item.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </section>

        <section id="non-reader-test" className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#D45A1A]">
                Interactive Experience
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                What does unfamiliar text feel like?
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Tap any card below to reveal plain-English meaning and visual context.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const allOpen = NON_READER_WORDS.every((w) => revealed[w.term]);
                const next: Record<string, boolean> = {};
                NON_READER_WORDS.forEach((w) => {
                  next[w.term] = !allOpen;
                });
                setRevealed(next);
              }}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 transition"
            >
              Toggle All Meanings
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {NON_READER_WORDS.map((item) => {
              const isOpen = Boolean(revealed[item.term]);
              return (
                <button
                  key={item.term}
                  type="button"
                  onClick={() => toggleReveal(item.term)}
                  className={`text-left rounded-xl border p-4 transition ${
                    isOpen
                      ? 'border-emerald-400 bg-white shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-base font-extrabold text-slate-900">{item.term}</span>
                    {isOpen ? (
                      <Eye className="h-4 w-4 text-emerald-700 shrink-0" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                  </div>
                  {isOpen ? (
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-emerald-800">{item.plain}</div>
                      <div className="text-xs text-slate-600">{item.clue}</div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500">Tap to decode meaning</div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section id="clinical-rules" className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
            <h2 className="text-xl font-extrabold text-slate-900">Good Symbol Content Rules</h2>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#D45A1A] mt-0.5 shrink-0" />
                <span>Use plain, direct English and keep sentences concise (ideally 8 symbols or fewer per line).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#D45A1A] mt-0.5 shrink-0" />
                <span>Hide or simplify abstract filler words when they clutter comprehension.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#D45A1A] mt-0.5 shrink-0" />
                <span>Keep symbol choices consistent across routines, care plans, and signage.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
            <h2 className="text-xl font-extrabold text-slate-900">UK Legal &amp; Standard Alignment</h2>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" />
                <span><strong>Equality Act 2010:</strong> Reasonable adjustments to make information and services accessible.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" />
                <span><strong>NHS Accessible Information Standard (AIS):</strong> Identifying, recording, meeting, and reviewing accessible communication needs.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" />
                <span><strong>CQC Regulation 9:</strong> Person-centred care tailored to individual communication preferences.</span>
              </li>
            </ul>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-900 text-white p-6">
          <div>
            <h3 className="text-lg font-extrabold">Ready to build symbol supports in practice?</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Open Spark Studio or browse ready-made care and routine packs.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/resources"
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              Browse Resources
            </Link>
            <Link
              to="/studio"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#D45A1A] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#b84710] transition"
            >
              <span>Open Spark Studio</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

interface SectorPageProps {
  sectorKey: 'adult-social-care' | 'nhs-health' | 'send-education' | 'families-carers';
}

const SECTOR_CONTENT: Record<
  SectorPageProps['sectorKey'],
  { badge: string; title: string; lead: string; bullets: string[]; ctaLabel: string }
> = {
  'adult-social-care': {
    badge: 'Adult Social Care & Supported Living',
    title: 'Person-centred visual supports & CQC / AIS audit readiness',
    lead: 'Support shift teams, managers, and residents with fast visual boards, Easy Read care information, Resident DNA adaptation, and offline reliability.',
    bullets: [
      'Hospital passports, daily routines, meal & drink choices, and calm-down sequences ready in seconds.',
      'AIS Step 6 review stamps and one-click CQC evidence CSV exports.',
      'Zero-PII local browser storage with portable Open Board Format (.obf) exports.',
    ],
    ctaLabel: 'Open Care Studio',
  },
  'nhs-health': {
    badge: 'NHS, Acute Care & Emergency',
    title: 'Clear visual communication under clinical & sensory pressure',
    lead: 'Help patients communicate pain, symptoms, and preferences during appointments, diagnostics, and hospital stays.',
    bullets: [
      'Now / Next / Then step sequences to reduce anxiety during unfamiliar clinical procedures.',
      'High-contrast and low-arousal layouts with UK text-to-speech playback.',
      'Works offline across wards or clinics where connectivity is unreliable.',
    ],
    ctaLabel: 'Launch Clinical Workspace',
  },
  'send-education': {
    badge: 'SEND & Inclusive Education',
    title: 'Visual timetables, regulation tools & EAL vocabulary support',
    lead: 'Build structured routines, emotion scales, and symbol-supported language strips for classrooms and support sessions.',
    bullets: [
      'Fitzgerald Key colour-coding and 8-symbol sentence comprehension guidance.',
      'OpenDyslexic and Lexend font options plus warm tint backgrounds.',
      'Unlimited symbol printing with zero per-symbol royalty restrictions.',
    ],
    ctaLabel: 'Open Education Studio',
  },
  'families-carers': {
    badge: 'Families, Carers & Home',
    title: 'Practical communication tools at home without subscription lock-in',
    lead: 'Create personalised home routines, choice boards, and touch-to-speak talker screens that stay yours forever.',
    bullets: [
      'Pair familiar routines with custom photos and save portable .obf files.',
      'Switch any board into a PIN-locked Kiosk talker view on a tablet.',
      'No 100-symbol cap or recurring lock-in on your own boards.',
    ],
    ctaLabel: 'Start Building',
  },
};

export const SectorPage: React.FC<SectorPageProps> = ({ sectorKey }) => {
  const data = SECTOR_CONTENT[sectorKey];
  return (
    <PublicLayout>
      <section className="bg-slate-50 border-b border-slate-200 py-14 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-xs font-bold uppercase tracking-wider text-[#D45A1A] mb-2">
            {data.badge}
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 mb-4">
            {data.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">{data.lead}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/studio"
              className="inline-flex items-center gap-2 rounded-xl bg-[#D45A1A] px-5 py-3 text-sm font-bold text-white hover:bg-[#b84710] transition"
            >
              <span>{data.ctaLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/trust"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-100 transition"
            >
              View Governance &amp; DPIA
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-14">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900">Key Workflow Benefits</h2>
          <ul className="space-y-3 text-sm text-slate-700">
            {data.bullets.map((b) => (
              <li key={b} className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PublicLayout>
  );
};

export const ResourcesPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const filtered: SupportPack[] = RESOURCE_REGISTRY_LIST.filter((r) => {
    const sectorMatch =
      selectedSector === 'All' ||
      r.sector === selectedSector ||
      (selectedSector === 'Dual-Language / EAL' && Array.isArray(r.languages) && r.languages.length > 0);
    if (!sectorMatch) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      r.title.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      (r.sector ? r.sector.toLowerCase().includes(q) : false) ||
      (r.languages ? r.languages.some((l) => l.toLowerCase().includes(q)) : false) ||
      r.steps.some((s) => s.label.toLowerCase().includes(q) || s.instruction.toLowerCase().includes(q))
    );
  });

  return (
    <PublicLayout>
      <section className="bg-slate-50 border-b border-slate-200 py-14 px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#D45A1A] mb-2">
              Ready-Made Care &amp; Routine Library
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">
              Symbol Resource Packs
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl">
              Explore structured communication routines and open any pack directly inside Spark Studio to customise, print A4/Pocket sheets, or run in Kiosk mode.
            </p>
          </div>
          <div className="w-full md:w-72">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter packs (e.g. routine, NHS, Telugu)..."
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-[#D45A1A] focus:outline-none"
            />
          </div>
        </div>
        <div className="mx-auto max-w-7xl mt-6 flex flex-wrap gap-2">
          {['All', 'Adult Social Care', 'NHS & Health', 'SEND Education', 'Dual-Language / EAL'].map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setSelectedSector(sec)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                selectedSector === sec
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((pack) => (
            <div
              key={pack.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between gap-4 hover:shadow-sm transition"
            >
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#B84710] mb-1">
                  {pack.category}
                </div>
                <h2 className="text-lg font-extrabold text-slate-900">{pack.title}</h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  {pack.steps[0]?.instruction || "Structured visual support sequence ready for studio customisation and A4/Pocket printing."}
                </p>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {pack.steps.slice(0, 4).map((step) => {
                    const thumbSrc = step.symbol || (step.coreCardId ? CORE_CARDS[step.coreCardId]?.imageSrc : undefined);
                    return (
                      <div
                        key={step.id}
                        className="flex flex-col items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50/80 p-2 text-center"
                      >
                        <div className="flex h-10 w-10 items-center justify-center">
                          {thumbSrc ? (
                            <img
                              src={thumbSrc}
                              alt={step.label}
                              className="max-h-10 max-w-10 object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-[11px] font-extrabold text-slate-400">
                              {step.label.slice(0, 3).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="mt-1.5 line-clamp-1 w-full text-[11px] font-bold text-slate-800">
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {pack.steps.length > 4 && (
                  <div className="mt-2 text-[11px] font-semibold text-slate-500">
                    +{pack.steps.length - 4} additional symbol steps included in pack
                  </div>
                )}
              </div>

              <Link
                to="/studio"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                <span>Open in Spark Studio</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
};

export const TrustPage: React.FC = () => {
  const [sampleExported, setSampleExported] = useState(false);

  const handleSampleCsvExport = () => {
    const today = new Date().toISOString().slice(0, 10);
    exportCQCEvidence([
      {
        id: 'ais-sample-1',
        residentInitials: 'R.A.',
        createdAt: today,
        lastReviewedAt: today,
        nextReviewDue: '2027-02-22',
        profile: {
          fontFamily: 'opendyslexic',
          pageBackground: '#F5F0E6',
          symbolSet: 'mixed',
          requiresLowArousal: true,
          requiresHighContrast: false,
          customPhotoBindings: {},
        },
        reviewLog: [
          {
            reviewedAt: today,
            reviewedBy: 'Care Lead',
            notes: 'AIS Step 6 communication review verified',
          },
        ],
      },
    ]);
    setSampleExported(true);
  };

  return (
    <PublicLayout>
      <section className="bg-slate-50 border-b border-slate-200 py-14 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
            Procurement, Information Governance &amp; Compliance
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 mb-4">
            Zero-PII Architecture, DPIA Readiness &amp; CQC / AIS Support
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
            Built for UK care managers, NHS clinical teams, and IT governance leads who need offline reliability, clear auditability, and zero vendor lock-in.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-14 space-y-12">
        <section id="zero-pii" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <Lock className="h-6 w-6 text-slate-900 mb-3" />
            <h2 className="text-base font-extrabold text-slate-900 mb-2">Zero-PII Local Processing</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Resident profiles, custom word lists, and local photos stay in browser storage / IndexedDB on the user&apos;s device rather than being uploaded to external servers.
            </p>
          </div>
          <div id="cqc-ais" className="rounded-2xl border border-slate-200 bg-white p-6">
            <ShieldCheck className="h-6 w-6 text-emerald-700 mb-3" />
            <h2 className="text-base font-extrabold text-slate-900 mb-2">AIS Step 6 &amp; CQC Reg 9</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Record communication format preferences, review dates, and resident initials so care teams can demonstrate ongoing Accessible Information Standard compliance.
            </p>
          </div>
          <div id="licensing" className="rounded-2xl border border-slate-200 bg-white p-6">
            <FileSpreadsheet className="h-6 w-6 text-[#D45A1A] mb-3" />
            <h2 className="text-base font-extrabold text-slate-900 mb-2">Open Standards &amp; Licensing</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Combines commercial-safe open symbol sets (CC BY-SA 4.0 and OpenMoji) with portable Open Board Format (.obf) exports—no 100-symbol cap.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-8 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                DPIA &amp; Governance Summary for Care Managers
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Key points for internal UK GDPR / Data Protection Impact Assessment reviews:
              </p>
            </div>
            <button
              type="button"
              onClick={handleSampleCsvExport}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>{sampleExported ? 'Sample AIS CSV Downloaded' : 'Download Sample AIS Step 6 CSV'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <strong className="block text-slate-900 mb-1">Data Minimisation</strong>
              Use initials or care reference codes rather than full personal identifiers when logging visual support reviews.
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <strong className="block text-slate-900 mb-1">Resilience &amp; Continuity</strong>
              Service Worker caches core assets and symbol manifests so frontline support continues without internet dependency.
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};

export const KioskPage: React.FC = () => <KioskTalkerView />;
