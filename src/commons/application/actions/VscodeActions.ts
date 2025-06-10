import { createActions } from 'src/commons/redux/utils';

const VscodeActions = createActions('vscode', {
  setVscode: 0
});

// For compatibility with existing code (actions helper)
export default {
  ...VscodeActions
};
