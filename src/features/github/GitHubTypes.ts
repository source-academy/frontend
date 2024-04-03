export const GITHUB_OPEN_FILE = 'GITHUB_OPEN_FILE';
export const GITHUB_SAVE_FILE = 'GITHUB_SAVE_FILE';
export const GITHUB_SAVE_FILE_AS = 'GITHUB_SAVE_FILE_AS';
export const GITHUB_SAVE_ALL = 'GITHUB_SAVE_ALL';

export type GitHubSaveInfo = {
  repoName?: string;
  filePath?: string;
  lastSaved?: Date;
};
