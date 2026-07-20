'use client';

import dynamic from 'next/dynamic';

import RecordLayerPlaceholder from './RecordLayerPlaceholder';

export default dynamic(() => import('./RecordLayer'), {
  ssr: false,
  loading: RecordLayerPlaceholder,
});
