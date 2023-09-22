import { FSModule } from "browserfs/dist/node/core/FS";
import { Context, interrupt, parseError, Result, resume, runFilesInContext } from "js-slang";
import { defineSymbol } from "js-slang/dist/createContext";
import { InterruptedError } from "js-slang/dist/errors/errors";
import { parse } from "js-slang/dist/parser/parser";
import { typeCheck } from "js-slang/dist/typeChecker/typeChecker";
import { Chapter, SourceError, Variant } from "js-slang/dist/types";
import { validateAndAnnotate } from "js-slang/dist/validator/validator";
import { posix as pathlib } from 'path';
import { SagaIterator } from "redux-saga";
import { call, put, race, select, StrictEffect, take } from "redux-saga/effects";
import * as Sourceror from 'sourceror';
import { defaultEditorValue,isSourceLanguage,OverallState } from "src/commons/application/ApplicationTypes";
import { writeFileRecursively } from "src/commons/fileSystem/utils";
import { SideContentType } from "src/commons/sideContent/SideContentTypes";
import { actions } from "src/commons/utils/ActionsHelper";
import DisplayBufferService from "src/commons/utils/DisplayBufferService";
import { getBlockExtraMethodsString, getDifferenceInMethods, getStoreExtraMethodsString, makeElevatedContext, visualizeEnv } from "src/commons/utils/JsSlangHelper";
import { showWarningMessage } from "src/commons/utils/notifications/NotificationsHelper";
import { makeExternalBuiltins as makeSourcerorExternalBuiltins } from "src/commons/utils/SourcerorHelper";
import { EditorTabState,EVAL_SILENT } from "src/commons/workspace/WorkspaceTypes";
import { EventType } from "src/features/achievement/AchievementTypes";
import { DeviceSession } from "src/features/remoteExecution/RemoteExecutionTypes";
import { getWorkspaceBasePath, WORKSPACE_BASE_PATHS } from "src/pages/fileSystem/createInBrowserFileSystem";

import { allWorkspaceActions } from "./AllWorkspacesRedux";
import { PlaygroundWorkspaces,PlaygroundWorkspaceState } from "./playground/PlaygroundBase";
import { SideContentLocation } from "./subReducers/SideContentRedux";
import { getWorkspaceSelector,WorkspaceState } from "./WorkspaceRedux";

