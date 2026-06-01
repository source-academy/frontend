import { createQueryKeys } from '@lukemorales/query-key-factory';

import type { Contributor, Repo } from '../features/contributors/ContributorsTypes';
import {
  fetchContributors,
  fetchRepos,
} from '../pages/contributors/subcomponents/ContributorsGithubApi';

export const contributors = createQueryKeys('contributors', {
  repos: {
    queryKey: null,
    queryFn: async (): Promise<Repo[]> => {
      return fetchRepos();
    },
  },
  contributors: (repos: Repo[]) => ({
    queryKey: [repos.map(r => r.key)],
    queryFn: async (): Promise<Contributor[][]> => {
      return fetchContributors(repos);
    },
  }),
});
