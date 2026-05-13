import { createReducer, type Reducer } from '@reduxjs/toolkit';

import { defaultFileSystem } from '../application/ApplicationTypes';
import type { SourceActionType } from '../utils/ActionsHelper';
import { setInBrowserFileSystem } from './FileSystemActions';
import type { FileSystemState } from './FileSystemTypes';

export const FileSystemReducer: Reducer<FileSystemState, SourceActionType> = createReducer(
  defaultFileSystem,
  builder => {
    builder.addCase(setInBrowserFileSystem, (state, action) => {
      state.inBrowserFileSystem = action.payload.inBrowserFileSystem;
    });
  }
);
