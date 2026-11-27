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
    store.dispatch(
      WorkspaceActions.setEditorHighlightedLines(
        sideContentManager.getWorkspaceLocation(),
        0,
        lines.map(([first, last]): [number, number] => [first, last]),
      ),
    );
  },
};
