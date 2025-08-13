import {
  ContributorsInApi,
  Repo,
  ReposInApi
} from '../../../features/contributors/ContributorsTypes';

const apiRepoDetails: string = 'https://api.github.com/orgs/source-academy/repos?per_page=59';
const ignoreRepos: string[] = ['assessments', 'tools', 'source-academy2'];
const ignoreContributors: string[] = [
  'dependabot[bot]',
  'dependabot-preview[bot]',
  'renovate[bot]'
];

export const fetchRepos = async () => {
  const response = await fetch(apiRepoDetails);
  const results = await response.json();
  const repos = await results
    .filter((repo: ReposInApi) => {
      return !ignoreRepos.includes(repo.name);
    })
    .map((repo: ReposInApi) => {
      return {
        key: repo.id,
        name: repo.name,
        description: repo.description,
        link: repo.contributors_url
      };
    });
  return repos;
};

export const fetchContributors = async (endpoints: Repo[]) => {
  const responses = await Promise.all(
    endpoints.map((endpoint: Repo) => {
      return fetch(endpoint.link);
    })
  );
  const results = await Promise.all(
    responses.map((res: any) => {
      return res.json();
    })
  );
  const contributorsByRepo = await Promise.all(
    results.map((contributors: ContributorsInApi[]) => {
      return contributors
        .filter((contributor: ContributorsInApi) => {
          return !ignoreContributors.includes(contributor.login);
        })
        .map((contributor: ContributorsInApi) => {
          return {
            key: contributor.id,
            photo: contributor.avatar_url,
            githubPage: contributor.html_url,
            githubName: contributor.login,
            commits: contributor.contributions
          };
        });
    })
  );
  return contributorsByRepo;
};
