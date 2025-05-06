import { createActions } from 'src/commons/redux/utils';

const newActions = createActions('github', {
  githubOpenFile: 0,
  githubSaveFile: 0,
  githubSaveFileAs: 0
});

export default newActions;
