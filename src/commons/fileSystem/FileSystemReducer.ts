import { createReducer } from '@reduxjs/toolkit';
import { Reducer } from 'redux';

import { defaultFileSystem } from '../application/ApplicationTypes';
import { SourceActionType } from '../utils/ActionsHelper';
import { 
  addGithubSaveInfo,
  addPersistenceFile,
  deleteAllGithubSaveInfo,
  deleteAllPersistenceFiles,  deleteGithubSaveInfo,
  deletePersistenceFile,
  setInBrowserFileSystem, 
  setPersistenceFileLastEditByPath,
  updateLastEditedFilePath,
  updateRefreshFileViewKey,
  updatePersistenceFilePathAndNameByPath,
  } from './FileSystemActions';
import { FileSystemState } from './FileSystemTypes';

export const FileSystemReducer: Reducer<FileSystemState, SourceActionType> = createReducer(
  defaultFileSystem,
  builder => {
    builder
      .addCase(setInBrowserFileSystem, (state, action) => {
        state.inBrowserFileSystem = action.payload.inBrowserFileSystem;
      })
      .addCase(addGithubSaveInfo, (state, action) => { // TODO rewrite
        const githubSaveInfoPayload = action.payload.githubSaveInfo;
        const persistenceFileArray = state['persistenceFileArray'];

        const saveInfoIndex = persistenceFileArray.findIndex(e => {
          return e.path === githubSaveInfoPayload.filePath &&
          e.repoName === githubSaveInfoPayload.repoName;
        });
        if (saveInfoIndex === -1) {
          persistenceFileArray[persistenceFileArray.length] = {
            id: '',
            name: '',
            path: githubSaveInfoPayload.filePath,
            lastSaved: githubSaveInfoPayload.lastSaved,
            repoName: githubSaveInfoPayload.repoName
          };
        } else {
          // file already exists, to replace file
          persistenceFileArray[saveInfoIndex] = {
            id: '',
            name: '',
            path: githubSaveInfoPayload.filePath,
            lastSaved: githubSaveInfoPayload.lastSaved,
            repoName: githubSaveInfoPayload.repoName
          };
        }
        state.persistenceFileArray = persistenceFileArray;
    })
    .addCase(deleteGithubSaveInfo, (state, action) => { // TODO rewrite - refer to deletePersistenceFile below
      const newPersistenceFileArray = state['persistenceFileArray'].filter(e => {
        return e.path != action.payload.githubSaveInfo.filePath &&
        e.lastSaved != action.payload.githubSaveInfo.lastSaved &&
        e.repoName != action.payload.githubSaveInfo.repoName
      });
      state.persistenceFileArray = newPersistenceFileArray;
    })
    .addCase(deleteAllGithubSaveInfo, (state, action) => {
      state.persistenceFileArray = [];
    })
    .addCase(addPersistenceFile, (state, action) => { // TODO rewrite
      const persistenceFilePayload = action.payload;
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
      const newPersistenceFileArray = state['persistenceFileArray'].filter(e => e.id !== action.payload.id);
      const isGitHubSyncing = action.payload.repoName ? true : false;
      if (isGitHubSyncing) {
        const newPersFile = {id: '', name: '', repoName: action.payload.repoName, path: action.payload.path};
        const newPersFileArray = newPersistenceFileArray.concat(newPersFile);
        state.persistenceFileArray = newPersFileArray;
      } else {
        state.persistenceFileArray = newPersistenceFileArray;
      }
    })
    .addCase(deleteAllPersistenceFiles, (state, action) => {
      state.persistenceFileArray = [];
    })
    .addCase(updatePersistenceFilePathAndNameByPath, (state, action) => {
      const filesState = state['persistenceFileArray'];
      const persistenceFileFindIndex = filesState.findIndex(e => e.path === action.payload.oldPath);
      if (persistenceFileFindIndex === -1) {
        return;
      }
      const newPersistenceFile = {...filesState[persistenceFileFindIndex], path: action.payload.newPath, name: action.payload.newFileName};
      filesState[persistenceFileFindIndex] = newPersistenceFile;
      state.persistenceFileArray = filesState;
    })
    .addCase(setPersistenceFileLastEditByPath, (state, action) => {
      const filesState = state['persistenceFileArray'];
      const persistenceFileFindIndex = filesState.findIndex(e => e.path === action.payload.path);
      if (persistenceFileFindIndex === -1) {
        return;
      }
      const newPersistenceFile = {...filesState[persistenceFileFindIndex], lastEdit: action.payload.date};
      filesState[persistenceFileFindIndex] = newPersistenceFile;
      state.persistenceFileArray = filesState;
    })
    .addCase(updateLastEditedFilePath, (state, action) => {
      state.lastEditedFilePath = action.payload.lastEditedFilePath;
    })
    .addCase(updateRefreshFileViewKey, (state, action) => {
      state.refreshFileViewKey = (state.refreshFileViewKey + 1) % 2;
    })
  }
);
