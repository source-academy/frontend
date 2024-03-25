import { Reducer } from 'redux';

import { defaultFileSystem } from '../application/ApplicationTypes';
import { SourceActionType } from '../utils/ActionsHelper';
import { 
  FileSystemState, 
  SET_IN_BROWSER_FILE_SYSTEM,
  ADD_GITHUB_SAVE_INFO,
  ADD_PERSISTENCE_FILE,
  DELETE_GITHUB_SAVE_INFO,
  DELETE_PERSISTENCE_FILE,
  DELETE_ALL_GITHUB_SAVE_INFO,
  DELETE_ALL_PERSISTENCE_FILES } from './FileSystemTypes';

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
    case ADD_GITHUB_SAVE_INFO:
      const githubSaveInfoPayload = action.payload.githubSaveInfo;
      const githubSaveInfoArray = state['githubSaveInfoArray'];
      const saveInfoIndex = githubSaveInfoArray.findIndex(e => e === githubSaveInfoPayload); // TODO: '==' not applicable here?
      if (saveInfoIndex === -1) {
        githubSaveInfoArray[githubSaveInfoArray.length] = githubSaveInfoPayload;
      } else {
        // file already exists, to replace file
        githubSaveInfoArray[saveInfoIndex] = githubSaveInfoPayload;
      }
      return {
        ...state,
        githubSaveInfoArray: githubSaveInfoArray
      };
    case ADD_PERSISTENCE_FILE:
      const persistenceFilePayload = action.payload.persistenceFile;
      const persistenceFileArray = state['persistenceFileArray'];
      const persistenceFileIndex = persistenceFileArray.findIndex(e => e.id === persistenceFilePayload.id);
      if (persistenceFileIndex === -1) {
        persistenceFileArray[persistenceFileArray.length] = persistenceFilePayload;
      } else {
        persistenceFileArray[persistenceFileIndex] = persistenceFilePayload;
      }
      return {
        ...state,
        persistenceFileArray: persistenceFileArray
      }
    case DELETE_GITHUB_SAVE_INFO:
      const newGithubSaveInfoArray = state['githubSaveInfoArray'].filter(e => e !== action.payload.githubSaveInfo); // TODO: '==' not applicable here?
      return {
        ...state,
        githubSaveInfoArray: newGithubSaveInfoArray
      }
    case DELETE_PERSISTENCE_FILE:
      const newPersistenceFileArray = state['persistenceFileArray'].filter(e => e.id !== action.payload.persistenceFile.id);
      return {
        ...state,
        persistenceFileArray: newPersistenceFileArray
      }
    case DELETE_ALL_GITHUB_SAVE_INFO:
      return {
        ...state,
        githubSaveInfoArray: []
      }
    case DELETE_ALL_PERSISTENCE_FILES:
      return {
        ...state,
        persistenceFileArray: []
      }
    default:
      return state;
  }
};
