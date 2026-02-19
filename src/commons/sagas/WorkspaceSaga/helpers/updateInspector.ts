import { Chapter } from 'js-slang/dist/langs';
import { SagaIterator } from 'redux-saga';
import { put, select } from 'redux-saga/effects';

import { OverallState } from '../../../application/ApplicationTypes';
import { actions } from '../../../utils/ActionsHelper';
import { visualizeJavaCseMachine } from '../../../utils/JavaHelper';
import { visualizeCseMachine } from '../../../utils/JsSlangHelper';
import { WorkspaceLocation } from '../../../workspace/WorkspaceTypes';

export function* updateInspector(workspaceLocation: WorkspaceLocation): SagaIterator {
  try {
    const [lastDebuggerResult, chapter] = yield select((state: OverallState) => [
      state.workspaces[workspaceLocation].lastDebuggerResult,
      state.workspaces[workspaceLocation].context.chapter
    ]);
    if (!lastDebuggerResult) {
      yield put(actions.setEditorHighlightedLines(workspaceLocation, 0, []));
      return;
    }
    if (chapter === Chapter.FULL_JAVA) {
      const controlItem = lastDebuggerResult.context.control.peek();
      let start = -1;
      let end = -1;
      if (controlItem?.srcNode?.location) {
        const node = controlItem.srcNode;
        start = node.location.startLine - 1;
        end = node.location.endLine ? node.location.endLine - 1 : start;
      }
      yield put(actions.setEditorHighlightedLines(workspaceLocation, 0, []));
      yield put(actions.setEditorHighlightedLines(workspaceLocation, 0, [[start, end]]));
      visualizeJavaCseMachine(lastDebuggerResult);
    } else {
      // When the nodes[0] was null earlier, the final CSE visualisation was not shown.
      // Right now, if it was null, since the expected value of node.loc.start.line is '0' or its equivalent, we set the row to '-1' to avoid highlighting any line and showing the final CSE visualisation.
      const node = lastDebuggerResult?.context?.runtime?.nodes?.[0];
      const row = node?.loc?.start?.line !== undefined ? node.loc.start.line - 1 : -1;
      // The 'node' variable is only for the scope of this else block (used for the redefinition of 'row')
      // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
      yield put(actions.setEditorHighlightedLines(workspaceLocation, 0, []));
      // We highlight only one row to show the current line
      // If we highlight from start to end, the whole program block will be highlighted at the start
      // since the first node is the program node
      yield put(actions.setEditorHighlightedLines(workspaceLocation, 0, [[row, row]]));
      visualizeCseMachine(lastDebuggerResult);
    }
  } catch (e) {
    // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
    yield put(actions.setEditorHighlightedLines(workspaceLocation, 0, []));
    // most likely harmless, we can pretty much ignore this.
    // half of the time this comes from execution ending or a stack overflow and
    // the context goes missing.
  }
}
