'use client';

import dynamic from 'next/dynamic';

import TrailMapPlaceholder from '../TrailMapPlaceholder';

export default dynamic(() => import('./MultiTrailMap'), {
  ssr: false,
  loading: TrailMapPlaceholder,
});
