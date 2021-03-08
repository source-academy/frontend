export const GITHUB_OPEN_PICKER = 'GITHUB_OPEN_PICKER';
export const GITHUB_SAVE_FILE_AS = 'GITHUB_SAVE_FILE_AS';
export const GITHUB_SAVE_FILE = 'GITHUB_SAVE_FILE';
export const GITHUB_INITIALISE = 'GITHUB_INITIALISE';

export type GitHubState = 'LOGGED_IN' | 'LOGGED_OUT';

export type GitHubFile = {
  id: string;
  name: string;
  lastSaved?: Date;
};
