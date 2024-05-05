import { createActions } from 'src/commons/redux/utils';

const newActions = createActions('github', {
  githubOpenFile: () => ({}),
  githubSaveFile: () => ({}),
  githubSaveFileAs: () => ({})
});

// For compatibility with existing code (reducer)
export const { githubOpenFile, githubSaveFile, githubSaveFileAs } = newActions;

// For compatibility with existing code (actions helper)
export default {
  ...newActions
};
