import { createAction } from '@reduxjs/toolkit';

import { 
    GITHUB_CREATE_FILE, 
    GITHUB_OPEN_FILE, 
    GITHUB_SAVE_ALL,
    GITHUB_SAVE_FILE, 
    GITHUB_SAVE_FILE_AS,
    GITHUB_DELETE_FILE,
    GITHUB_DELETE_FOLDER} from './GitHubTypes';

export const githubOpenFile = createAction(GITHUB_OPEN_FILE, () => ({ payload: {} }));

export const githubSaveFile = createAction(GITHUB_SAVE_FILE, () => ({ payload: {} }));

export const githubSaveFileAs = createAction(GITHUB_SAVE_FILE_AS, () => ({ payload: {} }));

export const githubSaveAll = createAction(GITHUB_SAVE_ALL, () => ({ payload: {} }));

export const githubCreateFile = createAction(GITHUB_CREATE_FILE, (filePath: string) => ({ payload: filePath }));

export const githubDeleteFile = createAction(GITHUB_DELETE_FILE, (filePath: string) => ({ payload: filePath }));

export const githubDeleteFolder = createAction(GITHUB_DELETE_FOLDER, (filePath: string) => ({ payload: filePath}));
