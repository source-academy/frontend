import { WorkspaceLocation, WorkspaceLocations } from '../../actions/workspaces';
import * as actionTypes from '../actionTypes';
import {
  finishInvite,
  initInvite,
  invalidEditorSessionId,
  setEditorSessionId,
  setWebsocketStatus
} from '../collabEditing';

const gradingWorkspace: WorkspaceLocation = WorkspaceLocations.grading;
const playgroundWorkspace: WorkspaceLocation = WorkspaceLocations.playground;

test('finishInvite generates correct action object', () => {
  const action = finishInvite(playgroundWorkspace);
  expect(action).toEqual({
    type: actionTypes.FINISH_INVITE,
    payload: {
      workspaceLocation: playgroundWorkspace
    }
  });
});

test('initInvte generates correct action object', () => {
  const action = initInvite('// Collaboration Editing!!!', playgroundWorkspace);
  expect(action).toEqual({
    type: actionTypes.INIT_INVITE,
    payload: {
      editorValue: '// Collaboration Editing!!!',
      workspaceLocation: playgroundWorkspace
    }
  });
});

test('invalidEditorSessionId generates correct action object', () => {
  const action = invalidEditorSessionId();
  expect(action).toEqual({
    type: actionTypes.INVALID_EDITOR_SESSION_ID
  });
});

test('setEditorSessionId generates correct action object', () => {
  const editorSessionId = 'test-editor-session-id';
  const action = setEditorSessionId(gradingWorkspace, editorSessionId);
  expect(action).toEqual({
    type: actionTypes.SET_EDITOR_SESSION_ID,
    payload: {
      workspaceLocation: gradingWorkspace,
      editorSessionId
    }
  });
});

test('setWebsocketStatus generates correct action object', () => {
  const websocketStatus = 0;
  const action = setWebsocketStatus(playgroundWorkspace, websocketStatus);
  expect(action).toEqual({
    type: actionTypes.SET_WEBSOCKET_STATUS,
    payload: {
      workspaceLocation: playgroundWorkspace,
      websocketStatus
    }
  });
});
