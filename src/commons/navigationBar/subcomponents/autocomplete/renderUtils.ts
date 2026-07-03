import type { IndexSearchResult } from './types';

export function processIndexSearchResults(searchResults: IndexSearchResult[]): IndexSearchResult[] {
  return searchResults
    .filter(r => r.id)
    .sort((a, b) => {
      if (a.hasSubindex && !b.hasSubindex) {
        return 1;
      }
      if (!a.hasSubindex && b.hasSubindex) {
        return -1;
      }
      return a.order.localeCompare(b.order);
    });
}
