import type { IEditorService, LineRange } from '@sourceacademy/common-tabs';

import sideContentManager from '../../commons/sideContent/SideContentManager';
import WorkspaceActions from '../../commons/workspace/WorkspaceActions';
import { store } from '../../pages/createStore';

/**
 * What the frontend lets a visualizer plugin do with the editor (the host contract of
 * `@sourceacademy/common-tabs`): mark lines. It marks them in the editor of the workspace that the
 * side content is shown for, with the editor's one highlight, so a plugin names no tool and no
 * language and the look of the mark stays the editor's theme.
 */
export const editorService: IEditorService = {
  highlight(lines: readonly LineRange[]): void {
    const workspaceLocation = sideContentManager.getWorkspaceLocation();
    // The user may have closed every editor tab; there is then nothing to mark or to clear, and the
    // reducer would throw for any tab index.
    if (store.getState().workspaces[workspaceLocation].editorTabs.length === 0) {
      return;
    }
    // The contract's lines are 1-based, as the editor shows them; the editor's state is 0-based rows.
    store.dispatch(
      WorkspaceActions.setEditorHighlightedLines(
        workspaceLocation,
        0,
        lines.map(([first, last]): [number, number] => [first - 1, last - 1]),
      ),
    );
  },
};
