import {
  finishInvite,
  initInvite,
  invalidEditorSessionId,
  setEditorSessionId,
  setWebsocketStatus
} from '../../collabEditing/CollabEditingActions';
import { WorkspaceLocation, WorkspaceLocations } from '../../workspace/WorkspaceTypes';
import {
  FINISH_INVITE,
  INIT_INVITE,
  INVALID_EDITOR_SESSION_ID,
  SET_EDITOR_SESSION_ID,
  SET_WEBSOCKET_STATUS
} from '../CollabEditingTypes';

const gradingWorkspace: WorkspaceLocation = WorkspaceLocations.grading;
const playgroundWorkspace: WorkspaceLocation = WorkspaceLocations.playground;

test('finishInvite generates correct action object', () => {
  const action = finishInvite(playgroundWorkspace);
  expect(action).toEqual({
    type: FINISH_INVITE,
    payload: {
      workspaceLocation: playgroundWorkspace
    }
  });
});

test('initInvte generates correct action object', () => {
  const action = initInvite('// Collaboration Editing!!!', playgroundWorkspace);
  expect(action).toEqual({
    type: INIT_INVITE,
    payload: {
      editorValue: '// Collaboration Editing!!!',
      workspaceLocation: playgroundWorkspace
    }
  });
});

test('invalidEditorSessionId generates correct action object', () => {
  const action = invalidEditorSessionId();
  expect(action).toEqual({
    type: INVALID_EDITOR_SESSION_ID
  });
});

test('setEditorSessionId generates correct action object', () => {
  const editorSessionId = 'test-editor-session-id';
  const action = setEditorSessionId(gradingWorkspace, editorSessionId);
  expect(action).toEqual({
    type: SET_EDITOR_SESSION_ID,
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
    type: SET_WEBSOCKET_STATUS,
    payload: {
      workspaceLocation: playgroundWorkspace,
      websocketStatus
    }
  });
});
