import type { FSModule } from 'browserfs/dist/node/core/FS';
import { call, put, select, type StrictEffect } from 'redux-saga/effects';
import { featureSelector } from 'src/commons/featureFlags/featureSelector';
import WorkspaceActions from 'src/commons/workspace/WorkspaceActions';
import { flagConductorEv3Enable } from 'src/features/remoteExecutionConductor/flagConductorEv3Enable';

import { EventType } from '../../../../features/achievement/AchievementTypes';
import { selectDefaultFileExtension } from '../../../../features/directory/LanguageDirectoryTypes';
import type { DeviceSession } from '../../../../features/remoteExecution/RemoteExecutionTypes';
import { WORKSPACE_BASE_PATHS } from '../../../../pages/fileSystem/createInBrowserFileSystem';
import type { OverallState } from '../../../application/ApplicationTypes';
import { retrieveFilesInWorkspaceAsRecord } from '../../../fileSystem/utils';
import { actions } from '../../../utils/ActionsHelper';
import type { WorkspaceLocation } from '../../../workspace/WorkspaceTypes';
import { selectWorkspace } from '../../SafeEffects';
import { evalCodeConductorSaga } from './evalCode';

export function* evalEditorSaga(
  workspaceLocation: WorkspaceLocation,
): Generator<StrictEffect, void, any> {
  const {
    activeEditorTabIndex,
    programPrependValue: prepend,
    editorTabs,
    isFolderModeEnabled,
  } = yield* selectWorkspace(workspaceLocation);

  const [fileSystem, remoteExecutionSession]: [FSModule, DeviceSession | undefined] = yield select(
    (state: OverallState) => [
      state.fileSystem.inBrowserFileSystem,
      state.session.remoteExecutionSession,
    ],
  );

  if (activeEditorTabIndex === null) {
    throw new Error('Cannot evaluate program without an entrypoint file.');
  }

  const extension: string = yield select((state: OverallState) =>
    selectDefaultFileExtension(state.languageDirectory),
  );
  const defaultFilePath = `${WORKSPACE_BASE_PATHS[workspaceLocation]}/program.${extension}`;
  let files: Record<string, string>;
  if (isFolderModeEnabled) {
    files = yield call(retrieveFilesInWorkspaceAsRecord, workspaceLocation, fileSystem);
  } else {
    files = {
      [defaultFilePath]: editorTabs[activeEditorTabIndex].value,
    };
  }
  // Outside folder mode, `files` above is always keyed by the freshly-computed `defaultFilePath`
  // (never by the tab's own `filePath`) - falling back to `editorTab.filePath` here too, as this
  // used to do unconditionally, could point entrypointFilePath at a key `files` doesn't have (e.g.
  // a stale filePath left over from folder mode having been toggled on then off), making
  // `files[entrypointFilePath]` resolve to `undefined` and silently running nothing.
  const entrypointFilePath = isFolderModeEnabled
    ? (editorTabs[activeEditorTabIndex].filePath ?? defaultFilePath)
    : defaultFilePath;
  yield put(actions.addEvent([EventType.RUN_CODE]));

  if (remoteExecutionSession && remoteExecutionSession.workspace === workspaceLocation) {
    // Deliberately gated on the EV3-specific flag - the legacy Source path (js-slang -> SVML -> SlingClient, see
    // RemoteExecutionSaga.ts) must stay the default for every device until the Conductor/py-slang
    // pipeline is actually finished end-to-end,
    const isConductorEv3: boolean = yield select(featureSelector(flagConductorEv3Enable));
    if (isConductorEv3) {
      yield put(actions.remoteExecConductorRun(files, entrypointFilePath));
    } else {
      yield put(actions.remoteExecRun(files, entrypointFilePath));
    }
  } else {
    // End any code that is running right now.
    yield put(actions.beginInterruptExecution(workspaceLocation));
    yield put(actions.clearReplOutput(workspaceLocation));
    for (const editorTab of editorTabs) {
      files[editorTab.filePath ?? defaultFilePath] = editorTab.value;
    }

    // Prepend is concatenated into the entrypoint: each evalCodeSaga call runs in its own fresh,
    // isolated worker with no shared state, so it can't be evaluated separately beforehand.
    if (prepend.length) {
      files[entrypointFilePath] = `${prepend}\n${files[entrypointFilePath]}`;
    }
    yield call(
      evalCodeConductorSaga,
      files,
      entrypointFilePath,
      workspaceLocation,
      WorkspaceActions.evalEditor.type,
    );
  }
}
