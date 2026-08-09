import type { TreeNodeInfo } from '@blueprintjs/core';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import Constants from 'src/commons/utils/Constants';
import type { TocNavigation } from 'src/features/sicp/TableOfContentsHelper';

const baseUrlJs = Constants.sicpBackendUrl + 'json/';
const baseUrlPy = Constants.sicpBackendUrl + 'json_py/';
const extension = '.json';

// Table of contents (and its prev/next index) are generated content, published
// alongside the section JSON at the same backend URL, so they are fetched the
// same way instead of being snapshotted into this repo. A snapshot goes stale
// the moment the published chapter range changes (e.g. #1316) and nothing here
// forces it back in sync.
async function fetchToc(baseUrl: string): Promise<TreeNodeInfo[]> {
  if (process.env.NODE_ENV === 'test') {
    return [];
  }
  const res = await fetch(baseUrl + 'toc.json');
  if (!res.ok) {
    throw new Error('Unable to get table of contents. Error code = ' + res.status);
  }
  return res.json();
}

async function fetchTocNavigation(baseUrl: string): Promise<TocNavigation> {
  if (process.env.NODE_ENV === 'test') {
    return {};
  }
  const res = await fetch(baseUrl + 'toc-navigation.json');
  if (!res.ok) {
    throw new Error('Unable to get table of contents navigation. Error code = ' + res.status);
  }
  return res.json();
}

export const sicp = createQueryKeys('sicp', {
  sectionJs: (section: string) => ({
    queryKey: ['js', section],
    queryFn: async ({ signal }) => {
      const res = await fetch(baseUrlJs + section + extension, { signal });
      if (!res.ok) {
        // statusText is blank on HTTP/2 responses (no reason phrase), which is how
        // GitHub Pages serves this content, so status is checked directly instead.
        throw new Error(res.status === 404 ? 'Not Found' : res.statusText);
      }
      return res.json();
    },
  }),
  sectionPy: (section: string) => ({
    queryKey: ['py', section],
    queryFn: async ({ signal }) => {
      const res = await fetch(baseUrlPy + section + extension, { signal });
      if (!res.ok) {
        // statusText is blank on HTTP/2 responses (no reason phrase), which is how
        // GitHub Pages serves this content, so status is checked directly instead.
        throw new Error(res.status === 404 ? 'Not Found' : res.statusText);
      }
      return await res.json();
    },
  }),
  tocJs: {
    queryKey: null,
    queryFn: () => fetchToc(baseUrlJs),
  },
  tocPy: {
    queryKey: null,
    queryFn: () => fetchToc(baseUrlPy),
  },
  tocNavigationJs: {
    queryKey: null,
    queryFn: () => fetchTocNavigation(baseUrlJs),
  },
  tocNavigationPy: {
    queryKey: null,
    queryFn: () => fetchTocNavigation(baseUrlPy),
  },
});
