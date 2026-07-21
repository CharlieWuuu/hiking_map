'use client';

import { Square } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import RecordLayer from '../../../components/MapView/RecordLayer';
import { useGpsTracker } from '../../../hooks/useGpsTracker';
import { useRouter } from '../../../i18n/navigation';
import { apiClient } from '../../../lib/apiClient';
import { useAuth } from '../../../lib/authStore';
import RecordCompleteForm, { type RecordCompleteFormValues } from './_components/RecordCompleteForm';

function formatElapsed(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
}

export default function RecordPage() {
  const t = useTranslations('RecordPage');
  const router = useRouter();
  const { username, isLoggedIn, isLoading } = useAuth();
  const { isRecording, path, distanceKm, error, start, stop } = useGpsTracker();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) router.push('/login');
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = window.setInterval(() => setElapsedSeconds((prev) => prev + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRecording]);

  function handleToggle() {
    if (isRecording) {
      stop();
      if (path.length > 1) setShowCompleteForm(true);
      return;
    }

    setElapsedSeconds(0);
    setShowCompleteForm(false);
    start();
  }

  async function handleSubmit(values: RecordCompleteFormValues) {
    setIsSubmitting(true);
    try {
      await apiClient.hikes.create({
        name: values.name,
        county: values.county || undefined,
        town: values.town || undefined,
        date: new Date().toISOString().slice(0, 10),
        distanceKm,
        isPublic: values.isPublic,
        note: values.note || undefined,
        geojson: {
          type: 'FeatureCollection',
          features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: path } }],
        },
      });
      router.push(username ? `/profile/${username}/data` : '/');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || !isLoggedIn) return null;

  return (
    <div className="flex w-full flex-col gap-6">
      <RecordLayer path={path} />

      {error && <p className="text-center text-sm text-red-500">{t(error === 'geolocation-unsupported' ? 'gpsUnsupported' : 'gpsDenied')}</p>}

      <div className="flex flex-wrap justify-around gap-4">
        <div className="flex flex-col items-center">
          <span className="text-background-contrary/60 text-xs">{t('elapsed')}</span>
          <p className="text-2xl font-bold">{formatElapsed(elapsedSeconds)}</p>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-background-contrary/60 text-xs">{t('distance')}</span>
          <p className="text-2xl font-bold">{t('distanceValue', { distance: distanceKm.toFixed(2) })}</p>
        </div>
      </div>

      {!showCompleteForm && (
        <button
          type="button"
          onClick={handleToggle}
          className={`rounded-panel flex items-center justify-center gap-2 self-center px-8 py-3 text-lg font-bold transition-colors ${
            isRecording ? 'bg-panel-active hover:bg-panel-active-lighten' : 'bg-accent text-background hover:bg-accent-darken'
          }`}
        >
          {isRecording && <Square className="h-4 w-4 fill-current" />}
          {isRecording ? t('stop') : t('start')}
        </button>
      )}

      {showCompleteForm && (
        <RecordCompleteForm distanceKm={distanceKm} isSubmitting={isSubmitting} onSubmit={handleSubmit} onCancel={() => setShowCompleteForm(false)} />
      )}
    </div>
  );
}
