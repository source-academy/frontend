import type { FSModule } from 'browserfs/dist/node/core/FS';
import { Variant } from 'js-slang/dist/types';
import { call, put, select, StrictEffect } from 'redux-saga/effects';
import WorkspaceActions from 'src/commons/workspace/WorkspaceActions';

import { EventType } from '../../../../features/achievement/AchievementTypes';
import type { DeviceSession } from '../../../../features/remoteExecution/RemoteExecutionTypes';
import { WORKSPACE_BASE_PATHS } from '../../../../pages/fileSystem/createInBrowserFileSystem';
import type { OverallState } from '../../../application/ApplicationTypes';
import { retrieveFilesInWorkspaceAsRecord } from '../../../fileSystem/utils';
import { actions } from '../../../utils/ActionsHelper';
import { makeElevatedContext } from '../../../utils/JsSlangHelper';
import { EVAL_SILENT, type WorkspaceLocation } from '../../../workspace/WorkspaceTypes';
import { selectWorkspace } from '../../SafeEffects';
import { blockExtraMethods } from './blockExtraMethods';
import { clearContext } from './clearContext';
import { evalCodeSaga } from './evalCode';
import { insertDebuggerStatements } from './insertDebuggerStatements';

export function* evalEditorSaga(
  workspaceLocation: WorkspaceLocation
): Generator<StrictEffect, void, any> {
  const {
    activeEditorTabIndex,
    programPrependValue: prepend,
    editorTabs,
    execTime,
    isFolderModeEnabled
  } = yield* selectWorkspace(workspaceLocation);

  const [fileSystem, remoteExecutionSession]: [FSModule, DeviceSession | undefined] = yield select(
    (state: OverallState) => [
      state.fileSystem.inBrowserFileSystem,
      state.session.remoteExecutionSession
    ]
  );

  if (activeEditorTabIndex === null) {
    throw new Error('Cannot evaluate program without an entrypoint file.');
  }

  const defaultFilePath = `${WORKSPACE_BASE_PATHS[workspaceLocation]}/program.js`;
  let files: Record<string, string>;
  if (isFolderModeEnabled) {
    files = yield call(retrieveFilesInWorkspaceAsRecord, workspaceLocation, fileSystem);
  } else {
    files = {
      [defaultFilePath]: editorTabs[activeEditorTabIndex].value
    };
  }
  const entrypointFilePath = editorTabs[activeEditorTabIndex].filePath ?? defaultFilePath;
  yield put(actions.addEvent([EventType.RUN_CODE]));

  if (remoteExecutionSession && remoteExecutionSession.workspace === workspaceLocation) {
    yield put(actions.remoteExecRun(files, entrypointFilePath));
  } else {
    // End any code that is running right now.
    yield put(actions.beginInterruptExecution(workspaceLocation));
    const entrypointCode = files[entrypointFilePath];
    yield* clearContext(workspaceLocation, entrypointCode);
    yield put(actions.clearReplOutput(workspaceLocation));
    const context = yield select(
      (state: OverallState) => state.workspaces[workspaceLocation].context
    );

    // Insert debugger statements at the lines of the program with a breakpoint.
    for (const editorTab of editorTabs) {
      const filePath = editorTab.filePath ?? defaultFilePath;
      const code = editorTab.value;
      const breakpoints = editorTab.breakpoints;
      files[filePath] = yield* insertDebuggerStatements(
        workspaceLocation,
        code,
        breakpoints,
        context
      );
    }

    // Evaluate the prepend silently with a privileged context, if it exists
    if (prepend.length) {
      const elevatedContext = makeElevatedContext(context);
      const prependFilePath = '/prepend.js';
      const prependFiles = {
        [prependFilePath]: prepend
      };
      if (context.variant !== Variant.TYPED) {
        yield call(
          evalCodeSaga,
          prependFiles,
          prependFilePath,
          elevatedContext,
          execTime,
          EVAL_SILENT,
          workspaceLocation
        );
      }

      // Block use of methods from privileged context
      yield* blockExtraMethods(elevatedContext, context, execTime, workspaceLocation);
    }

    if (context.variant === Variant.TYPED) {
      // Prepend was multi-line, now we need to split them by \n and join them
      // This is to avoid extra lines in the editor which affects the error message location
      const prependSingleLine = prepend.split('\n').join('');
      files[entrypointFilePath] = prependSingleLine + files[entrypointFilePath];
    }
    yield call(
      evalCodeSaga,
      files,
      entrypointFilePath,
      context,
      execTime,
      WorkspaceActions.evalEditor.type,
      workspaceLocation
    );
  }
}
