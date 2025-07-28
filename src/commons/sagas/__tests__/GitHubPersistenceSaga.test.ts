import { expectSaga } from 'redux-saga-test-plan';
import SessionActions from 'src/commons/application/actions/SessionActions';
import { vi } from 'vitest';

import { actions } from '../../utils/ActionsHelper';
import GitHubPersistenceSaga from '../GitHubPersistenceSaga';

// mock away the store
vi.mock('../../../pages/createStore');

test('logoutGitHub results in REMOVE_GITHUB_OCTOKIT_OBJECT being dispatched', async () => {
  await expectSaga(GitHubPersistenceSaga)
    .put({
      type: SessionActions.removeGitHubOctokitObjectAndAccessToken.type,
      payload: {}
    })
    .dispatch(actions.logoutGitHub())
    .silentRun();
});
