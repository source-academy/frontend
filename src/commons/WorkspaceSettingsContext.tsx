import React from 'react';

export enum EditorBinding {
  NONE = '',
  VIM = 'vim',
  EMACS = 'emacs'
}

export type WorkspaceSettings = {
  editorBinding: EditorBinding;
};

export const defaultWorkspaceSettings: WorkspaceSettings = {
  editorBinding: EditorBinding.NONE
};

/**
 * The WorkspaceSettingsContext stores the local storage-based application settings.
 *
 * The local storage state is initialized in Application.tsx via the useLocalStorageState hook.
 */
export const WorkspaceSettingsContext = React.createContext<
  [WorkspaceSettings, React.Dispatch<React.SetStateAction<WorkspaceSettings>>] | null
>(null);
