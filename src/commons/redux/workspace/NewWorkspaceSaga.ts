import type { FSModule } from 'browserfs/dist/node/core/FS';
import {
  type Context,
  type Result,
  findDeclaration,
  getNames,
  interrupt,
  parseError,
  resume,
  runFilesInContext,
  runInContext} from 'js-slang';
import { TRY_AGAIN } from 'js-slang/dist/constants';
// import { defineSymbol } from 'js-slang/dist/createContext';
import { InterruptedError } from 'js-slang/dist/errors/errors';
import { parse } from 'js-slang/dist/parser/parser';
import { manualToggleDebugger } from 'js-slang/dist/stdlib/inspector';
import { typeCheck } from 'js-slang/dist/typeChecker/typeChecker';
import { type SourceError, Chapter, Variant } from 'js-slang/dist/types';
import { validateAndAnnotate } from 'js-slang/dist/validator/validator';
import { random } from 'lodash';
import _ from 'lodash';
import { posix as pathlib } from 'path';
import type { SagaIterator } from 'redux-saga';
import { type CallEffect, type StrictEffect, call, put, race } from 'redux-saga/effects';
import * as Sourceror from 'sourceror';
import { isSourceLanguage, styliseSublanguage } from 'src/commons/application/ApplicationTypes';
import { type TestcaseType, TestcaseTypes } from 'src/commons/assessment/AssessmentTypes';
import { Documentation } from 'src/commons/documentation/Documentation';
import { writeFileRecursively } from 'src/commons/fileSystem/utils';
import { SideContentType } from 'src/commons/sideContent/SideContentTypes';
import { actions } from 'src/commons/utils/ActionsHelper';
import DisplayBufferService from 'src/commons/utils/DisplayBufferService';
import {
  getBlockExtraMethodsString,
  getDifferenceInMethods,
  getRestoreExtraMethodsString,
  getStoreExtraMethodsString,
  highlightClean,
  highlightCleanForAgenda,
  highlightLine,
  highlightLineForAgenda,
  makeElevatedContext,
  visualizeEnv
} from 'src/commons/utils/JsSlangHelper';
import {
  showSuccessMessage,
  showWarningMessage
} from 'src/commons/utils/notifications/NotificationsHelper';
import { makeExternalBuiltins as makeSourcerorExternalBuiltins } from 'src/commons/utils/SourcerorHelper';
import { showFullJSDisclaimer, showFullTSDisclaimer } from 'src/commons/utils/WarningDialogHelper';
import { EventType } from 'src/features/achievement/AchievementTypes';
import DataVisualizer from 'src/features/dataVisualizer/dataVisualizer';
import EnvVisualizer from 'src/features/envVisualizer/EnvVisualizer';

import { SessionState } from '../session/SessionsReducer';
import { combineSagaHandlers } from '../utils';
import { safeTake as take, safeTakeEvery as takeEvery } from '../utils/SafeEffects';
import { selectFileSystem, selectSession, selectWorkspace } from '../utils/Selectors';
import { allWorkspaceActions } from './AllWorkspacesRedux';
import {
  AssessmentLocations,
  AssessmentWorkspaceState,
  getWorkspaceBasePath,
  PlaygroundWorkspaces,
  PlaygroundWorkspaceState,
  SideContentLocation,
} from './WorkspaceReduxTypes';
import { defaultEditorValue, WorkspaceState } from './WorkspaceStateTypes';

function* updateInspector(workspaceLocation: SideContentLocation): SagaIterator {
  const workspace: WorkspaceState = yield selectWorkspace(workspaceLocation);
  const activeEditorTabIndex = workspace.editorState.activeEditorTabIndex!;

  try {
    const row = lastDebuggerResult.context.runtime.nodes[0].loc.start.line - 1;
    // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.

    yield put(
      allWorkspaceActions.updateEditorHighlightedLines(workspaceLocation, activeEditorTabIndex, [])
    );
    // We highlight only one row to show the current line
    // If we highlight from start to end, the whole program block will be highlighted at the start
    // since the first node is the program node
    yield put(
      allWorkspaceActions.updateEditorHighlightedLines(workspaceLocation, activeEditorTabIndex, [
        [row, row]
      ])
    );
    yield call(visualizeEnv, lastDebuggerResult);
    // visualizeEnv(lastDebuggerResult);
  } catch (e) {
    // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
    yield put(
      allWorkspaceActions.updateEditorHighlightedLines(workspaceLocation, activeEditorTabIndex, [])
    );
    // most likely harmless, we can pretty much ignore this.
    // half of the time this comes from execution ending or a stack overflow and
    // the context goes missing.
  }
}

