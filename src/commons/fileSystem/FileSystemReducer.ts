import { Reducer } from 'redux';

import { defaultFileSystem } from '../application/ApplicationTypes';
import { SourceActionType } from '../utils/ActionsHelper';
import { FileSystemState, SET_FILE_SYSTEM } from './FileSystemTypes';

export const FileSystemReducer: Reducer<FileSystemState> = (
  state = defaultFileSystem,
  action: SourceActionType
) => {
  switch (action.type) {
    case SET_FILE_SYSTEM:
      return {
        ...state,
        fileSystem: action.payload.fileSystem
      };
    default:
      return state;
  }
};
