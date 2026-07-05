import { type inferQueryKeyStore, mergeQueryKeys } from '@lukemorales/query-key-factory';

import { contributors } from './contributors';

// Merge all query keys into a single store
export const queries = mergeQueryKeys(
  // TODO: Add more query key stores as needed
  contributors,
);

// Export type for use in components
export type QueryKeys = inferQueryKeyStore<typeof queries>;
