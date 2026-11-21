import React, { useState } from 'react';
import { PassportBundleModal } from './PassportBundleModal';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { CommunicationPassport } from '../../types/passport';

interface Props {
  passport: CommunicationPassport;
  onLogReview: (initials: string, notes?: string) => void;
  onExportCqc?: () => void;
}

export const AISReviewBanner: React.FC<Props> = ({ passport, onLogReview, onExportCqc }) => {
  const [initials, setInitials] = useState('');
  const [justLogged, setJustLogged] = useState(false);
  const [showBundleModal, setShowBundleModal] = useState(false);

  const isOverdue = new Date(passport.nextReviewDue) < new Date();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = initials.trim().toUpperCase();
    if (!clean) return;
    onLogReview(clean);
    setInitials('');
    setJustLogged(true);
    window.setTimeout(() => setJustLogged(false), 2500);
  };

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border-l-4 p-3 shadow-2xs ${
        isOverdue
          ? 'border-red-600 bg-red-50 text-red-950'
          : 'border-emerald-600 bg-emerald-50 text-emerald-950'
      }`}
    >
      <div className="flex items-center gap-3">
        {isOverdue ? (
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
        ) : (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
        )}
        <div>
          <p className="text-xs font-extrabold sm:text-sm">
            AIS Step 6 (Review): {isOverdue ? 'Review Due / Overdue' : 'Up to Date'}
            {justLogged && (
              <span className="ml-2 rounded-full bg-emerald-700 px-2 py-0.5 text-[11px] font-bold text-white">
                Logged
              </span>
            )}
          </p>
          <p className="text-[11px] font-medium text-slate-700">
            Resident: <strong>{passport.residentInitials || 'Unset'}</strong> · Next Review Due:{' '}
            <strong>{passport.nextReviewDue}</strong> · Reviews logged: {passport.reviewLog.length}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
          <input
            type="text"
            maxLength={8}
            value={initials}
            onChange={(e) => setInitials(e.target.value)}
            placeholder="Staff initials"
            aria-label="Staff initials for AIS review"
            className="h-8 w-28 rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-slate-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!initials.trim()}
            className="h-8 rounded-lg bg-slate-900 px-3 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Log Review
          </button>
        </form>

        <button
          type="button"
          onClick={() => setShowBundleModal(true)}
          className="h-8 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-800 transition hover:bg-slate-100"
        >
          Bundle &amp; QR
        </button>
        {onExportCqc && (
          <button
            type="button"
            onClick={onExportCqc}
            className="h-8 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-800 transition hover:bg-slate-100"
          >
            CQC CSV
          </button>
        )}
      </div>
      {showBundleModal && (
        <PassportBundleModal
          passport={passport}
          onClose={() => setShowBundleModal(false)}
        />
      )}
    </div>
  );
};
