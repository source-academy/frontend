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
  updatePersistenceFolderPathAndNameByPath,
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
      const newPersistenceFileArray = state['persistenceFileArray'].filter(e => e.path !== action.payload.path);
      const isGDriveSyncing = action.payload.id ? true: false;
      if (isGDriveSyncing) {
        const newPersFile = { id: action.payload.id, path: action.payload.path, repoName: '', name: action.payload.name};
        const newPersFileArray = newPersistenceFileArray.concat(newPersFile);
        state.persistenceFileArray = newPersFileArray;
      } else {
        state.persistenceFileArray = newPersistenceFileArray;
      }  
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
    .addCase(updatePersistenceFolderPathAndNameByPath, (state, action) => {
      const filesState = state['persistenceFileArray'];
      //const persistenceFileFindIndex = filesState.findIndex(e => e.path === action.payload.oldPath);
      console.log(action.payload);
      filesState.forEach(e => console.log(e.path));
      // if (persistenceFileFindIndex === -1) {
      //   return;
      // }
      // get current level of folder
      const regexResult = /^(.*[\\\/])?(\.*.*?)(\.[^.]+?|)$/.exec(action.payload.newPath)!;

      const currFolderSplit: string[] = regexResult[0].slice(1).split("/");
      const currFolderIndex = currFolderSplit.length - 1;

      // /fold1/ becomes ["fold1"]
      // /fold1/fold2/ becomes ["fold1", "fold2"]
      // If in top level folder, becomes [""]

      console.log(regexResult, currFolderSplit, "a1");

      // update all files that are its children
      state.persistenceFileArray = filesState.filter(e => e.path).map((e => {
        const r = /^(.*[\\\/])?(\.*.*?)(\.[^.]+?|)$/.exec(e.path!)!;
        const currParentFolders = r[0].slice(1).split("/");
        console.log("currParentFolders", currParentFolders, "folderLevel", currFolderIndex);
        if (currParentFolders.length <= currFolderIndex) {
          return e; // not a child of folder
        }
        if (currParentFolders[currFolderIndex] !== action.payload.oldFolderName) {
          return e; // not a child of folder
        }
        // only children remain
        currParentFolders[currFolderIndex] = action.payload.newFolderName;
        currParentFolders[0] = "/" + currParentFolders[0];
        const newPath = currParentFolders.join("/");
        console.log("from", e.path, "to", newPath);
        return {...e, path: newPath};
      }));
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
      state.lastEditedFilePath = "";
    })
  }
);
