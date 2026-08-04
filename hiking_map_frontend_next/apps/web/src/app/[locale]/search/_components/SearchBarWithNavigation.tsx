'use client';

import SearchBar from '../../../../components/SearchBar';
import type { SearchResult } from '../../../../components/SearchBar/SearchBar.types';
import { useRouter } from '../../../../i18n/navigation';

export default function SearchBarWithNavigation() {
  const router = useRouter();

  function handleSubmitQuery(query: string) {
    router.push({ pathname: '/search', query: { q: query } });
  }

  function handleSelectEntity(item: SearchResult) {
    if (item.type === 'user') {
      router.push(`/profile/${item.username}`);
    } else {
      router.push(`/trails/${item.slug}`);
    }
  }

  return <SearchBar onSubmitQuery={handleSubmitQuery} onSelectEntity={handleSelectEntity} />;
}
