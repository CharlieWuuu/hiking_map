'use client';

import dynamic from 'next/dynamic';

import TrailLayerPlaceholder from '../TrailLayerPlaceholder';

export default dynamic(() => import('./TrailLayer'), {
  ssr: false,
  loading: TrailLayerPlaceholder,
});
