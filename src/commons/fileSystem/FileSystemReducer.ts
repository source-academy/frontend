import { createReducer } from '@reduxjs/toolkit';
import { Reducer } from 'redux';

import { defaultFileSystem } from '../application/ApplicationTypes';
import { setInBrowserFileSystem } from './FileSystemActions';
import { FileSystemState } from './FileSystemTypes';

export const FileSystemReducer: Reducer<FileSystemState> = createReducer(
  defaultFileSystem,
  builder => {
    builder.addCase(setInBrowserFileSystem, (state, action) => {
      state.inBrowserFileSystem = action.payload.inBrowserFileSystem;
    });
  }
);
