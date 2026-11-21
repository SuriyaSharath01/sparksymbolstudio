import React, { useEffect, useMemo, useState } from 'react';
import { Download, QrCode, ShieldCheck, Upload, X } from 'lucide-react';
import type { CommunicationPassport } from '../../types/passport';
import {
  buildOfflineHandoverMatrixSvg,
  createPassportBundle,
  downloadPassportBundleJson,
  restoreWordMappingsFromBundle,
  type SparkPassportBundle,
} from '../../utils/passportBundle';

interface Props {
  passport: CommunicationPassport;
  onClose: () => void;
  onImportedBundle?: (bundle: SparkPassportBundle, restoredWords: number) => void;
}

export const PassportBundleModal: React.FC<Props> = ({
  passport,
  onClose,
  onImportedBundle,
}) => {
  const [bundle, setBundle] = useState<SparkPassportBundle | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>('');

  useEffect(() => {
    void createPassportBundle(passport).then(setBundle);
  }, [passport]);

  const compactSummary = useMemo(() => {
    return JSON.stringify({
      id: passport.id,
      initials: passport.residentInitials,
      lowArousal: passport.profile.requiresLowArousal,
      font: passport.profile.fontFamily,
      nextReview: passport.nextReviewDue,
    });
  }, [passport]);

  const qrSvgDataUrl = useMemo(() => {
    const svg = buildOfflineHandoverMatrixSvg(compactSummary);
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, [compactSummary]);

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as SparkPassportBundle;
      if (!parsed.passport || parsed.schemaVersion !== '1.0') {
        setStatusMsg('Invalid Passport bundle file.');
        return;
      }
      const restoredCount = await restoreWordMappingsFromBundle(parsed);
      setStatusMsg(
        `Restored Passport (${parsed.passport.residentInitials}) and ${restoredCount} custom word mapping(s).`
      );
      window.dispatchEvent(new CustomEvent('spark:bundle-imported', { detail: parsed }));
      onImportedBundle?.(parsed, restoredCount);
    } catch {
      setStatusMsg('Could not read JSON bundle.');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-[#E36C2B]" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Zero Lock-In Passport Continuity Bundle
              </h3>
              <p className="text-[11px] font-medium text-slate-500">
                Portable JSON + Offline QR Code for care transfers &amp; hospital admissions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-12">
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-5">
            <img
              src={qrSvgDataUrl}
              alt="Offline Passport QR Handover Code"
              className="h-32 w-32 rounded-lg border border-slate-200 bg-white p-1.5"
            />
            <span className="mt-2 text-center text-[10px] font-extrabold uppercase tracking-wide text-slate-600">
              Offline Handover Matrix
            </span>
          </div>

          <div className="space-y-2.5 sm:col-span-7">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
              <p className="font-extrabold text-slate-900">
                Resident: {passport.residentInitials || 'General'}
              </p>
              <p className="mt-0.5 text-slate-600">
                Low-Arousal Mode:{' '}
                <strong>{passport.profile.requiresLowArousal ? 'Required' : 'Standard'}</strong>
              </p>
              <p className="text-slate-600">
                AIS Next Review: <strong>{passport.nextReviewDue}</strong>
              </p>
              <p className="text-slate-600">
                Saved Custom Words:{' '}
                <strong>{bundle ? Object.keys(bundle.wordMappings).length : 0}</strong>
              </p>
            </div>

            <button
              type="button"
              disabled={!bundle}
              onClick={() => bundle && downloadPassportBundleJson(bundle)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#E36C2B] px-3.5 py-2 text-xs font-extrabold text-white hover:bg-[#c85a1e] disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              Download Portable Bundle (.json)
            </button>

            <label className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-50">
              <Upload className="h-3.5 w-3.5" />
              Import Bundle From Another Device
              <input
                type="file"
                accept=".json,application/json"
                onChange={(e) => void handleImportFile(e)}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {statusMsg && (
          <div className="mt-3 flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{statusMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
