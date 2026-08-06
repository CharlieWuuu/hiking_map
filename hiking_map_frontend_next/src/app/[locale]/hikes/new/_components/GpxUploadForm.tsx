'use client';

import { Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

import TrailLayer from '../../../../../components/MapView/TrailLayer';
import { useRouter } from '../../../../../i18n/navigation';
import { apiClient } from '../../../../../lib/apiClient';
import { useAuth } from '../../../../../lib/authStore';
import { GpxParseError, parseGpx, toFeatureCollection, type ParsedGpx } from '../../../../../lib/gpx/parseGpx';

const inputClassName = 'bg-panel text-background-contrary w-full rounded px-2 py-1.5 text-sm outline-none';

export default function GpxUploadForm() {
  const t = useTranslations('HikeUploadPage');
  const router = useRouter();
  // 用 selector 訂閱，store 其他欄位變動時不會重畫這個表單
  const username = useAuth((state) => state.username);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsed, setParsed] = useState<ParsedGpx | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 檔案解析後才知道預設值，所以表單欄位獨立於 parsed 之外
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    try {
      const result = parseGpx(await file.text());
      setParsed(result);
      setFileName(file.name);
      // GPX 裡的名稱常常是裝置自動產生的，讓使用者可以改
      setName(result.name ?? file.name.replace(/\.gpx$/i, ''));
      setDate(result.date ?? new Date().toISOString().slice(0, 10));
    } catch (caught) {
      setParsed(null);
      setFileName(null);
      setError(caught instanceof GpxParseError ? caught.message : t('parseFailed'));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!parsed) return;

    setError(null);
    setIsSubmitting(true);
    try {
      const hike = await apiClient.hikes.create({
        name,
        date,
        distanceKm: Number(parsed.distanceKm.toFixed(2)),
        isPublic,
        note: note || undefined,
        geojson: toFeatureCollection(parsed),
      });
      router.push(`/profile/${username}/hikes/${hike.id}`);
    } catch {
      setError(t('submitFailed'));
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="border-background-contrary/30 hover:bg-panel flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-10 transition-colors"
      >
        <Upload className="text-background-contrary/60 h-6 w-6" />
        <span className="text-sm">{fileName ?? t('choosePrompt')}</span>
        <span className="text-background-contrary/60 text-xs">{t('chooseHint')}</span>
      </button>
      <input ref={fileInputRef} type="file" accept=".gpx,application/gpx+xml" onChange={handleFileChange} className="hidden" />

      {error && <p className="text-sm text-red-500">{error}</p>}

      {parsed && (
        <>
          <div className="h-80 w-full overflow-hidden rounded-lg">
            {/* 預覽只畫第一段，段與段之間本來就是斷開的 */}
            <TrailLayer path={parsed.segments[0].map((point) => point.position)} />
          </div>

          <dl className="text-background-contrary/80 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-background-contrary/60 text-xs">{t('distance')}</dt>
              <dd className="font-bold">{t('distanceValue', { distance: parsed.distanceKm })}</dd>
            </div>
            {parsed.elevationGainM !== null && (
              <div>
                <dt className="text-background-contrary/60 text-xs">{t('elevationGain')}</dt>
                <dd className="font-bold">{t('elevationGainValue', { meters: parsed.elevationGainM })}</dd>
              </div>
            )}
            <div>
              <dt className="text-background-contrary/60 text-xs">{t('segments')}</dt>
              <dd className="font-bold">{parsed.segments.length}</dd>
            </div>
            <div>
              <dt className="text-background-contrary/60 text-xs">{t('points')}</dt>
              <dd className="font-bold">{parsed.pointCount}</dd>
            </div>
          </dl>

          <label className="flex flex-col gap-1">
            <span className="text-background-contrary/60 text-sm">{t('name')}</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClassName} />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-background-contrary/60 text-sm">{t('date')}</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputClassName} />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-background-contrary/60 text-sm">{t('note')}</span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className={inputClassName} />
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            {t('isPublic')}
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-panel-active hover:bg-panel-active-lighten rounded-panel w-fit cursor-pointer px-4 py-2 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? t('submitting') : t('submit')}
          </button>
        </>
      )}
    </form>
  );
}
