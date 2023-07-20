import { action } from 'typesafe-actions';

import { GITHUB_OPEN_FILE, GITHUB_SAVE_FILE, GITHUB_SAVE_FILE_AS } from './GitHubTypes';

export const githubOpenFile = (isStory = false) => action(GITHUB_OPEN_FILE, isStory);

export const githubSaveFile = (isStory = false) => action(GITHUB_SAVE_FILE, isStory);

export const githubSaveFileAs = (isStory = false) => action(GITHUB_SAVE_FILE_AS, isStory);
