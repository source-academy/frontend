import { beforeEach, describe, expect, test, vi } from 'vitest';

import sideContentManager from '../../commons/sideContent/SideContentManager';
import WorkspaceActions from '../../commons/workspace/WorkspaceActions';
import { store } from '../../pages/createStore';
import { hostServices } from './cseDiagramService';
import { editorService } from './editorService';

describe('the editor service that a visualizer plugin is lent', () => {
  /** The state of a store whose workspaces have this many editor tabs. */
  const withEditorTabs = (count: number) =>
    vi.spyOn(store, 'getState').mockReturnValue({
      workspaces: {
        playground: { editorTabs: Array(count).fill({}) },
        assessment: { editorTabs: Array(count).fill({}) },
      },
    } as unknown as ReturnType<typeof store.getState>);

  beforeEach(() => {
    vi.restoreAllMocks();
    sideContentManager.setWorkspaceLocation('playground');
    withEditorTabs(1);
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
      // The contract's lines are 1-based; the editor's rows are 0-based.
      WorkspaceActions.setEditorHighlightedLines('assessment', 0, [
        [2, 2],
        [4, 6],
      ]),
    );
  });

  test('the first line of the editor is row 0', () => {
    const dispatch = vi.spyOn(store, 'dispatch').mockImplementation(action => action);

    editorService.highlight([[1, 1]]);

    expect(dispatch).toHaveBeenCalledWith(
      WorkspaceActions.setEditorHighlightedLines('playground', 0, [[0, 0]]),
    );
  });

  test('does nothing, and does not throw, when the workspace has no editor tab', () => {
    withEditorTabs(0);
    const dispatch = vi.spyOn(store, 'dispatch').mockImplementation(action => action);

    expect(() => editorService.highlight([[1, 2]])).not.toThrow();
    expect(() => editorService.highlight([])).not.toThrow();
    expect(dispatch).not.toHaveBeenCalled();
  });

  test('no lines removes the highlight', () => {
    const dispatch = vi.spyOn(store, 'dispatch').mockImplementation(action => action);

    editorService.highlight([]);

    expect(dispatch).toHaveBeenCalledWith(
      WorkspaceActions.setEditorHighlightedLines('playground', 0, []),
    );
  });
});
