import React, { useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { saveResidentPhoto, type ResidentPhotoItem } from '../../data/symbols';
import type { QuickCard, AppTab } from '../../App';

export interface MediaLibraryPanelProps {
  photos: ResidentPhotoItem[];
  photoLabel: string;
  setPhotoLabel: React.Dispatch<React.SetStateAction<string>>;
  photoContext: string;
  setPhotoContext: React.Dispatch<React.SetStateAction<string>>;
  savingPhoto: boolean;
  handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void> | void;
  handleDeletePhoto: (id: string) => Promise<void> | void;
  addTileToBoard: (card: QuickCard) => void;
  setActiveTab: React.Dispatch<React.SetStateAction<AppTab>>;
}


function buildCareVisualPrompt(rawSubject: string, styleMode: 'adult_clear' | 'older_contrast' | 'child_friendly', contextTag: string): string {
  const subject = rawSubject.trim() || 'everyday support item';
  const setting = contextTag.trim() || 'calm care environment';
  if (styleMode === 'older_contrast') {
    return `High-contrast, clear, dignified visual reference of ${subject} in a ${setting}, uncluttered background, natural lighting, easy to distinguish at a glance, UK adult care standard, no text clutter.`;
  }
  if (styleMode === 'child_friendly') {
    return `Clear, friendly, calm illustration of ${subject} in a ${setting}, soft non-overstimulating colours, clean edges, supportive visual aid, no scary or noisy elements.`;
  }
  return `Respectful, realistic, uncluttered visual representation of ${subject} in a ${setting}, calm natural lighting, clear focal object, dignified adult support style, zero text overlays.`;
}

async function createLocalCardFile(
  label: string,
  contextTag: string,
  styleMode: 'adult_clear' | 'older_contrast' | 'child_friendly'
): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  const isDark = styleMode === 'older_contrast';
  ctx.fillStyle = isDark ? '#0f172a' : styleMode === 'child_friendly' ? '#fff7ed' : '#f8fafc';
  ctx.fillRect(0, 0, 640, 640);

  ctx.strokeStyle = isDark ? '#38bdf8' : '#ea580c';
  ctx.lineWidth = 10;
  ctx.strokeRect(24, 24, 592, 592);

  // Calm focal badge circle
  ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
  ctx.beginPath();
  ctx.arc(320, 250, 118, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = isDark ? '#94a3b8' : '#cbd5e1';
  ctx.stroke();

  const initials = (label.trim().slice(0, 2) || 'SP').toUpperCase();
  ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
  ctx.font = '800 68px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, 320, 252);

  ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
  ctx.font = '800 38px system-ui, -apple-system, sans-serif';
  ctx.fillText(label.trim() || 'Custom Card', 320, 445);

  ctx.fillStyle = isDark ? '#cbd5e1' : '#64748b';
  ctx.font = '700 20px system-ui, -apple-system, sans-serif';
  ctx.fillText(`Context: ${contextTag || 'general'}`, 320, 505);

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to render PNG'));
        return;
      }
      resolve(new File([blob], `${(label || 'custom-card').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`, { type: 'image/png' }));
    }, 'image/png');
  });
}

