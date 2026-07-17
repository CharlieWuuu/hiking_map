'use client';

import dynamic from 'next/dynamic';

import TrailMapPlaceholder from '../TrailMapPlaceholder';

export default dynamic(() => import('./TrailMap'), {
  ssr: false,
  loading: TrailMapPlaceholder,
});