function* updateInspector(workspaceLocation: SideContentLocation): SagaIterator {
  const workspaceSelector = getWorkspaceSelector(workspaceLocation)
  const workspace: WorkspaceState = yield select((state: OverallState) => workspaceSelector(state.workspaces))
  const activeEditorTabIndex = workspace.editorState.activeEditorTabIndex!

  try {
    const row = lastDebuggerResult.context.runtime.nodes[0].loc.start.line - 1;
    // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.

    yield put(allWorkspaceActions.updateEditorHighlightedLines(workspaceLocation, activeEditorTabIndex, []));
    // We highlight only one row to show the current line
    // If we highlight from start to end, the whole program block will be highlighted at the start
    // since the first node is the program node
    yield put(allWorkspaceActions.updateEditorHighlightedLines(workspaceLocation, activeEditorTabIndex, [[row, row]]));
    yield call(visualizeEnv, lastDebuggerResult)
    // visualizeEnv(lastDebuggerResult);
  } catch (e) {
    // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
    yield put(allWorkspaceActions.updateEditorHighlightedLines(workspaceLocation, activeEditorTabIndex, []));
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

export default function* WorkspaceSaga(): SagaIterator {
   yield saferTakeEvery(allWorkspaceActions.toggleFolderMode, function* ({ payload: { location }}) {
    const selector = getWorkspaceSelector(location)
    const isFolderModeEnabled: boolean = yield select((state: OverallState) => selector(state.workspaces))

    yield put(allWorkspaceActions.setFolderMode(location, !isFolderModeEnabled));
    const warningMessage = `Folder mode ${!isFolderModeEnabled ? 'enabled' : 'disabled'}`;
    yield call(showWarningMessage, warningMessage, 750);
  })

  yield saferTakeEvery(allWorkspaceActions.setFolderMode, function* ({ payload: { location }}) {
    const workspaceSelector = getWorkspaceSelector(location)
    const isFolderModeEnabled: boolean = yield select(
      (state: OverallState) => workspaceSelector(state.workspaces).isFolderModeEnabled
    );
    // Do nothing if Folder mode is enabled.
    if (isFolderModeEnabled) {
      return;
    }

    const editorTabs: EditorTabState[] = yield select(
      (state: OverallState) => workspaceSelector(state.workspaces).editorState.editorTabs
    );
    // If Folder mode is disabled and there are no open editor tabs, add an editor tab.
    if (editorTabs.length === 0) {
      const defaultFilePath = `${WORKSPACE_BASE_PATHS[location]}/program.js`;
      const fileSystem: FSModule | null = yield select(
        (state: OverallState) => state.fileSystem.inBrowserFileSystem
      );
      // If the file system is not initialised, add an editor tab with the default editor value.
      if (fileSystem === null) {
        yield put(allWorkspaceActions.addEditorTab(location, defaultFilePath, defaultEditorValue));
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
  })

  // Mirror editor updates to the associated file in the filesystem.
  yield saferTakeEvery(allWorkspaceActions.updateEditorValue, function* ({ payload: { location, payload: { 
    editorTabIndex, newEditorValue } }}) {
    const workspaceSelector = getWorkspaceSelector(location)

    const filePath: string | undefined = yield select(
      (state: OverallState) =>
        workspaceSelector(state.workspaces).editorState.editorTabs[editorTabIndex].filePath
    );
    // If the code does not have an associated file, do nothing.
    if (filePath === undefined) {
      return;
    }

    const fileSystem: FSModule | null = yield select(
      (state: OverallState) => state.fileSystem.inBrowserFileSystem
    );
    // If the file system is not initialised, do nothing.
    if (fileSystem === null) {
      return;
    }

    fileSystem.writeFile(filePath, newEditorValue, err => {
      if (err) {
        console.error(err);
      }
    });
  })
}

function* clearContext(location: SideContentLocation, code: string) {
  const workspaceSelector = getWorkspaceSelector(location)
  const workspace: WorkspaceState = yield select((state: OverallState) => workspaceSelector(state.workspaces))

  yield put(allWorkspaceActions.beginClearContext(location,
    workspace.context.chapter,
    workspace.context.variant,
    workspace.globals,
    workspace.context.externalSymbols
  ))

  yield take(allWorkspaceActions.endClearContext)
  defineSymbol(workspace.context, '__PROGRAM__', code)
}

function retrieveFilesInWorkspaceAsRecord(
  location: SideContentLocation,
  fileSystem: FSModule
) {
  const workspaceBasePath = getWorkspaceBasePath(location)
  const files: Record<string, string> = {}
  const processDirectory = (path: string) => new Promise<void>((resolve, reject) => fileSystem.readdir(path, (err, fileNames) => {
    if (err) {
      reject(err)
      return
    }

    if (fileNames) {
      Promise.all(fileNames.map(fileName => {
        const fullPath = pathlib.join(path, fileName)
        return new Promise<void>((resolve, reject) => fileSystem.lstat(fullPath, (err, stats) => {
          if (err) {
            reject(err)
            return
          }

          if (stats !== undefined) {
            if (stats.isFile()) {
              fileSystem.readFile(fullPath, 'utf-8', (err, contents) => {
                if (err) {
                  reject(err)
                  return
                }

                if (contents === undefined) {
                  // TODO check this
                  reject('some err here')
                  return
                }

                files[fullPath] = contents
                resolve()
              })
            } else if (stats.isDirectory()) {
              processDirectory(fullPath)
                .then(resolve)
                .catch(reject)
            }
            reject('Should never get here!')
          } else {
            resolve()
          }
        }))
      }
    )).then(() => resolve())
    }
  }))
  return processDirectory(workspaceBasePath)
}

export function* evalEditor(
  location: SideContentLocation
) {
  const workspaceSelector = getWorkspaceSelector(location)
  const workspace: WorkspaceState = yield select((state: OverallState) => workspaceSelector(state.workspaces))
  const fileSystem: FSModule = yield select((state: OverallState) => state.fileSystem.inBrowserFileSystem)

  const activeEditorTabIndex = workspace.editorState.activeEditorTabIndex
  if (activeEditorTabIndex === null) {
    throw new Error('Cannot evaluate program without an entrypoint file.');
  }

  const defaultFilePath = `${getWorkspaceBasePath(location)}/program.js`
  let files: Record<string, string>;
  if (workspace.isFolderModeEnabled) {
    files = yield call(retrieveFilesInWorkspaceAsRecord, location, fileSystem);
  } else {
    files = {
      [defaultFilePath]: workspace.editorState.editorTabs[activeEditorTabIndex].value
    };
  }

  yield put(actions.addEvent([EventType.RUN_CODE]))

  const entrypointFilePath = workspace.editorState.editorTabs[activeEditorTabIndex].filePath ?? defaultFilePath;
  const remoteExecutionSession: DeviceSession | undefined = yield select((state: OverallState) => state.session.remoteExecutionSession)

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
        workspace.context
      );
    }

    // Evaluate the prepend silently with a privileged context, if it exists
    if (workspace.programPrependValue.length) {
      const elevatedContext = makeElevatedContext(workspace.context);
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
      yield* blockExtraMethods(elevatedContext, workspace.context, workspace.execTime, location);
    }

    yield call(
      evalCode,
      files,
      entrypointFilePath,
      workspace.context,
      workspace.execTime,
      location,
      allWorkspaceActions.evalEditor.type,
    );
  }
}

function* evalWithEnvOrSubst(
  files: Record<string, string>,
  entrypointFilePath: string,
  context: Context,
  location: PlaygroundWorkspaces
) {
  const workspaceSelector = getWorkspaceSelector(location)
  const workspace: PlaygroundWorkspaceState = yield select((state: OverallState) => workspaceSelector(state.workspaces))

  const substActiveAndCorrectChapter = workspace.sideContent.selectedTabId === SideContentType.substVisualizer && context.chapter <= Chapter.SOURCE_2
  const envActiveAndCorrectChapter = workspace.sideContent.selectedTabId === SideContentType.envVisualizer && context.chapter >= Chapter.SOURCE_3

  yield call(
    runFilesInContext,
    files,
    entrypointFilePath,
    context,
    {
      executionMethod: envActiveAndCorrectChapter ? 'ec-evaluator' : 'auto',
      envSteps: workspace.envSteps,
      originalMaxExecTime: workspace.execTime,
      stepLimit: workspace.stepLimit,
      throwInfiniteLoops: true,
      useSubst: substActiveAndCorrectChapter,
    }
  )
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
    (actionType === allWorkspaceActions.evalEditor.type || actionType === allWorkspaceActions.debugResume.type) && context.chapter > 2; 

  function isPlaygroundWorkspace(location: SideContentLocation): location is PlaygroundWorkspaces {
    return location === 'playground' || location === 'sicp' || location.startsWith('stories')
  }

  const workspaceSelector = getWorkspaceSelector(location)
  const workspace: WorkspaceState = yield select((state: OverallState) => workspaceSelector(state.workspaces))

  if (isPlaygroundWorkspace(location)) {
    yield* evalWithEnvOrSubst(files, entrypointFilePath, context, location)
  }

  const isNonDet: boolean = context.variant === Variant.NON_DET;
  const isLazy: boolean = context.variant === Variant.LAZY;
  const isWasm: boolean = context.variant === Variant.WASM;


  // handle env visualizer and subst visualizers
  const substActiveAndCorrectChapter = workspace.sideContent.selectedTabId === SideContentType.substVisualizer && context.chapter <= Chapter.SOURCE_2
  const envActiveAndCorrectChapter = workspace.sideContent.selectedTabId === SideContentType.envVisualizer && context.chapter >= Chapter.SOURCE_3

  const entrypointCode = files[entrypointFilePath]
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
            stepLimit: workspace.stepLimit,
            useSubst: substActiveAndCorrectChapter,
            envSteps: workspace.envSteps
          });
    } else if (variant === Variant.LAZY) {
      return call(runFilesInContext, files, entrypointFilePath, context, {
        scheduler: 'preemptive',
        originalMaxExecTime: execTime,
        stepLimit: stepLimit,
        useSubst: substActiveAndCorrectChapter,
        envSteps: envSteps
      });
    } else if (variant === Variant.WASM) {
      // Note: WASM does not support multiple file programs.
      return call(wasm_compile_and_run, entrypointCode, context, actionType === EVAL_REPL);
    } else {
      throw new Error('Unknown variant: ' + variant);
    }
  }


  const { result, interrupted, paused } = yield race({
    result:
      actionType === allWorkspaceActions.debugResume.type
        ? call(resume, lastDebuggerResult)
        : isNonDet || isLazy || isWasm
        ? call_variant(context.variant)
        : call(runFilesInContext, files, entrypointFilePath, context, {
            scheduler: 'preemptive',
            originalMaxExecTime: execTime,
            stepLimit: stepLimit,
            throwInfiniteLoops: true,
            useSubst: substActiveAndCorrectChapter,
            envSteps: envSteps
          }),

    /**
     * A BEGIN_INTERRUPT_EXECUTION signals the beginning of an interruption,
     * i.e the trigger for the interpreter to interrupt execution.
     */
    interrupted: take(allWorkspaceActions.beginInterruptExecution),
    paused: take(allWorkspaceActions.beginDebugPause)
  })

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
    yield put(allWorkspaceActions.handleConsoleLog(location, DisplayBufferService.dump()))
    yield put(allWorkspaceActions.evalInterpreterError(location, context.errors))

    // we need to parse again, but preserve the errors in context
    const oldErrors = context.errors;
    context.errors = [];
    // Note: Type checking does not support multiple file programs.
    const parsed = yield call(parse, entrypointCode, context)
    let typeErrors: SourceError[] = []
    if (parsed) {
      const validatedProgram = yield call(validateAndAnnotate, parsed, context)
      ;([, typeErrors] = yield call(typeCheck, validatedProgram, context))
    }

    context.errors = oldErrors;
    // for achievement event tracking
    const events = context.errors.length > 0 ? [EventType.ERROR] : [];
    if (typeErrors.length > 0) {
      events.push(EventType.ERROR)
      yield put(allWorkspaceActions.sendReplInputToOutput(location, `Hints:\n${parseError(typeErrors)}`))
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

  yield put(allWorkspaceActions.handleConsoleLog(location, DisplayBufferService.dump()))

  // Do not write interpreter output to REPL, if executing chunks (e.g. prepend/postpend blocks)
  if (actionType !== EVAL_SILENT) {
    yield put(allWorkspaceActions.evalInterpreterSuccess(location, result.value))
  }

  if (
    actionType === allWorkspaceActions.evalEditor.type ||
    actionType === allWorkspaceActions.evalRepl.type ||
    actionType === allWorkspaceActions.debugResume.type
  ) {
    if (context.errors.length > 0) {
      yield put(actions.addEvent([EventType.ERROR]))
    }
    yield put(allWorkspaceActions.notifyProgramEvaluated(
      location,
      result,
      lastDebuggerResult,
      entrypointCode,
      context
    ))
  }

  // The first time the code is executed using the explicit control evaluator,
  // the total number of steps and the breakpoints are updated in the Environment Visualiser slider.
  if (context.executionMethod === 'ec-evaluator' && needUpdateEnv) {
    yield put(allWorkspaceActions.updateEnvStepsTotal(location, context.runtime.envStepsTotal));
    yield put(allWorkspaceActions.toggleUpdateEnv(location, false));
    yield put(allWorkspaceActions.updateBreakpointSteps(location, context.runtime.breakpointSteps));
  }

  // we need to stop the intro icon from flashing?
}
