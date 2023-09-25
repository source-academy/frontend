import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FSModule } from 'browserfs/dist/node/core/FS';

import { defaultFileSystem } from './AllTypes';

export const { actions: fileActions, reducer: fileSystemReducer } = createSlice({
  name: 'fileSystem',
  initialState: defaultFileSystem,
  reducers: {
    setInBrowserFileSystem(state, { payload }: PayloadAction<FSModule>) {
      state.inBrowserFileSystem = payload;
    }
  }
});
