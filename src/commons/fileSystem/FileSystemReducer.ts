import { Reducer } from 'redux';

import { defaultFileSystem } from '../application/ApplicationTypes';
import { SourceActionType } from '../utils/ActionsHelper';
import { 
  FileSystemState, 
  SET_IN_BROWSER_FILE_SYSTEM, 
  ADD_GITHUB_SAVE_INFO, 
  DELETE_GITHUB_SAVE_INFO,
  DELETE_ALL_GITHUB_SAVE_INFO } from './FileSystemTypes';

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
      const githubSaveInfoArray = state['githubSaveInfoArray']
      
      const saveInfoIndex = githubSaveInfoArray.findIndex(e => e === githubSaveInfoPayload);
      if (saveInfoIndex == -1) {
        githubSaveInfoArray[githubSaveInfoArray.length] = githubSaveInfoPayload;

      } else {
        // file already exists, to replace file
        githubSaveInfoArray[saveInfoIndex] = githubSaveInfoPayload;
      }
      return {
        ...state,
        githubSaveInfoArray: githubSaveInfoArray
      };
    case DELETE_GITHUB_SAVE_INFO:

      const newGithubSaveInfoArray = state['githubSaveInfoArray'].filter(e => e !== action.payload.githubSaveInfo);

      return {
        ...state,
        githubSaveInfoArray: newGithubSaveInfoArray
      }
    case DELETE_ALL_GITHUB_SAVE_INFO:
      return {
        ...state,
        githubSaveInfoArray: []
      }

    default:
      return state;
  }
};