/**
 * Inserts debugger statements into the code based off the breakpoints set by the user.
 *
 * For every breakpoint, a corresponding `debugger;` statement is inserted at the start
 * of the line that the breakpoint is placed at. The `debugger;` statement is available
 * in both JavaScript and Source, and invokes any available debugging functionality.
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger
 * for more information.
 *
 * While it is typically the case that statements are contained within a single line,
 * this is not necessarily true. For example, the code `const x = 3;` can be rewritten as:
 * ```
 * const x
 * = 3;
 * ```
 * A breakpoint on the line `= 3;` would thus result in a `debugger;` statement being
 * added in the middle of another statement. The resulting code would then be syntactically
 * invalid.
 *
 * To work around this issue, we parse the code to check for syntax errors whenever we
 * add a `debugger;` statement. If the addition of a `debugger;` statement results in
 * invalid code, an error message is outputted with the line number of the offending
 * breakpoint.
 *
 * @param workspaceLocation The location of the current workspace.
 * @param code              The code which debugger statements should be inserted into.
 * @param breakpoints       The breakpoints corresponding to the code.
 * @param context           The context in which the code should be evaluated in.
 */
function* insertDebuggerStatements(
  location: SideContentLocation,
  code: string,
  breakpoints: string[],
  context: Context
): Generator<StrictEffect, string, any> {
  // Check for initial syntax errors.
  if (isSourceLanguage(context.chapter)) {
    parse(code, context);
  }

  // If there are syntax errors, we do not insert the debugger statements.
  // Instead, we let the code be evaluated so that the error messages are printed.
  if (context.errors.length > 0) {
    context.errors = [];
    return code;
  }

  // Otherwise, we step through the breakpoints one by one & try to insert
  // corresponding debugger statements.
  const lines = code.split('\n');
  let transformedCode = code;
  for (let i = 0; i < breakpoints.length; i++) {
    if (!breakpoints[i]) continue;
    lines[i] = 'debugger;' + lines[i];
    // Reconstruct the code & check that the code is still syntactically valid.
    // The insertion of the debugger statement is potentially invalid if it
    // happens within an existing statement (that is split across lines).
    transformedCode = lines.join('\n');
    if (isSourceLanguage(context.chapter)) {
      parse(transformedCode, context);
    }
    // If the resulting code is no longer syntactically valid, throw an error.
    if (context.errors.length > 0) {
      const errorMessage = `Hint: Misplaced breakpoint at line ${i + 1}.`;
      yield put(allWorkspaceActions.sendReplInputToOutput(location, errorMessage));
      return code;
    }
  }

  /*
  Not sure how this works, but there were some issues with breakpoints
  I'm not sure why `in` is being used here, given that it's usually not
  the intended effect

  for (const breakpoint in breakpoints) {
    // Add a debugger statement to the line with the breakpoint.
    const breakpointLineNum: number = parseInt(breakpoint);
    lines[breakpointLineNum] = 'debugger;' + lines[breakpointLineNum];
    // Reconstruct the code & check that the code is still syntactically valid.
    // The insertion of the debugger statement is potentially invalid if it
    // happens within an existing statement (that is split across lines).
    transformedCode = lines.join('\n');
    if (isSourceLanguage(context.chapter)) {
      parse(transformedCode, context);
    }
    // If the resulting code is no longer syntactically valid, throw an error.
    if (context.errors.length > 0) {
      const errorMessage = `Hint: Misplaced breakpoint at line ${breakpointLineNum + 1}.`;
      yield put(actions.sendReplInputToOutput(errorMessage, workspaceLocation));
      return code;
    }
  }
  */

  // Finally, return the transformed code with debugger statements added.
  return transformedCode;
}

const EVAL_SILENT = 'EVAL_SILENT';

export function* blockExtraMethods(
  elevatedContext: Context,
  context: Context,
  execTime: number,
  location: SideContentLocation,
  unblockKey?: string
) {
  // Extract additional methods available in the elevated context relative to the context
  const toBeBlocked = getDifferenceInMethods(elevatedContext, context);
  if (unblockKey) {
    const storeValues = getStoreExtraMethodsString(toBeBlocked, unblockKey);
    const storeValuesFilePath = '/storeValues.js';
    const storeValuesFiles = {
      [storeValuesFilePath]: storeValues
    };
    yield call(
      evalCode,
      storeValuesFiles,
      storeValuesFilePath,
      elevatedContext,
      execTime,
      location,
      EVAL_SILENT
    );
  }

  const nullifier = getBlockExtraMethodsString(toBeBlocked);
  const nullifierFilePath = '/nullifier.js';
  const nullifierFiles = {
    [nullifierFilePath]: nullifier
  };
  yield call(
    evalCode,
    nullifierFiles,
    nullifierFilePath,
    elevatedContext,
    execTime,
    location,
    EVAL_SILENT
  );
}

export function* restoreExtraMethods(
  elevatedContext: Context,
  context: Context,
  execTime: number,
  workspaceLocation: SideContentLocation,
  unblockKey: string
) {
  const toUnblock = getDifferenceInMethods(elevatedContext, context);
  const restorer = getRestoreExtraMethodsString(toUnblock, unblockKey);
  const restorerFilePath = '/restorer.js';
  const restorerFiles = {
    [restorerFilePath]: restorer
  };
  yield call(
    evalCode,
    restorerFiles,
    restorerFilePath,
    elevatedContext,
    execTime,
    workspaceLocation,
    EVAL_SILENT
  );
}

