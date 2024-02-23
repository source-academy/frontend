import { createAction } from '@reduxjs/toolkit';

import { GITHUB_OPEN_FILE, GITHUB_SAVE_FILE, GITHUB_SAVE_FILE_AS } from './GitHubTypes';

export const githubOpenFile = createAction(GITHUB_OPEN_FILE, () => ({ payload: {} }));

export const githubSaveFile = createAction(GITHUB_SAVE_FILE, () => ({ payload: {} }));

export const githubSaveFileAs = createAction(GITHUB_SAVE_FILE_AS, () => ({ payload: {} }));
