import { expectSaga } from 'redux-saga-test-plan';

import { ExternalLibraryName } from '../../../commons/application/types/ExternalTypes';
import { actions } from '../../../commons/utils/ActionsHelper';
import {
  CHANGE_EXTERNAL_LIBRARY,
  CHAPTER_SELECT,
  UPDATE_EDITOR_VALUE
} from '../../../commons/workspace/WorkspaceTypes';

// mock away the store
jest.mock('../../../pages/createStore');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const GitHubPersistenceSaga = require('../GitHubPersistenceSaga').default;

beforeAll(() => {
  // Commit suicide
});

test('LOGIN_GITHUB causes Octokit instance to be generated for state', async () => {});

test('LOGOUT_GITHUB removes Octokit instance from the session state', async () => {});

/*
test('LOGOUT_GOOGLE causes logout', async () => {
  const signOut = jest.spyOn(window.gapi.auth2.getAuthInstance(), 'signOut');

  await expectSaga(PersistenceSaga).dispatch(actions.logoutGoogle()).silentRun();
  expect(signOut).toBeCalled();
});
*/
