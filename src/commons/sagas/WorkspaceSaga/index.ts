import { type AutoCompleteEntry, WEB_PLUGIN_ID } from '@sourceacademy/common-autocomplete';
import type { IConduit } from '@sourceacademy/conductor/conduit';
import type { FSModule } from 'browserfs/dist/node/core/FS';
import { findDeclaration } from 'js-slang';
import type { EventChannel } from 'redux-saga';
import { call, delay, put, race, select, take } from 'redux-saga/effects';
import AutoCompletePlugin from 'src/features/conductor/AutocompletePlugin';
import { BrowserHostPlugin } from 'src/features/conductor/BrowserHostPlugin';

import { combineSagaHandlers } from '../../../commons/redux/utils';
import WorkspaceActions from '../../../commons/workspace/WorkspaceActions';
import { EventType } from '../../../features/achievement/AchievementTypes';
import DataVisualizer from '../../../features/dataVisualizer/dataVisualizer';
import LanguageDirectoryActions from '../../../features/directory/LanguageDirectoryActions';
import { selectDefaultFileExtension } from '../../../features/directory/LanguageDirectoryTypes';
import { selectTestCaseLanguage } from '../../../features/directory/testCaseLanguage';
import type { DeviceSession } from '../../../features/remoteExecution/RemoteExecutionTypes';
import { WORKSPACE_BASE_PATHS } from '../../../pages/fileSystem/createInBrowserFileSystem';
import { defaultEditorValue, type OverallState } from '../../application/ApplicationTypes';
import { ExternalLibraryName } from '../../application/types/ExternalTypes';
import type { Testcase } from '../../assessment/AssessmentTypes';
import { createAnalysisContext } from '../../editor/sourceAnalysis';
import { writeFileRecursively } from '../../fileSystem/utils';
import { actions } from '../../utils/ActionsHelper';
import {
  showSuccessMessage,
  showWarningMessage,
} from '../../utils/notifications/NotificationsHelper';
import { getPreparedConductorSaga } from '../helpers/conductorEvaluatorCache';
import { selectWorkspace } from '../SafeEffects';
import { evalCodeConductorSaga } from './helpers/evalCode';
import { evalEditorSaga } from './helpers/evalEditor';
import { runTestCase } from './helpers/runTestCase';
import {
  fetchVersionHistorySaga,
  nameVersionSaga,
  restoreVersionSaga,
  selectVersionSaga,
} from './helpers/versionHistory';

