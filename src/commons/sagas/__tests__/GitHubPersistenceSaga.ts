import { expectSaga } from 'redux-saga-test-plan';

import { actions } from '../../../commons/utils/ActionsHelper';
import { REMOVE_GITHUB_OCTOKIT_INSTANCE } from '../../application/types/SessionTypes';

// mock away the store
jest.mock('../../../pages/createStore');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const GitHubPersistenceSaga = require('../GitHubPersistenceSaga').default;

test('LOGOUT_GITHUB results in REMOVE_GITHUB_OCTOKIT_INSTANCE being dispatched', async () => {
  await expectSaga(GitHubPersistenceSaga)
    .put({
      type: REMOVE_GITHUB_OCTOKIT_INSTANCE,
      payload: undefined,
      meta: undefined,
      error: undefined
    })
    .dispatch(actions.logoutGitHub())
    .silentRun();
});
