import { compressToUTF16, decompressFromUTF16 } from 'lz-string';

import { ISessionState, IState } from './reducers/states';

export type ISavedState = {
  session: Partial<ISessionState>;
  playgroundEditorValue: string | null;
  playgroundIsEditorAutorun: boolean;
};

export const loadStoredState = (): ISavedState | undefined => {
  try {
    const serializedState = localStorage.getItem('storedState');
    if (serializedState === null) {
      return undefined;
    } else {
      return JSON.parse(decompressFromUTF16(serializedState)) as ISavedState;
    }
  } catch (err) {
    // Issue #143
    return undefined;
  }
};

export const saveState = (state: IState) => {
  try {
    const stateToBeSaved: ISavedState = {
      session: {
        accessToken: state.session.accessToken,
        refreshToken: state.session.refreshToken,
        role: state.session.role,
        name: state.session.name
      },
      playgroundEditorValue: state.workspaces.playground.editorValue,
      playgroundIsEditorAutorun: state.workspaces.playground.isEditorAutorun
    };
    const serialized = compressToUTF16(JSON.stringify(stateToBeSaved));
    localStorage.setItem('storedState', serialized);
  } catch (err) {
    // https://github.com/source-academy/cadet-frontend/issues/143
  }
};
