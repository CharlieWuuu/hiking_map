'use client';

import dynamic from 'next/dynamic';

import RecordMapPlaceholder from '../RecordMapPlaceholder';

export default dynamic(() => import('./RecordMap'), {
  ssr: false,
  loading: RecordMapPlaceholder,
});
