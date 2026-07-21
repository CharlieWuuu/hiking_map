import { useCallback, useRef, useState } from 'react';

export type TrackPoint = [number, number]; // [經度, 緯度]

// 兩點間距離（公里），Haversine 公式
function distanceKm([lng1, lat1]: TrackPoint, [lng2, lat2]: TrackPoint): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useGpsTracker() {
  const [isRecording, setIsRecording] = useState(false);
  const [path, setPath] = useState<TrackPoint[]>([]);
  const [distanceKmTotal, setDistanceKmTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const start = useCallback(() => {
    if (!navigator.geolocation) {
      setError('geolocation-unsupported');
      return;
    }

    setPath([]);
    setDistanceKmTotal(0);
    setError(null);
    setIsRecording(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const point: TrackPoint = [position.coords.longitude, position.coords.latitude];
        setPath((prev) => {
          if (prev.length > 0) {
            setDistanceKmTotal((prevDistance) => prevDistance + distanceKm(prev[prev.length - 1], point));
          }
          return [...prev, point];
        });
      },
      () => setError('geolocation-denied'),
      { enableHighAccuracy: true }
    );
  }, []);

  const stop = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsRecording(false);
  }, []);

  return { isRecording, path, distanceKm: distanceKmTotal, error, start, stop };
}
