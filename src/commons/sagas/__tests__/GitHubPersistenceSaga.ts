import { expectSaga } from 'redux-saga-test-plan';

import { actions } from '../../../commons/utils/ActionsHelper';
import { REMOVE_GITHUB_OCTOKIT_OBJECT_AND_ACCESS_TOKEN } from '../../application/types/SessionTypes';

// mock away the store
jest.mock('../../../pages/createStore');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const GitHubPersistenceSaga = require('../GitHubPersistenceSaga').default;

test('logoutGitHub results in REMOVE_GITHUB_OCTOKIT_OBJECT being dispatched', async () => {
  await expectSaga(GitHubPersistenceSaga)
    .put({
      type: REMOVE_GITHUB_OCTOKIT_OBJECT_AND_ACCESS_TOKEN,
      payload: undefined,
      meta: undefined,
      error: undefined
    })
    .dispatch(actions.logoutGitHub())
    .silentRun();
});
