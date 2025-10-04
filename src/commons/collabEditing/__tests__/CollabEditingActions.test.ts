import type { WorkspaceLocation } from '../../workspace/WorkspaceTypes';
import { setEditorSessionId, setSharedbConnected } from '../CollabEditingActions';

const gradingWorkspace: WorkspaceLocation = 'grading';
const playgroundWorkspace: WorkspaceLocation = 'playground';

describe(setEditorSessionId.type, () => {
  it('generates correct action object', () => {
    const editorSessionId = 'test-editor-session-id';
    const action = setEditorSessionId(gradingWorkspace, editorSessionId);
    expect(action).toEqual({
      type: setEditorSessionId.type,
      payload: {
        workspaceLocation: gradingWorkspace,
        editorSessionId
      }
    });
  });
});

describe(setSharedbConnected.type, () => {
  it('generates correct action object', () => {
    const connected = false;
    const action = setSharedbConnected(playgroundWorkspace, connected);
    expect(action).toEqual({
      type: setSharedbConnected.type,
      payload: {
        workspaceLocation: playgroundWorkspace,
        connected
      }
    });
  });
});