export function MediaLibraryPanel(props: MediaLibraryPanelProps) {
  const {
    photos,
    photoLabel,
    setPhotoLabel,
    photoContext,
    setPhotoContext,
    savingPhoto,
    handlePhotoUpload,
    handleDeletePhoto,
    addTileToBoard,
    setActiveTab,
  } = props;

  const [customSubject, setCustomSubject] = useState('');
  const [styleMode, setStyleMode] = useState<'adult_clear' | 'older_contrast' | 'child_friendly'>('adult_clear');
  const [webhookUrl, setWebhookUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('spark_image_webhook_url') || '';
    } catch {
      return '';
    }
  });
  const [creatingCustom, setCreatingCustom] = useState(false);
  const [studioMessage, setStudioMessage] = useState<string | null>(null);

  return (
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-base font-extrabold text-slate-900">
              Real Photos (Saved Locally on Device)
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Upload photos of real rooms, mugs, coats, venues, or staff. Saved in IndexedDB on this device only.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <input
                type="text"
                value={photoLabel}
                onChange={(e) => setPhotoLabel(e.target.value)}
                placeholder="Label (e.g. My blue mug, Bedroom door)"
                className="min-h-[40px] rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
              />
              <select
                value={photoContext}
                onChange={(e) => setPhotoContext(e.target.value)}
                className="min-h-[40px] rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
              >
                <option value="home">Home / Room / Item</option>
                <option value="community">Out &amp; About Venue</option>
                <option value="person">Trusted Person</option>
              </select>
              <label className="flex min-h-[40px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800">
                <Camera />
                <span>{savingPhoto ? 'Saving...' : 'Upload Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
            {photos.length === 0 ? (
              <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs text-slate-500">
                No local photos saved on this device yet. Add a label, pick a context, and upload a photo to start.
              </div>
            ) : (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-center"
                >
                  <img
                    src={photo.dataUrl}
                    alt={photo.label}
                    className="h-24 w-full rounded-lg object-cover"
                  />
                  <p className="mt-2 truncate text-xs font-extrabold text-slate-900">
                    {photo.label}
                  </p>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        addTileToBoard({
                          id: photo.id,
                          title: photo.label,
                          actionText: photo.label,
                          keywords: [photo.label],
                          imageSrc: photo.dataUrl,
                        });
                        setActiveTab('templates');
                      }}
                      className="rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white"
                    >
                      Add to Grid
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo.id)}
                      aria-label={`Delete ${photo.label}`}
                      className="rounded p-1 text-slate-500 hover:bg-slate-200"
                    >
                      <Trash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            )}
          
        <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Create Custom Care Picture</h3>
              <p className="text-xs text-slate-600">
                Build a calm, age-appropriate card locally on this device or generate via your n8n webhook without storing keys in the browser.
              </p>
            </div>
            <span className="rounded bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
              Saved locally in IndexedDB
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              type="text"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              placeholder="Subject or card label (e.g. Blue Mug)"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
            />
            <select
              value={styleMode}
              onChange={(e) => setStyleMode(e.target.value as 'adult_clear' | 'older_contrast' | 'child_friendly')}
              aria-label="Visual style and age calibration"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
            >
              <option value="adult_clear">Adult Clear (Dignified, Low Clutter)</option>
              <option value="older_contrast">Older Adult High-Contrast</option>
              <option value="child_friendly">Child Friendly (Calm Visuals)</option>
            </select>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => {
                setWebhookUrl(e.target.value);
                try {
                  localStorage.setItem('spark_image_webhook_url', e.target.value);
                } catch {}
              }}
              placeholder="Optional n8n webhook URL"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
            />
          </div>

          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-600">
            <span className="font-bold text-slate-800">Prompt preview: </span>
            {buildCareVisualPrompt(customSubject || photoLabel, styleMode, photoContext)}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={creatingCustom}
              onClick={async () => {
                try {
                  setCreatingCustom(true);
                  setStudioMessage(null);
                  const label = customSubject.trim() || photoLabel.trim() || 'Custom Card';
                  const prompt = buildCareVisualPrompt(label, styleMode, photoContext);
                  let fileToSave: File;

                  if (webhookUrl.trim()) {
                    const res = await fetch(webhookUrl.trim(), {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ prompt, label, contextTag: photoContext, styleMode }),
                    });
                    if (!res.ok) throw new Error(`Webhook returned ${res.status}`);
                    const data = await res.json();
                    const imgSrc: string = data.dataUrl || data.imageBase64 || data.url || '';
                    if (!imgSrc) throw new Error('No image returned from webhook');
                    const blob = await (await fetch(imgSrc)).blob();
                    fileToSave = new File([blob], 'generated-care-card.png', { type: blob.type || 'image/png' });
                  } else {
                    fileToSave = await createLocalCardFile(label, photoContext, styleMode);
                  }

                  await saveResidentPhoto(fileToSave, label, photoContext);
                  setStudioMessage(`Saved "${label}" to local library. Refresh or switch tabs to see it in your gallery.`);
                  setCustomSubject('');
                } catch (err) {
                  setStudioMessage(err instanceof Error ? err.message : 'Could not create custom picture.');
                } finally {
                  setCreatingCustom(false);
                }
              }}
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-extrabold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {creatingCustom ? 'Creating...' : webhookUrl.trim() ? 'Generate via Webhook & Save' : 'Create Local Card & Save'}
            </button>

            {studioMessage && (
              <span className="text-xs font-semibold text-slate-700">{studioMessage}</span>
            )}
          </div>
        </div>

      </section>
  );
}
