import { createReducer } from '@reduxjs/toolkit';
import { Reducer } from 'redux';

import { defaultFileSystem } from '../application/ApplicationTypes';
import { SourceActionType } from '../utils/ActionsHelper';
import { 
  setInBrowserFileSystem,
  addGithubSaveInfo,
  deleteAllGithubSaveInfo,
  deleteGithubSaveInfo,
  addPersistenceFile,
  deletePersistenceFile,
  deleteAllPersistenceFiles } from './FileSystemActions';
import { FileSystemState } from './FileSystemTypes';

export const FileSystemReducer: Reducer<FileSystemState, SourceActionType> = createReducer(
  defaultFileSystem,
  builder => {
    builder
      .addCase(setInBrowserFileSystem, (state, action) => {
        state.inBrowserFileSystem = action.payload.inBrowserFileSystem;
      })
      .addCase(addGithubSaveInfo, (state, action) => {
        const githubSaveInfoPayload = action.payload.githubSaveInfo;
        const githubSaveInfoArray = state['githubSaveInfoArray']

        const saveInfoIndex = githubSaveInfoArray.findIndex(e => e === githubSaveInfoPayload);
        if (saveInfoIndex == -1) {
          githubSaveInfoArray[githubSaveInfoArray.length] = githubSaveInfoPayload;
        } else {
          // file already exists, to replace file
          githubSaveInfoArray[saveInfoIndex] = githubSaveInfoPayload;
        }
        state.githubSaveInfoArray = githubSaveInfoArray;
    })
    .addCase(deleteGithubSaveInfo, (state, action) => {
      const newGithubSaveInfoArray = state['githubSaveInfoArray'].filter(e => e !== action.payload.githubSaveInfo);
      state.githubSaveInfoArray = newGithubSaveInfoArray;
    })
    .addCase(deleteAllGithubSaveInfo, (state, action) => {
      state.githubSaveInfoArray = [];
    })
    .addCase(addPersistenceFile, (state, action) => {
      const persistenceFilePayload = action.payload.persistenceFile;
      const persistenceFileArray = state['persistenceFileArray'];
      const persistenceFileIndex = persistenceFileArray.findIndex(e => e.id === persistenceFilePayload.id);
      if (persistenceFileIndex === -1) {
        persistenceFileArray[persistenceFileArray.length] = persistenceFilePayload;
      } else {
        persistenceFileArray[persistenceFileIndex] = persistenceFilePayload;
      }
      state.persistenceFileArray = persistenceFileArray;
    })
    .addCase(deletePersistenceFile, (state, action) => {
      const newPersistenceFileArray = state['persistenceFileArray'].filter(e => e.id !== action.payload.persistenceFile.id);
      state.persistenceFileArray = newPersistenceFileArray;
    })
    .addCase(deleteAllPersistenceFiles, (state, action) => {
      state.persistenceFileArray = [];
    })
  }
);