const WorkspaceSaga = combineSagaHandlers({
  [WorkspaceActions.addHtmlConsoleError.type]: function* (action) {
    yield put(actions.handleConsoleLog(action.payload.workspaceLocation, action.payload.errorMsg));
  },
  [WorkspaceActions.toggleFolderMode.type]: function* (action) {
    const workspaceLocation = action.payload.workspaceLocation;
    const isFolderModeEnabled: boolean = yield select(
      (state: OverallState) => state.workspaces[workspaceLocation].isFolderModeEnabled,
    );
    yield put(actions.setFolderMode(workspaceLocation, !isFolderModeEnabled));
    const warningMessage = `Folder mode ${!isFolderModeEnabled ? 'enabled' : 'disabled'}`;
    yield call(showWarningMessage, warningMessage, 750);
  },
  [WorkspaceActions.setFolderMode.type]: function* (action): any {
    const workspaceLocation = action.payload.workspaceLocation;
    const { editorTabs, isFolderModeEnabled } = yield* selectWorkspace(workspaceLocation);

    // Do nothing if Folder mode is enabled.
    if (isFolderModeEnabled) {
      return;
    }

    // If Folder mode is disabled and there are no open editor tabs, add an editor tab.
    if (editorTabs.length === 0) {
      const extension: string = yield select((state: OverallState) =>
        selectDefaultFileExtension(state.languageDirectory),
      );
      const defaultFilePath = `${WORKSPACE_BASE_PATHS[workspaceLocation]}/program.${extension}`;
      const fileSystem: FSModule | null = yield select(
        (state: OverallState) => state.fileSystem.inBrowserFileSystem,
      );
      // If the file system is not initialised, add an editor tab with the default editor value.
      if (fileSystem === null) {
        yield put(actions.addEditorTab(workspaceLocation, defaultFilePath, defaultEditorValue));
        return;
      }
      const editorValue: string = yield new Promise<string>((resolve, reject) => {
        fileSystem.exists(defaultFilePath, fileExists => {
          if (!fileExists) {
            // If the file does not exist, we need to also create it in the file system.
            writeFileRecursively(fileSystem, defaultFilePath, defaultEditorValue)
              .then(() => resolve(defaultEditorValue))
              .catch(err => reject(err));
            return;
          }
          fileSystem.readFile(defaultFilePath, 'utf-8', (err, fileContents) => {
            if (err) {
              reject(err);
              return;
            }
            if (fileContents === undefined) {
              reject(new Error('File exists but has no contents.'));
              return;
            }
            resolve(fileContents);
          });
        });
      });
      yield put(actions.addEditorTab(workspaceLocation, defaultFilePath, editorValue));
    }
  },
  // Mirror editor updates to the associated file in the filesystem.
  [WorkspaceActions.updateEditorValue.type]: function* (action): any {
    const workspaceLocation = action.payload.workspaceLocation;
    const editorTabIndex = action.payload.editorTabIndex;

    const filePath: string | undefined = yield select(
      (state: OverallState) =>
        state.workspaces[workspaceLocation].editorTabs[editorTabIndex].filePath,
    );
    // If the code does not have an associated file, do nothing.
    if (filePath === undefined) {
      return;
    }

    const fileSystem: FSModule | null = yield select(
      (state: OverallState) => state.fileSystem.inBrowserFileSystem,
    );
    // If the file system is not initialised, do nothing.
    if (fileSystem === null) {
      return;
    }

    fileSystem.writeFile(filePath, action.payload.newEditorValue, err => {
      if (err) {
        console.error(err);
      }
    });
  },
  [WorkspaceActions.evalEditor.type]: {
    takeLatest: ({ payload: { workspaceLocation } }) => evalEditorSaga(workspaceLocation),
  },

  [WorkspaceActions.promptAutocomplete.type]: function* (action) {
    const workspaceLocation = action.payload.workspaceLocation;
    const {
      activeEditorTabIndex,
      editorTabs,
      programPrependValue: prepend,
    } = yield* selectWorkspace(workspaceLocation);
    const editorValue = editorTabs[activeEditorTabIndex ?? 0].value;

    // Deal with prepended code
    let autocompleteCode;
    let prependLength = 0;
    if (!prepend) {
      autocompleteCode = editorValue;
    } else {
      prependLength = prepend.split('\n').length;
      autocompleteCode = prepend + '\n' + editorValue;
    }

    const { conduit }: { hostPlugin: BrowserHostPlugin; conduit: IConduit } =
      yield call(getPreparedConductorSaga);

    let plugin: AutoCompletePlugin;
    try {
      plugin = conduit.lookupPlugin(WEB_PLUGIN_ID) as AutoCompletePlugin;
    } catch {
      return;
    }

    if (plugin) {
      const channel: EventChannel<AutoCompleteEntry[]> = yield call(
        [plugin, 'complete'],
        autocompleteCode,
        action.payload.row + prependLength,
        action.payload.column,
      );
      //const names: AutoCompleteEntry[] = yield take(channel);
      const { names, timeout }: { names?: AutoCompleteEntry[]; timeout?: true } = yield race({
        names: take(channel),
        timeout: delay(3000),
      });

      if (timeout || !names) {
        console.warn('autocomplete channel timed out — runner never replied');
        channel.close();
        return;
      }

      yield call(
        action.payload.callback,
        null,
        names.map(name => ({
          meta: name.meta,
          value: name.name,
          caption: name.name,
          docHTML: name.docHTML,
          score: name.score ? name.score + 1000 : 1000, // Prioritize suggestions from code
          name: undefined,
        })),
      );
      channel.close();
    } else {
      yield call(action.payload.callback, null, []);
    }
  },
  [WorkspaceActions.evalRepl.type]: function* (action) {
    const workspaceLocation = action.payload.workspaceLocation;
    const { replValue: code } = yield* selectWorkspace(workspaceLocation);

    yield put(actions.clearReplInput(workspaceLocation));
    yield put(actions.sendReplInputToOutput(code, workspaceLocation));

    const remoteExecutionSession: DeviceSession | undefined = yield select(
      (state: OverallState) => state.session.remoteExecutionSession,
    );

    if (remoteExecutionSession && remoteExecutionSession.workspace === workspaceLocation) {
      // Mirrors evalEditorSaga's own remote-execution branch (evalEditor.ts) - a REPL line must be
      // shipped to the connected device through the same Run pipeline as the editor's Run button,
      // not evaluated below against the browser's own local js-slang/Conductor context. That local
      // context has no access to the device's hardware (its EV3 functions are meaningless without a
      // real robot attached), so evaluating it there would silently do nothing (or error) instead of
      // actually running on the robot - which is what disabled the REPL outright during remote
      // execution in the first place (see Playground.tsx's `usingRemoteExecution`).
      const codeFilePath = '/code.js';
      const codeFiles = { [codeFilePath]: code };
      yield put(actions.remoteExecConductorRun(codeFiles, codeFilePath));
      return;
    }

    const codeFilePath = '/code.js';
    yield call(
      evalCodeConductorSaga,
      { [codeFilePath]: code },
      codeFilePath,
      workspaceLocation,
      WorkspaceActions.evalRepl.type,
    );
  },
  [WorkspaceActions.evalTestcase.type]: function* (action) {
    const workspaceLocation = action.payload.workspaceLocation;

    yield put(actions.addEvent([EventType.RUN_TESTCASE], workspaceLocation));
    const index = action.payload.testcaseId;
    yield* runTestCase(workspaceLocation, index);
  },
  /**
   * Note that the PLAYGROUND_EXTERNAL_SELECT action is made to
   * select the library for playground.
   * This is because assessments do not have a chapter & library select, the question
   * specifies the chapter and library to be used.
   *
   * To abstract this to assessments, the state structure must be manipulated to store
   * the external library name in a WorkspaceState (as compared to IWorkspaceManagerState).
   *
   * @see IWorkspaceManagerState @see WorkspaceState
   */
  [WorkspaceActions.externalLibrarySelect.type]: function* (action) {
    const { workspaceLocation, externalLibraryName: newExternalLibraryName } = action.payload;
    const oldExternalLibraryName: ExternalLibraryName = yield select(
      (state: OverallState) => state.workspaces[workspaceLocation].externalLibrary,
    );
    if (newExternalLibraryName !== oldExternalLibraryName || action.payload.initialise) {
      yield put(actions.changeExternalLibrary(newExternalLibraryName, workspaceLocation));
      yield call([DataVisualizer, DataVisualizer.clearWithData]);
      yield put(actions.clearReplOutput(workspaceLocation));
      if (!action.payload.initialise) {
        yield call(showSuccessMessage, `Switched to ${newExternalLibraryName} library`, 1000);
      }
    }
  },
  [WorkspaceActions.navigateToDeclaration.type]: function* (action) {
    const workspaceLocation = action.payload.workspaceLocation;
    const code: string = yield select(
      // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
      (state: OverallState) => state.workspaces[workspaceLocation].editorTabs[0].value,
    );
    const result = findDeclaration(code, createAnalysisContext(), {
      line: action.payload.cursorPosition.row + 1,
      column: action.payload.cursorPosition.column,
    });
    if (result) {
      // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
      yield put(
        actions.moveCursor(action.payload.workspaceLocation, 0, {
          row: result.start.line - 1,
          column: result.start.column,
        }),
      );
    }
  },
  [WorkspaceActions.runAllTestcases.type]: {
    takeLeading: function* (action): any {
      const { workspaceLocation } = action.payload;

      yield call(evalEditorSaga, workspaceLocation);

      const testcases: Testcase[] = yield select(
        (state: OverallState) => state.workspaces[workspaceLocation].editorTestcases,
      );
      // Avoid displaying message if there are no testcases
      if (testcases.length === 0) {
        return;
      }

      // Display a message to the user
      yield call(showSuccessMessage, `Running all testcases!`, 2000);

      // Grading runs under the question's frontend grader language and evaluator (see
      // testCaseLanguage.ts) -
      // switch once for this whole batch (rather than once per testcase inside
      // runTestCaseConductor), since each switch tears down and rebuilds the Conductor session
      // (conductorEvaluatorCache.ts's ensureConductorSessionSaga). Doing that up to 2N times in
      // quick succession raced with Conductor's own internal teardown often enough to throw an
      // uncaught "Conduit already terminated" from inside the vendored library - see
      // source-academy/frontend#4232.
      const testCase: { languageId: string; evaluatorId: string } | undefined = yield select(
        (state: OverallState) => selectTestCaseLanguage(state, workspaceLocation),
      );
      if (!testCase) {
        yield call(
          showWarningMessage,
          'This question does not name a language for its test cases that the language directory has.',
        );
        return;
      }
      let selectedLanguageId: string | null = null;
      let selectedEvaluatorId: string | null = null;
      ({ selectedLanguageId, selectedEvaluatorId } = yield select(
        (state: OverallState) => state.languageDirectory,
      ));
      yield put(LanguageDirectoryActions.setSelectedLanguage(testCase.languageId));
      yield put(LanguageDirectoryActions.setSelectedEvaluator(testCase.evaluatorId));

      try {
        for (const idx of testcases.keys()) {
          // break each testcase up into separate event loop iterations
          // so that the UI updates
          yield new Promise(resolve => setTimeout(resolve, 0));

          const programSucceeded: boolean = yield call(runTestCase, workspaceLocation, idx, true);
          // Prematurely terminate if execution of the program failed (not the testcase)
          if (!programSucceeded) {
            return;
          }
        }
      } finally {
        if (selectedLanguageId) {
          yield put(LanguageDirectoryActions.setSelectedLanguage(selectedLanguageId));
          if (selectedEvaluatorId) {
            yield put(LanguageDirectoryActions.setSelectedEvaluator(selectedEvaluatorId));
          }
        } else {
          yield put(LanguageDirectoryActions.clearSelectedLanguage());
        }
      }
    },
  },
  [WorkspaceActions.fetchVersionHistory.type]: function* (action) {
    yield* fetchVersionHistorySaga(action);
  },
  [WorkspaceActions.selectVersion.type]: function* (action) {
    yield call(selectVersionSaga, action);
  },
  [WorkspaceActions.nameVersion.type]: function* (action) {
    yield* nameVersionSaga(action);
  },
  [WorkspaceActions.restoreVersion.type]: function* (action) {
    yield call(restoreVersionSaga, action);
  },
});

export default WorkspaceSaga;
