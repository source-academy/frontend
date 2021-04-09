import { action } from 'typesafe-actions';

import { GITHUB_OPEN_FILE, GITHUB_SAVE_FILE, GITHUB_SAVE_FILE_AS } from './GitHubTypes';

export const githubOpenFile = () => action(GITHUB_OPEN_FILE);

export const githubSaveFile = () => action(GITHUB_SAVE_FILE);

export const githubSaveFileAs = () => action(GITHUB_SAVE_FILE_AS);
