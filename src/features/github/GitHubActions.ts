import { action } from 'typesafe-actions';

import {
  GITHUB_BEGIN_CONFIRMATION_DIALOG,
  GITHUB_BEGIN_OPEN_DIALOG,
  GITHUB_BEGIN_SAVE_AS_DIALOG,
  GITHUB_BEGIN_SAVE_DIALOG,
  GITHUB_CANCEL_CONFIRMATION_DIALOG,
  GITHUB_CLOSE_FILE_EXPLORER_DIALOG,
  GITHUB_CONFIRM_CREATING_SAVE,
  GITHUB_CONFIRM_OPEN,
  GITHUB_CONFIRM_OVERWRITING_SAVE
} from './GitHubTypes';

export const githubBeginOpenDialog = () => action(GITHUB_BEGIN_OPEN_DIALOG);

export const githubBeginSaveAsDialog = () => action(GITHUB_BEGIN_SAVE_AS_DIALOG);

export const githubBeginSaveDialog = () => action(GITHUB_BEGIN_SAVE_DIALOG);

export const githubCloseFileExplorerDialog = () => action(GITHUB_CLOSE_FILE_EXPLORER_DIALOG);

export const githubBeginConfirmationDialog = () => action(GITHUB_BEGIN_CONFIRMATION_DIALOG);

export const githubCancelConfirmationDialog = () => action(GITHUB_CANCEL_CONFIRMATION_DIALOG);

export const githubConfirmOpen = () => action(GITHUB_CONFIRM_OPEN);

export const githubConfirmOverwritingSave = () => action(GITHUB_CONFIRM_OVERWRITING_SAVE);

export const githubConfirmCreatingSave = () => action(GITHUB_CONFIRM_CREATING_SAVE);
