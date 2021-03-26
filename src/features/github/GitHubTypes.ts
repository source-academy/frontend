export const GITHUB_OPEN_PICKER = 'GITHUB_OPEN_PICKER';
export const GITHUB_SAVE_PICKER = 'GITHUB_SAVE_PICKER';
export const GITHUB_SAVE_FILE_AS = 'GITHUB_SAVE_FILE_AS';

export type GitHubState = 'LOGGED_IN' | 'LOGGED_OUT';

export type GitHubFile = {
  id: string;
  name: string;
  lastSaved?: Date;
};
