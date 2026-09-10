'use client';

import { useEffect, useMemo, useState } from 'react';

import type { Mountain } from '../../lib/api/adapters/mountains';
import { apiClient } from '../../lib/apiClient';

type Props = {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  label: string;
  searchPlaceholder: string;
};

export default function MountainMultiSelect({ selectedIds, onChange, label, searchPlaceholder }: Props) {
  const [mountains, setMountains] = useState<Mountain[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    apiClient.mountains
      .findAll()
      .then(setMountains)
      .catch(() => {});
  }, []);

  const selectedMountains = useMemo(() => mountains.filter((mountain) => selectedIds.includes(mountain.id)), [mountains, selectedIds]);

  const q = query.trim().toLowerCase();
  const suggestions = q ? mountains.filter((mountain) => !selectedIds.includes(mountain.id) && mountain.name.toLowerCase().includes(q)).slice(0, 8) : [];

  function toggle(id: number) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((existing) => existing !== id) : [...selectedIds, id]);
  }

  return (
    <div className="flex w-full flex-col items-start gap-2">
      <span className="text-sm">{label}</span>

      {selectedMountains.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedMountains.map((mountain) => (
            <button
              key={mountain.id}
              type="button"
              onClick={() => toggle(mountain.id)}
              className="bg-accent text-background rounded-full px-3 py-1 text-sm transition-colors duration-150"
            >
              {mountain.name} ×
            </button>
          ))}
        </div>
      )}

      <div className="relative w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="bg-background text-background-contrary w-full rounded px-1.5 py-0.5 text-sm outline-none"
        />
        {suggestions.length > 0 && (
          <div className="bg-panel-active rounded-panel absolute top-full left-0 z-10 mt-1 flex w-full flex-col overflow-hidden">
            {suggestions.map((mountain) => (
              <button
                key={mountain.id}
                type="button"
                onClick={() => {
                  toggle(mountain.id);
                  setQuery('');
                }}
                className="hover:bg-panel-active-lighten px-3 py-2 text-left text-sm transition-colors duration-150"
              >
                {mountain.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
