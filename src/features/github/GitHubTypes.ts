export const GITHUB_OPEN_FILE = 'GITHUB_OPEN_FILE';
export const GITHUB_SAVE_FILE = 'GITHUB_SAVE_FILE';
export const GITHUB_SAVE_FILE_AS = 'GITHUB_SAVE_FILE_AS';
export const GITHUB_SAVE_ALL = 'GITHUB_SAVE_ALL';
export const GITHUB_CREATE_FILE = 'GITHUB_CREATE_FILE';
export const GITHUB_DELETE_FILE = 'GITHUB_DELETE_FILE';
export const GITHUB_DELETE_FOLDER = 'GITHUB_DELETE_FOLDER';

export type GitHubSaveInfo = {
  repoName?: string;
  filePath?: string;
  lastSaved?: Date;
};
