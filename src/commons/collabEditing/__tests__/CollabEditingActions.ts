import { WorkspaceLocation } from '../../workspace/WorkspaceTypes';
import { setEditorSessionId, setSharedbConnected } from '../CollabEditingActions';
import { SET_EDITOR_SESSION_ID, SET_SHAREDB_CONNECTED } from '../CollabEditingTypes';

const gradingWorkspace: WorkspaceLocation = 'grading';
const playgroundWorkspace: WorkspaceLocation = 'playground';

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

test('setSharedbConnected generates correct action object', () => {
  const connected = false;
  const action = setSharedbConnected(playgroundWorkspace, connected);
  expect(action).toEqual({
    type: SET_SHAREDB_CONNECTED,
    payload: {
      workspaceLocation: playgroundWorkspace,
      connected
    }
  });
});
