import { expectSaga } from 'redux-saga-test-plan';
import { test, vi } from 'vitest';
import SessionActions from 'src/commons/application/actions/SessionActions';

import { actions } from '../../utils/ActionsHelper';
import GitHubPersistenceSaga from '../GitHubPersistenceSaga';

// mock away the store
vi.mock(import('../../../pages/createStore'));

test('logoutGitHub results in REMOVE_GITHUB_OCTOKIT_OBJECT being dispatched', () => {
  return expectSaga(GitHubPersistenceSaga)
    .put({
      type: SessionActions.removeGitHubOctokitObjectAndAccessToken.type,
      payload: {}
    })
    .dispatch(actions.logoutGitHub())
    .silentRun();
});
