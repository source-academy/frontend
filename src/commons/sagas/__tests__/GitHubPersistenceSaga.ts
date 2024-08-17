import { expectSaga } from 'redux-saga-test-plan';
import SessionActions from 'src/commons/application/actions/SessionActions';

import { actions } from '../../utils/ActionsHelper';

// mock away the store
jest.mock('../../../pages/createStore');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const GitHubPersistenceSaga = require('../GitHubPersistenceSaga').default;

test('logoutGitHub results in REMOVE_GITHUB_OCTOKIT_OBJECT being dispatched', async () => {
  await expectSaga(GitHubPersistenceSaga)
    .put({
      type: SessionActions.removeGitHubOctokitObjectAndAccessToken.type,
      payload: {}
    })
    .dispatch(actions.logoutGitHub())
    .silentRun();
});
