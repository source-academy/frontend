import { action } from 'typesafe-actions';

import {
  GITHUB_DISPLAY_OPEN_PICKER,
  GITHUB_DISPLAY_SAVE_PICKER,
  GITHUB_SAVE_FILE_AS
} from './GitHubTypes';

export const githubDisplayOpenPicker = () => action(GITHUB_DISPLAY_OPEN_PICKER);

export const githubDisplaySavePicker = () => action(GITHUB_DISPLAY_SAVE_PICKER);

export const githubSaveFileAs = () => action(GITHUB_SAVE_FILE_AS);
