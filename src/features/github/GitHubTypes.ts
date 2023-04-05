export const GITHUB_OPEN_FILE = 'GITHUB_OPEN_FILE';
export const GITHUB_SAVE_FILE = 'GITHUB_SAVE_FILE';
export const GITHUB_SAVE_FILE_AS = 'GITHUB_SAVE_FILE_AS';

export type GitHubSaveInfo = {
  repoName: string;
  filePath: string;
  lastSaved?: Date;
};

export type GithubGetRepoRespData = {
  name: string;
  path: string;
  sha: string;
  size: string;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
};
