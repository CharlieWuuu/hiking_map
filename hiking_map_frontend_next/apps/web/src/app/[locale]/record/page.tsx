'use client';

import { Square } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import RecordLayer from '../../../components/MapView/RecordLayer';
import { useRouter } from '../../../i18n/navigation';

// 尚未接上真的 GPS，這裡先用固定的假速度模擬距離累積
const MOCK_SPEED_KM_PER_SEC = 0.0015;

function formatElapsed(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
}

export default function RecordPage() {
  const t = useTranslations('RecordPage');
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);

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

  const distanceKm = elapsedSeconds * MOCK_SPEED_KM_PER_SEC;

  function handleToggle() {
    if (isRecording) {
      setIsRecording(false);
      router.push('/profile/demo');
      return;
    }

    setElapsedSeconds(0);
    setIsRecording(true);
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <RecordLayer />

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
    </div>
  );
}
