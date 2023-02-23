import { Reducer } from 'redux';

import { defaultFileSystem } from '../application/ApplicationTypes';
import { SourceActionType } from '../utils/ActionsHelper';
import { FileSystemState, SET_IN_BROWSER_FILE_SYSTEM } from './FileSystemTypes';

export const FileSystemReducer: Reducer<FileSystemState> = (
  state = defaultFileSystem,
  action: SourceActionType
) => {
  switch (action.type) {
    case SET_IN_BROWSER_FILE_SYSTEM:
      return {
        ...state,
        inBrowserFileSystem: action.payload.inBrowserFileSystem
      };
    default:
      return state;
  }
};
