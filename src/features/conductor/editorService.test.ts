import { beforeEach, describe, expect, test, vi } from 'vitest';

import sideContentManager from '../../commons/sideContent/SideContentManager';
import WorkspaceActions from '../../commons/workspace/WorkspaceActions';
import { store } from '../../pages/createStore';
import { hostServices } from './cseDiagramService';
import { editorService } from './editorService';

describe('the editor service that a visualizer plugin is lent', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    sideContentManager.setWorkspaceLocation('playground');
  });

  test('is part of what the host lends to every plugin', () => {
    expect(hostServices.editor).toBe(editorService);
  });

  test('marks the lines in the editor of the workspace that the side content is shown for', () => {
    const dispatch = vi.spyOn(store, 'dispatch').mockImplementation(action => action);

    sideContentManager.setWorkspaceLocation('assessment');
    editorService.highlight([
      [3, 3],
      [5, 7],
    ]);

    expect(dispatch).toHaveBeenCalledWith(
      WorkspaceActions.setEditorHighlightedLines('assessment', 0, [
        [3, 3],
        [5, 7],
      ]),
    );
  });

  test('no lines removes the highlight', () => {
    const dispatch = vi.spyOn(store, 'dispatch').mockImplementation(action => action);

    editorService.highlight([]);

    expect(dispatch).toHaveBeenCalledWith(
      WorkspaceActions.setEditorHighlightedLines('playground', 0, []),
    );
  });
});
