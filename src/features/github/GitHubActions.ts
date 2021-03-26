import { action } from 'typesafe-actions';

import { GITHUB_OPEN_PICKER, GITHUB_SAVE_FILE_AS, GITHUB_SAVE_PICKER } from './GitHubTypes';

export const githubOpenPicker = () => action(GITHUB_OPEN_PICKER);

export const githubSavePicker = () => action(GITHUB_SAVE_PICKER);

export const githubSaveFileAs = () => action(GITHUB_SAVE_FILE_AS);
