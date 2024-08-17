import { createReducer, Reducer } from '@reduxjs/toolkit';

import { defaultFileSystem } from '../application/ApplicationTypes';
import { SourceActionType } from '../utils/ActionsHelper';
import { setInBrowserFileSystem } from './FileSystemActions';
import { FileSystemState } from './FileSystemTypes';

export const FileSystemReducer: Reducer<FileSystemState, SourceActionType> = createReducer(
  defaultFileSystem,
  builder => {
    builder.addCase(setInBrowserFileSystem, (state, action) => {
      state.inBrowserFileSystem = action.payload.inBrowserFileSystem;
    });
  }
);
