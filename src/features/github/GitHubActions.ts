import { createActions } from 'src/commons/redux/utils';

const newActions = createActions('github', {
  githubOpenFile: () => ({}),
  githubSaveFile: () => ({}),
  githubSaveFileAs: () => ({})
});

// For compatibility with existing code (actions helper)
export default {
  ...newActions
};
