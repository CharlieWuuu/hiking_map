import type { SearchResultDto as RawSearchResultDto } from '../api/data-contracts';
import type { Search as SearchClient } from '../api/Search';
import { toCamelCase } from './case';

export type SearchResult = {
  type: 'trail' | 'user';
  slug: string;
  displayName: string;
  avatar?: string | null;
  county?: string | null;
  town?: string | null;
  level?: string | null;
  matchReason: 'name' | 'field';
};

export function adaptSearchResult(raw: RawSearchResultDto): SearchResult {
  return toCamelCase<RawSearchResultDto>(raw) as SearchResult;
}

export function createSearchService(client: SearchClient) {
  return {
    search: async (q: string) => (await client.searchControllerSearch({ q, category: '', county: '' })).map(adaptSearchResult),
    filterTrails: async (category: string | null, county: string | null) =>
      (await client.searchControllerSearch({ q: '', category: category ?? '', county: county ?? '' })).map(adaptSearchResult),
    popularQueries: async () => (await client.searchControllerPopularQueries()).map((item) => item.text),
    logQuery: (query: string) => client.searchControllerLogQuery({ query }),
  };
}
