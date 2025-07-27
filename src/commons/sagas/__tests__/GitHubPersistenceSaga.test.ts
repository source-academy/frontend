import { expectSaga } from 'redux-saga-test-plan';
import SessionActions from 'src/commons/application/actions/SessionActions';
import { vi } from 'vitest';

import { actions } from '../../utils/ActionsHelper';

// mock away the store
vi.mock('../../../pages/createStore');

const GitHubPersistenceSaga = (await import('../GitHubPersistenceSaga')).default;

test('logoutGitHub results in REMOVE_GITHUB_OCTOKIT_OBJECT being dispatched', async () => {
  await expectSaga(GitHubPersistenceSaga)
    .put({
      type: SessionActions.removeGitHubOctokitObjectAndAccessToken.type,
      payload: {}
    })
    .dispatch(actions.logoutGitHub())
    .silentRun();
});
