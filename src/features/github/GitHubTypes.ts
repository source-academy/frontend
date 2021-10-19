export const GITHUB_OPEN_FILE = 'GITHUB_OPEN_FILE';
export const GITHUB_SAVE_FILE = 'GITHUB_SAVE_FILE';
export const GITHUB_SAVE_FILE_AS = 'GITHUB_SAVE_FILE_AS';

export type GitHubSaveInfo = {
  repoName: string;
  filePath: string;
  lastSaved?: Date;
};
