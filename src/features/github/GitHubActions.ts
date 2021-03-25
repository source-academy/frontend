import { action } from 'typesafe-actions';

import {
  GITHUB_INITIALISE,
  GITHUB_OPEN_PICKER,
  GITHUB_SAVE_FILE,
  GITHUB_SAVE_FILE_AS,
  GitHubFile
} from './GitHubTypes';

export const githubOpenPicker = () => action(GITHUB_OPEN_PICKER);

export const githubSaveFile = (file: GitHubFile) => action(GITHUB_SAVE_FILE, file);

export const githubSaveFileAs = () => action(GITHUB_SAVE_FILE_AS);

export const githubInitialise = () => action(GITHUB_INITIALISE);
