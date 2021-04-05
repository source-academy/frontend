import { expectSaga } from 'redux-saga-test-plan';

import { actions } from '../../../commons/utils/ActionsHelper';

// mock away the store
jest.mock('../../../pages/createStore');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const GitHubPersistenceSaga = require('../GitHubPersistenceSaga').default;

test('LOGOUT_GITHUB removes Octokit instance from the session state', async () => {
  await expectSaga(GitHubPersistenceSaga)
    .dispatch(actions.removeGitHubOctokitInstance())
    .silentRun();
});
