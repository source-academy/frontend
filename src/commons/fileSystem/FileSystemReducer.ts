import { createReducer } from '@reduxjs/toolkit';
import { Reducer } from 'redux';

import { defaultFileSystem } from '../application/ApplicationTypes';
import { SourceActionType } from '../utils/ActionsHelper';
import { filePathRegex } from '../utils/PersistenceHelper';
import {
  addGithubSaveInfo,
  addPersistenceFile,
  deleteAllGithubSaveInfo,
  deleteAllPersistenceFiles,
  deleteGithubSaveInfo,
  deletePersistenceFile,
  deletePersistenceFolderAndChildren,
  setInBrowserFileSystem,
  setPersistenceFileLastEditByPath,
  updateLastEditedFilePath,
  updatePersistenceFilePathAndNameByPath,
  updatePersistenceFolderPathAndNameByPath,
  updateRefreshFileViewKey
} from './FileSystemActions';
import { FileSystemState } from './FileSystemTypes';

export const FileSystemReducer: Reducer<FileSystemState, SourceActionType> = createReducer(
  defaultFileSystem,
  builder => {
    builder
      .addCase(setInBrowserFileSystem, (state, action) => {
        state.inBrowserFileSystem = action.payload.inBrowserFileSystem;
      })
      .addCase(addGithubSaveInfo, (state, action) => {
        // TODO rewrite
        const persistenceFilePayload = action.payload.persistenceFile;
        const persistenceFileArray = state['persistenceFileArray'];

        const saveInfoIndex = persistenceFileArray.findIndex(e => {
          return (
            e.path === persistenceFilePayload.path && e.repoName === persistenceFilePayload.repoName
          );
        });
        if (saveInfoIndex === -1) {
          persistenceFileArray[persistenceFileArray.length] = {
            id: '',
            name: '',
            path: persistenceFilePayload.path,
            lastSaved: persistenceFilePayload.lastSaved,
            repoName: persistenceFilePayload.repoName,
            parentFolderPath: persistenceFilePayload.parentFolderPath
          };
        } else {
          // file already exists, to replace file
          persistenceFileArray[saveInfoIndex] = {
            id: '',
            name: '',
            path: persistenceFilePayload.path,
            lastSaved: persistenceFilePayload.lastSaved,
            repoName: persistenceFilePayload.repoName,
            parentFolderPath: persistenceFilePayload.parentFolderPath
          };
        }
        state.persistenceFileArray = persistenceFileArray;
      })
      .addCase(deleteGithubSaveInfo, (state, action) => {
        // TODO rewrite - refer to deletePersistenceFile below
        const newPersistenceFileArray = state['persistenceFileArray'].filter(
          e => e.path !== action.payload.path
        );
        const isGDriveSyncing = action.payload.id ? true : false;
        if (isGDriveSyncing) {
          const newPersFile = {
            id: action.payload.id,
            name: action.payload.name,
            lastEdit: action.payload.lastEdit,
            lastSaved: action.payload.lastSaved,
            parentId: action.payload.parentId,
            path: action.payload.path
          };
          const newPersFileArray = newPersistenceFileArray.concat(newPersFile);
          state.persistenceFileArray = newPersFileArray;
        } else {
          state.persistenceFileArray = newPersistenceFileArray;
        }
      })
      .addCase(deleteAllGithubSaveInfo, (state, action) => {
        if (state.persistenceFileArray.length !== 0) {
          const isGDriveSyncing = state.persistenceFileArray[0].id ? true : false;
          const newPersistenceFileArray = state.persistenceFileArray;
          if (isGDriveSyncing) {
            newPersistenceFileArray.forEach((persistenceFile, index) => {
              newPersistenceFileArray[index] = {
                id: persistenceFile.id,
                name: persistenceFile.name,
                lastEdit: persistenceFile.lastEdit,
                lastSaved: persistenceFile.lastSaved,
                parentId: persistenceFile.parentId,
                path: persistenceFile.path
              };
            });
            state.persistenceFileArray = newPersistenceFileArray;
          } else {
            state.persistenceFileArray = [];
          }
        }
      })
      .addCase(addPersistenceFile, (state, action) => {
        // TODO rewrite
        const persistenceFilePayload = action.payload;
        const persistenceFileArray = state['persistenceFileArray'];
        const persistenceFileIndex = persistenceFileArray.findIndex(
          e => e.id === persistenceFilePayload.id
        );
        if (persistenceFileIndex === -1) {
          persistenceFileArray[persistenceFileArray.length] = persistenceFilePayload;
        } else {
          persistenceFileArray[persistenceFileIndex] = persistenceFilePayload;
        }
        state.persistenceFileArray = persistenceFileArray;
      })
      .addCase(deletePersistenceFile, (state, action) => {
        const newPersistenceFileArray = state['persistenceFileArray'].filter(
          e => e.id !== action.payload.id
        );
        const isGitHubSyncing = action.payload.repoName ? true : false;
        if (isGitHubSyncing) {
          const newPersFile = {
            id: '',
            name: '',
            repoName: action.payload.repoName,
            path: action.payload.path
          };
          const newPersFileArray = newPersistenceFileArray.concat(newPersFile);
          state.persistenceFileArray = newPersFileArray;
        } else {
          state.persistenceFileArray = newPersistenceFileArray;
        }
      })
      .addCase(deletePersistenceFolderAndChildren, (state, action) => {
        // check if github is syncing?
        const newPersistenceFileArray = state['persistenceFileArray'].filter(
          e => e.id !== action.payload.id
        );
        // get children
        // get current level of folder
        const regexResult = filePathRegex.exec(action.payload.path!)!;

        const currFolderSplit: string[] = regexResult[0].slice(1).split('/');
        const folderName = regexResult[2];
        const currFolderLevel = currFolderSplit.length - 1;

        state.persistenceFileArray = newPersistenceFileArray
          .filter(e => e.path)
          .filter(e => {
            const r = filePathRegex.exec(e.path!)!;
            const currParentFolders = r[0].slice(1).split('/');
            console.log('currParentFolders', currParentFolders, 'folderLevel', currFolderLevel);
            if (currParentFolders.length <= currFolderLevel) {
              return true; // not a child of folder
            }
            if (currParentFolders[currFolderLevel] !== folderName) {
              return true; // not a child of folder
            }
            return false;
          });
      })
      .addCase(deleteAllPersistenceFiles, (state, action) => {
        state.persistenceFileArray = [];
      })
      .addCase(updatePersistenceFilePathAndNameByPath, (state, action) => {
        const filesState = state['persistenceFileArray'];
        const persistenceFileFindIndex = filesState.findIndex(
          e => e.path === action.payload.oldPath
        );
        if (persistenceFileFindIndex === -1) {
          return;
        }
        const newPersistenceFile = {
          ...filesState[persistenceFileFindIndex],
          path: action.payload.newPath,
          name: action.payload.newFileName
        };
        filesState[persistenceFileFindIndex] = newPersistenceFile;
        state.persistenceFileArray = filesState;
      })
      .addCase(updatePersistenceFolderPathAndNameByPath, (state, action) => {
        const filesState = state['persistenceFileArray'];
        // get current level of folder
        const regexResult = filePathRegex.exec(action.payload.newPath)!;

        const currFolderSplit: string[] = regexResult[0].slice(1).split('/');
        const currFolderLevel = currFolderSplit.length - 1;

        // /fold1/ becomes ["fold1"]
        // /fold1/fold2/ becomes ["fold1", "fold2"]
        // If in top level folder, becomes [""]

        console.log(regexResult, currFolderSplit, 'a1');

        // update all files that are its children
        state.persistenceFileArray = filesState
          .filter(e => e.path)
          .map(e => {
            const r = filePathRegex.exec(e.path!)!;
            const currParentFolders = r[0].slice(1).split('/');
            console.log('currParentFolders', currParentFolders, 'folderLevel', currFolderLevel);
            if (currParentFolders.length <= currFolderLevel) {
              return e; // not a child of folder
            }
            if (currParentFolders[currFolderLevel] !== action.payload.oldFolderName) {
              return e; // not a child of folder
            }
            // only children remain
            currParentFolders[currFolderLevel] = action.payload.newFolderName;
            currParentFolders[0] = '/' + currParentFolders[0];
            const newPath = currParentFolders.join('/');
            console.log('from', e.path, 'to', newPath);
            return { ...e, path: newPath };
          });
      })
      .addCase(setPersistenceFileLastEditByPath, (state, action) => {
        const filesState = state['persistenceFileArray'];
        const persistenceFileFindIndex = filesState.findIndex(e => e.path === action.payload.path);
        if (persistenceFileFindIndex === -1) {
          return;
        }
        const newPersistenceFile = {
          ...filesState[persistenceFileFindIndex],
          lastEdit: action.payload.date
        };
        filesState[persistenceFileFindIndex] = newPersistenceFile;
        state.persistenceFileArray = filesState;
      })
      .addCase(updateLastEditedFilePath, (state, action) => {
        state.lastEditedFilePath = action.payload.lastEditedFilePath;
      })
      .addCase(updateRefreshFileViewKey, (state, action) => {
        state.refreshFileViewKey = (state.refreshFileViewKey + 1) % 2;
        state.lastEditedFilePath = '';
      });
  }
);