export function* dumpDisplayBuffer(
  location: SideContentLocation
): Generator<StrictEffect, void, any> {
  yield put(allWorkspaceActions.handleConsoleLog(location, DisplayBufferService.dump()));
}

let lastDebuggerResult: any;
let lastNonDetResult: Result;

const WorkspaceSaga = combineSagaHandlers(
  allWorkspaceActions,
  {
    beginClearContext: function* ({ payload: { location, payload } }) {
      yield call([DataVisualizer, DataVisualizer.clear]);
      yield call([EnvVisualizer, EnvVisualizer.clear]);
      for (const [key, value] of payload.globals) {
        window[key] = value;
      }

      yield put(
        allWorkspaceActions.endClearContext(
          location,
          payload.chapter,
          payload.variant,
          payload.globals,
          payload.symbols
        )
      );
    },
    chapterSelect: function* ({ payload }) {
      const {
        location,
        payload: { chapter: newChapter, variant: newVariant }
      } = payload;

      const {
        globals,
        context: { chapter: oldChapter, variant: oldVariant, externalSymbols: symbols }
      }: WorkspaceState = yield selectWorkspace(location);

      const chapterChanged: boolean = newChapter !== oldChapter || newVariant !== oldVariant;
      const toChangeChapter: boolean =
        newChapter === Chapter.FULL_JS
          ? chapterChanged && (yield call(showFullJSDisclaimer))
          : newChapter === Chapter.FULL_TS
          ? chapterChanged && (yield call(showFullTSDisclaimer))
          : chapterChanged;

      if (toChangeChapter) {
        yield put(
          allWorkspaceActions.beginClearContext(location, newChapter, newVariant, globals, symbols)
        );
        yield put(allWorkspaceActions.clearReplOutput(location));
        yield put(allWorkspaceActions.debugReset(location));
        yield call(
          showSuccessMessage,
          `Switched to ${styliseSublanguage(newChapter, newVariant)}`,
          1000
        );
      }
    },
    changeSublanguage: function* ({ payload }) {},
    debugReset: function* ({ payload: { location } }) {
      const { context }: WorkspaceState = yield selectWorkspace(location);

      yield put(allWorkspaceActions.clearReplOutput(location));
      // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
      yield put(allWorkspaceActions.updateEditorHighlightedLines(location, 0, []));
      context.runtime.break = false;
      lastDebuggerResult = undefined;
    },
    debugResume: function* ({ payload: { location } }) {
      const [code, execTime, context]: [string, number, Context] = yield selectWorkspace(
        // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
        location,
        workspace => {
          return [workspace.editorState.editorTabs[0].value, workspace.execTime, workspace.context];
        }
      );

      yield put(allWorkspaceActions.beginInterruptExecution(location));

      /** Clear the context, with the same chapter and externalSymbols as before. */
      yield put(allWorkspaceActions.clearReplOutput(location));

      // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
      yield put(allWorkspaceActions.updateEditorHighlightedLines(location, 0, []));
      const codeFilePath = '/code.js';
      const codeFiles = {
        [codeFilePath]: code
      };
      yield call(
        evalCode,
        codeFiles,
        codeFilePath,
        context,
        execTime,
        location,
        allWorkspaceActions.debugResume.type
      );
    },
    evalEditor: function* ({ payload: { location } }) {
      yield* evalEditor(location);
    },
    evalRepl: function* ({ payload: { location } }) {
      const {
        repl: { replValue: code },
        execTime,
        context
      }: WorkspaceState = yield selectWorkspace(location);

      yield put(allWorkspaceActions.beginInterruptExecution(location));
      yield put(allWorkspaceActions.clearReplInput(location));
      yield put(allWorkspaceActions.sendReplInputToOutput(location, code));
      // Reset old context.errors
      context.errors = [];

      const codeFilePath = '/code.js';
      const codeFiles = {
        [codeFilePath]: code
      };
      yield call(
        evalCode,
        codeFiles,
        codeFilePath,
        context,
        execTime,
        location,
        allWorkspaceActions.evalRepl.type
      );
    },
    navDeclaration: function* ({ payload: { location, payload } }) {
      const [code, context]: [string, Context] = yield selectWorkspace(location, workspace => [
        // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
        workspace.editorState.editorTabs[0].value,
        workspace.context
      ]);

      const result: ReturnType<typeof findDeclaration> = yield call(
        findDeclaration,
        code,
        context,
        {
          line: payload.row + 1,
          column: payload.column
        }
      );

      if (result) {
        // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
        yield put(
          allWorkspaceActions.moveCursor(location, 0, {
            row: result.start.line - 1,
            column: result.start.column
          })
        );
      }
    },
    promptAutocomplete: function* ({ payload: { location, payload } }) {
      const {
        context,
        programPrependValue: prepend,
        editorState
      }: WorkspaceState = yield selectWorkspace(location);

      if (editorState.activeEditorTabIndex === null) {
        throw new Error('Prompt autocomplete called without an active editor tab');
      }

      const editorValue = editorState.editorTabs[editorState.activeEditorTabIndex].value;

      // Deal with prepended code
      let autocompleteCode;
      let prependLength = 0;
      if (!prepend) {
        autocompleteCode = editorValue;
      } else {
        prependLength = prepend.split('\n').length;
        autocompleteCode = prepend + '\n' + editorValue;
      }

      const [editorNames, displaySuggestions] = yield call(
        getNames,
        autocompleteCode,
        payload.row + prependLength,
        payload.column,
        context
      );

      if (!displaySuggestions) {
        yield call(payload.callback);
        return;
      }

      const editorSuggestions = editorNames.map((name: any) => {
        return {
          ...name,
          caption: name.name,
          value: name.name,
          score: name.score ? name.score + 1000 : 1000, // Prioritize suggestions from code
          name: undefined
        };
      });

      let chapterName = context.chapter.toString();
      const variant = context.variant ?? Variant.DEFAULT;
      if (variant !== Variant.DEFAULT) {
        chapterName += '_' + variant;
      }

      const builtinSuggestions = Documentation.builtins[chapterName] || [];

      yield call(payload.callback, null, editorSuggestions.concat(builtinSuggestions));
    },
    setFolderMode: function* ({ payload: { location } }) {
      const {
        editorState: { isFolderModeEnabled, editorTabs }
      }: WorkspaceState = yield selectWorkspace(location);
      // Do nothing if Folder mode is enabled.
      if (isFolderModeEnabled) {
        return;
      }

      // If Folder mode is disabled and there are no open editor tabs, add an editor tab.
      if (editorTabs.length === 0) {
        const defaultFilePath = `${getWorkspaceBasePath(location)}/program.js`;
        const fileSystem: FSModule | null = yield selectFileSystem();

        // If the file system is not initialised, add an editor tab with the default editor value.
        if (fileSystem === null) {
          yield put(
            allWorkspaceActions.addEditorTab(location, defaultFilePath, defaultEditorValue)
          );
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
        yield put(allWorkspaceActions.addEditorTab(location, defaultFilePath, editorValue));
      }
    },
    toggleEditorAutorun: function* ({ payload: { location } }) {
      const {
        editorState: { isEditorAutorun }
      }: WorkspaceState = yield selectWorkspace(location);
      yield call(showWarningMessage, 'Autorun ' + (isEditorAutorun ? 'Started' : 'Stopped'), 750);
    },
    toggleFolderMode: function* ({ payload: { location } }) {
      const {
        editorState: { isFolderModeEnabled }
      }: WorkspaceState = yield selectWorkspace(location);

      yield put(allWorkspaceActions.setFolderMode(location, !isFolderModeEnabled));
      const warningMessage = `Folder mode ${!isFolderModeEnabled ? 'enabled' : 'disabled'}`;
      yield call(showWarningMessage, warningMessage, 750);
    },
    updateEditorHighlightedLines: function* ({
      payload: {
        payload: { newHighlightedLines }
      }
    }) {
      if (newHighlightedLines.length === 0) {
        yield call(highlightClean);
      } else {
        try {
          for (const [startRow, endRow] of newHighlightedLines) {
            for (let row = startRow; row <= endRow; row++) {
              yield call(highlightLine, row);
            }
          }
        } catch (e) {
          // Error most likely caused by trying to highlight the lines of the prelude
          // in Env Viz. Can be ignored.
        }
      }
    },
    updateEditorHighlightedLinesAgenda: function* ({
      payload: {
        payload: { newHighlightedLines }
      }
    }) {
      if (newHighlightedLines.length === 0) {
        yield call(highlightCleanForAgenda);
      } else {
        try {
          for (const [startRow, endRow] of newHighlightedLines) {
            for (let row = startRow; row <= endRow; row++) {
              yield call(highlightLineForAgenda, row);
            }
          }
        } catch (e) {
          // Error most likely caused by trying to highlight the lines of the prelude
          // in Env Viz. Can be ignored.
        }
      }
    },
    updateEditorValue: function* ({
      payload: {
        location,
        payload: { editorTabIndex, newEditorValue }
      }
    }) {
      const {
        editorState: {
          editorTabs: {
            [editorTabIndex]: { filePath }
          }
        }
      }: WorkspaceState = yield selectWorkspace(location);

      // If the code does not have an associated file, do nothing.
      if (filePath === undefined) {
        return;
      }

      const fileSystem: FSModule | null = yield selectFileSystem();
      // If the file system is not initialised, do nothing.
      if (fileSystem === null) {
        return;
      }

      fileSystem.writeFile(filePath, newEditorValue, err => {
        if (err) {
          console.error(err);
        }
      });
    }
  },
  function* () {
    yield takeEvery(
      allWorkspaceActions.evalTestCase,
      function* ({ payload: { location, payload: index } }) {
        yield put(actions.addEvent([EventType.RUN_TESTCASE]));
        yield* runTestCase(location, index);
      }
    );

    yield takeEvery(
      allWorkspaceActions.evalEditorAndTestcases,
      function* ({ payload: { location } }) {
        yield call(evalEditor, location);

        const { editorTestcases: testcases }: AssessmentWorkspaceState = yield selectWorkspace(
          location
        );

        // Avoid displaying message if there are no testcases
        if (testcases.length > 0) {
          // Display a message to the user
          yield call(showSuccessMessage, `Running all testcases!`, 2000);
          for (const idx of testcases.keys()) {
            // break each testcase up into separate event loop iterations
            // so that the UI updates
            yield new Promise(resolve => setTimeout(resolve, 0));

            const programSucceeded: boolean = yield call(runTestCase, location, idx);
            // Prematurely terminate if execution of the program failed (not the testcase)
            if (!programSucceeded) {
              return;
            }
          }
        }
      }
    );
  }
);

export { WorkspaceSaga as default };

function* clearContext(location: SideContentLocation, code: string) {
  const workspace: WorkspaceState = yield selectWorkspace(location);

  yield put(
    allWorkspaceActions.beginClearContext(
      location,
      workspace.context.chapter,
      workspace.context.variant,
      workspace.globals,
      workspace.context.externalSymbols
    )
  );

  yield take(allWorkspaceActions.endClearContext);
  // defineSymbol(workspace.context, '__PROGRAM__', code);
}

function retrieveFilesInWorkspaceAsRecord(location: SideContentLocation, fileSystem: FSModule) {
  const workspaceBasePath = getWorkspaceBasePath(location);
  const files: Record<string, string> = {};
  const processDirectory = (path: string) =>
    new Promise<void>((resolve, reject) =>
      fileSystem.readdir(path, (err, fileNames) => {
        if (err) {
          reject(err);
          return;
        }

        if (fileNames) {
          Promise.all(
            fileNames.map(fileName => {
              const fullPath = pathlib.join(path, fileName);
              return new Promise<void>((resolve, reject) =>
                fileSystem.lstat(fullPath, (err, stats) => {
                  if (err) {
                    reject(err);
                    return;
                  }

                  if (stats !== undefined) {
                    if (stats.isFile()) {
                      fileSystem.readFile(fullPath, 'utf-8', (err, contents) => {
                        if (err) {
                          reject(err);
                          return;
                        }

                        if (contents === undefined) {
                          // TODO check this
                          reject('some err here');
                          return;
                        }

                        files[fullPath] = contents;
                        resolve();
                      });
                    } else if (stats.isDirectory()) {
                      processDirectory(fullPath).then(resolve).catch(reject);
                    }
                    reject('Should never get here!');
                  } else {
                    resolve();
                  }
                })
              );
            })
          ).then(() => resolve());
        }
      })
    );
  return processDirectory(workspaceBasePath);
}

export function* evalEditor(location: SideContentLocation) {
  const workspace: WorkspaceState = yield selectWorkspace(location);
  const copiedContext = _.cloneDeep(workspace.context)

  const fileSystem: FSModule = yield selectFileSystem();

  const activeEditorTabIndex = workspace.editorState.activeEditorTabIndex;
  if (activeEditorTabIndex === null) {
    throw new Error('Cannot evaluate program without an entrypoint file.');
  }

  const defaultFilePath = `${getWorkspaceBasePath(location)}/program.js`;
  let files: Record<string, string>;
  if (workspace.editorState.isFolderModeEnabled) {
    files = yield call(retrieveFilesInWorkspaceAsRecord, location, fileSystem);
  } else {
    files = {
      [defaultFilePath]: workspace.editorState.editorTabs[activeEditorTabIndex].value
    };
  }

  yield put(actions.addEvent([EventType.RUN_CODE]));

  const entrypointFilePath =
    workspace.editorState.editorTabs[activeEditorTabIndex].filePath ?? defaultFilePath;
  const { remoteExecutionSession }: SessionState = yield selectSession();

  if (remoteExecutionSession && remoteExecutionSession.workspace === location) {
    yield put(actions.remoteExecRun(files, entrypointFilePath));
  } else {
    // End any code that is running right now.
    yield put(allWorkspaceActions.beginInterruptExecution(location));
    const entrypointCode = files[entrypointFilePath];
    yield* clearContext(location, entrypointCode);
    yield put(allWorkspaceActions.clearReplOutput(location));

    // Insert debugger statements at the lines of the program with a breakpoint.
    for (const editorTab of workspace.editorState.editorTabs) {
      const filePath = editorTab.filePath ?? defaultFilePath;
      const code = editorTab.value;
      const breakpoints = editorTab.breakpoints;
      files[filePath] = yield* insertDebuggerStatements(
        location,
        code,
        breakpoints,
        copiedContext,
      );
    }

    // Evaluate the prepend silently with a privileged context, if it exists
    if (workspace.programPrependValue.length) {
      const elevatedContext = makeElevatedContext(copiedContext);
      const prependFilePath = '/prepend.js';
      const prependFiles = {
        [prependFilePath]: workspace.programPrependValue
      };
      yield call(
        evalCode,
        prependFiles,
        prependFilePath,
        elevatedContext,
        workspace.execTime,
        location,
        EVAL_SILENT
      );
      // Block use of methods from privileged context
      yield* blockExtraMethods(elevatedContext, copiedContext, workspace.execTime, location);
    }

    yield call(
      evalCode,
      files,
      entrypointFilePath,
      copiedContext,
      workspace.execTime,
      location,
      allWorkspaceActions.evalEditor.type
    );
  }

}

function* evalWithEnvOrSubst(
  files: Record<string, string>,
  entrypointFilePath: string,
  context: Context,
  location: PlaygroundWorkspaces
) {
  const workspace: PlaygroundWorkspaceState = yield selectWorkspace(location);

  const substActiveAndCorrectChapter =
    workspace.sideContent.selectedTabId === SideContentType.substVisualizer &&
    context.chapter <= Chapter.SOURCE_2;
  const envActiveAndCorrectChapter =
    workspace.sideContent.selectedTabId === SideContentType.envVisualizer &&
    context.chapter >= Chapter.SOURCE_3;

  const result: Result = yield call(runFilesInContext, files, entrypointFilePath, context, {
    executionMethod: envActiveAndCorrectChapter ? 'ec-evaluator' : 'auto',
    envSteps: workspace.envSteps,
    originalMaxExecTime: workspace.execTime,
    stepLimit: workspace.stepLimit,
    throwInfiniteLoops: true,
    useSubst: substActiveAndCorrectChapter
  });

  // The first time the code is executed using the explicit control evaluator,
  // the total number of steps and the breakpoints are updated in the Environment Visualiser slider.
  if (context.executionMethod === 'ec-evaluator' && workspace.updateEnv) {
    yield put(allWorkspaceActions.updateEnvStepsTotal(location, context.runtime.envStepsTotal));
    yield put(allWorkspaceActions.toggleUpdateEnv(location, false));
    yield put(allWorkspaceActions.updateBreakpointSteps(location, context.runtime.breakpointSteps));
  }

  return result;
}

export function* evalCode(
  files: Record<string, string>,
  entrypointFilePath: string,
  context: Context,
  execTime: number,
  location: SideContentLocation,
  actionType: string
): SagaIterator {
  context.runtime.debuggerOn =
    (actionType === allWorkspaceActions.evalEditor.type ||
      actionType === allWorkspaceActions.debugResume.type) &&
    context.chapter > 2;

  function isPlaygroundWorkspace(location: SideContentLocation): location is PlaygroundWorkspaces {
    return location === 'playground' || location === 'sicp' || location.startsWith('stories');
  }

  const workspace: WorkspaceState = yield selectWorkspace(location);

  if (isPlaygroundWorkspace(location)) {
    yield* evalWithEnvOrSubst(files, entrypointFilePath, context, location);
  }

  const isNonDet: boolean = context.variant === Variant.NON_DET;
  const isLazy: boolean = context.variant === Variant.LAZY;
  const isWasm: boolean = context.variant === Variant.WASM;

  // handle env visualizer and subst visualizers
  const substActiveAndCorrectChapter =
    workspace.sideContent.selectedTabId === SideContentType.substVisualizer &&
    context.chapter <= Chapter.SOURCE_2;
  const envActiveAndCorrectChapter =
    workspace.sideContent.selectedTabId === SideContentType.envVisualizer &&
    context.chapter >= Chapter.SOURCE_3;

  let evalCallEffect: CallEffect<Result | Promise<Result>>;
  if (substActiveAndCorrectChapter || envActiveAndCorrectChapter) {
    evalCallEffect = call(
      evalWithEnvOrSubst,
      files,
      entrypointFilePath,
      context,
      // TODO check this!
      location as PlaygroundWorkspaces
    );
  } else if (isNonDet || isLazy || isWasm) {
    evalCallEffect = call_variant(context.variant);
  } else if (actionType === allWorkspaceActions.debugResume.type) {
    evalCallEffect = call(resume, lastDebuggerResult);
  } else {
    evalCallEffect = call(runFilesInContext, files, entrypointFilePath, context, {
      originalMaxExecTime: execTime,
      throwInfiniteLoops: true
    });
  }

  const entrypointCode = files[entrypointFilePath];
  async function wasm_compile_and_run(
    wasmCode: string,
    wasmContext: Context,
    isRepl: boolean
  ): Promise<Result> {
    return Sourceror.compile(wasmCode, wasmContext, isRepl)
      .then((wasmModule: WebAssembly.Module) => {
        const transcoder = new Sourceror.Transcoder();
        return Sourceror.run(
          wasmModule,
          Sourceror.makePlatformImports(makeSourcerorExternalBuiltins(wasmContext), transcoder),
          transcoder,
          wasmContext,
          isRepl
        );
      })
      .then(
        (returnedValue: any): Result => ({ status: 'finished', context, value: returnedValue }),
        (e: any): Result => {
          console.log(e);
          return { status: 'error' };
        }
      );
  }
  function call_variant(variant: Variant) {
    if (variant === Variant.NON_DET) {
      return entrypointCode.trim() === TRY_AGAIN
        ? call(resume, lastNonDetResult)
        : call(runFilesInContext, files, entrypointFilePath, context, {
            executionMethod: 'interpreter',
            originalMaxExecTime: execTime,
            // stepLimit: workspace.stepLimit,
            useSubst: substActiveAndCorrectChapter
            // envSteps: workspace.envSteps
          });
    } else if (variant === Variant.LAZY) {
      return call(runFilesInContext, files, entrypointFilePath, context, {
        scheduler: 'preemptive',
        originalMaxExecTime: execTime,
        // stepLimit: stepLimit,
        useSubst: substActiveAndCorrectChapter
        // envSteps: envSteps
      });
    } else if (variant === Variant.WASM) {
      // Note: WASM does not support multiple file programs.
      return call(
        wasm_compile_and_run,
        entrypointCode,
        context,
        actionType === allWorkspaceActions.evalRepl.type
      );
    } else {
      throw new Error('Unknown variant: ' + variant);
    }
  }

  const { result, interrupted, paused } = yield race({
    result: evalCallEffect,

    /**
     * A BEGIN_INTERRUPT_EXECUTION signals the beginning of an interruption,
     * i.e the trigger for the interpreter to interrupt execution.
     */
    interrupted: take(allWorkspaceActions.beginInterruptExecution),
    paused: take(allWorkspaceActions.beginDebugPause)
  });

  yield put(allWorkspaceActions.updateWorkspace(location, { context }))

  if (interrupted) {
    interrupt(context);
    /* Redundancy, added ensure that interruption results in an error. */
    context.errors.push(new InterruptedError(context.runtime.nodes[0]));
    yield put(allWorkspaceActions.debugReset(location));
    yield put(allWorkspaceActions.endInterruptExecution(location));
    yield call(showWarningMessage, 'Execution aborted', 750);
    return;
  }

  if (paused) {
    yield put(allWorkspaceActions.endDebugPause(location));
    lastDebuggerResult = manualToggleDebugger(context);
    yield call(updateInspector, location);
    yield call(showWarningMessage, 'Execution paused', 750);
    return;
  }

  if (
    result.status !== 'suspended' &&
    result.status !== 'finished' &&
    result.status !== 'suspended-non-det' &&
    result.status !== 'suspended-ec-eval'
  ) {
    yield put(allWorkspaceActions.handleConsoleLog(location, DisplayBufferService.dump()));
    yield put(allWorkspaceActions.evalInterpreterError(location, context.errors));

    // we need to parse again, but preserve the errors in context
    const oldErrors = context.errors;
    context.errors = [];
    // Note: Type checking does not support multiple file programs.
    const parsed = yield call(parse, entrypointCode, context);
    let typeErrors: SourceError[] = [];
    if (parsed) {
      const validatedProgram = yield call(validateAndAnnotate, parsed, context);
      [, typeErrors] = yield call(typeCheck, validatedProgram, context);
    }

    context.errors = oldErrors;
    // for achievement event tracking
    const events = context.errors.length > 0 ? [EventType.ERROR] : [];
    if (typeErrors.length > 0) {
      events.push(EventType.ERROR);
      yield put(
        allWorkspaceActions.sendReplInputToOutput(location, `Hints:\n${parseError(typeErrors)}`)
      );
    }

    yield put(actions.addEvent(events));
    return;
  } else if (result.status === 'suspended' || result.status === 'suspended-ec-eval') {
    yield put(allWorkspaceActions.endDebugPause(location));
    yield put(allWorkspaceActions.evalInterpreterSuccess(location, 'Breakpoint hit!'));
    return;
  } else if (isNonDet) {
    if (result.value === 'cut') {
      result.value = undefined;
    }
    lastNonDetResult = result;
  }

  yield put(allWorkspaceActions.handleConsoleLog(location, DisplayBufferService.dump()));

  // Do not write interpreter output to REPL, if executing chunks (e.g. prepend/postpend blocks)
  if (actionType !== EVAL_SILENT) {
    yield put(allWorkspaceActions.evalInterpreterSuccess(location, result.value));
  }

  if (
    actionType === allWorkspaceActions.evalEditor.type ||
    actionType === allWorkspaceActions.evalRepl.type ||
    actionType === allWorkspaceActions.debugResume.type
  ) {
    if (context.errors.length > 0) {
      yield put(actions.addEvent([EventType.ERROR]));
    }
    yield put(
      allWorkspaceActions.notifyProgramEvaluated(
        location,
        result,
        lastDebuggerResult,
        entrypointCode,
        context
      )
    );
  }

  // we need to stop the intro icon from flashing?
}

export function* evalTestCode(
  code: string,
  context: Context,
  execTime: number,
  location: AssessmentLocations,
  index: number,
  type: TestcaseType
) {
  yield put(allWorkspaceActions.resetTestcase(location, index));
  const { result, interrupted } = yield race({
    result: call(runInContext, code, context, {
      scheduler: 'preemptive',
      originalMaxExecTime: execTime,
      throwInfiniteLoops: true
    }),
    /**
     * A BEGIN_INTERRUPT_EXECUTION signals the beginning of an interruption,
     * i.e the trigger for the interpreter to interrupt execution.
     */
    interrupted: take(allWorkspaceActions.beginInterruptExecution)
  });

  if (interrupted) {
    interrupt(context);
    yield* dumpDisplayBuffer(location);
    // Redundancy, added ensure that interruption results in an error.
    context.errors.push(new InterruptedError(context.runtime.nodes[0]));
    yield put(allWorkspaceActions.endInterruptExecution(location));
    yield call(showWarningMessage, `Execution of testcase ${index} aborted`, 750);
    return;
  }

  yield* dumpDisplayBuffer(location);
  /** result.status here is either 'error' or 'finished'; 'suspended' is not possible
   *  since debugger is presently disabled in assessment and grading environments
   */
  if (result.status === 'error') {
    yield put(allWorkspaceActions.evalInterpreterError(location, context.errors));
    yield put(allWorkspaceActions.evalTestCaseFailure(location, context.errors, index));
  } else if (result.status === 'finished') {
    // Execution of the testcase is successful, i.e. no errors were raised
    yield put(allWorkspaceActions.evalInterpreterSuccess(location, result.value));
    yield put(allWorkspaceActions.evalTestCaseSuccess(location, result.value, index));
  }

  // If a opaque testcase was executed, remove its output from the REPL
  if (type === TestcaseTypes.opaque) {
    yield put(allWorkspaceActions.clearReplOutputLast(location));
  }
}

export function* runTestCase(
  workspaceLocation: AssessmentLocations,
  index: number
): Generator<StrictEffect, boolean, any> {
  /**
   *  Shard a new privileged context elevated to use Source chapter 4 for testcases - enables
   *  grader programs in postpend to run as expected without raising interpreter errors
   *  But, do not persist this context to the workspace state - this prevent students from using
   *  this elevated context to run dis-allowed code beyond the current chapter from the REPL
   */
  const {
    context,
    programPrependValue: prepend,
    programPostpendValue: postpend,
    editorState: {
      editorTabs: [{ value }]
    },
    execTime,
    editorTestcases: { [index]: testcase }
  }: AssessmentWorkspaceState = yield selectWorkspace(workspaceLocation);

  // Do NOT clear the REPL output!
  yield* clearContext(workspaceLocation, value);

  // Execute prepend silently in privileged context
  const elevatedContext = makeElevatedContext(context);
  const prependFilePath = '/prepend.js';
  const prependFiles = {
    [prependFilePath]: prepend
  };
  yield call(
    evalCode,
    prependFiles,
    prependFilePath,
    elevatedContext,
    execTime,
    workspaceLocation,
    EVAL_SILENT
  );

  // Block use of methods from privileged context using a randomly generated blocking key
  // Then execute student program silently in the original workspace context
  const blockKey = String(random(1048576, 68719476736));
  yield* blockExtraMethods(elevatedContext, context, execTime, workspaceLocation, blockKey);
  const valueFilePath = '/value.js';
  const valueFiles = {
    [valueFilePath]: value
  };
  yield call(
    evalCode,
    valueFiles,
    valueFilePath,
    context,
    execTime,
    workspaceLocation,
    EVAL_SILENT
  );

  // Halt execution if the student's code in the editor results in an error
  if (context.errors.length) {
    yield put(allWorkspaceActions.evalTestCaseFailure(workspaceLocation, context.errors, index));
    return false;
  }

  // Execute postpend silently back in privileged context, if it exists
  if (postpend) {
    // TODO: consider doing a swap. If the user has modified any of the variables,
    // i.e. reusing any of the "reserved" names, prevent it from being accessed in the REPL.
    yield* restoreExtraMethods(elevatedContext, context, execTime, workspaceLocation, blockKey);
    const postpendFilePath = '/postpend.js';
    const postpendFiles = {
      [postpendFilePath]: postpend
    };
    yield call(
      evalCode,
      postpendFiles,
      postpendFilePath,
      elevatedContext,
      execTime,
      workspaceLocation,
      EVAL_SILENT
    );
    yield* blockExtraMethods(elevatedContext, context, execTime, workspaceLocation, blockKey);
  }
  // Finally execute the testcase function call in the privileged context
  yield* evalTestCode(
    testcase.program,
    elevatedContext,
    execTime,
    workspaceLocation,
    index,
    testcase.type
  );
  return true;
}
