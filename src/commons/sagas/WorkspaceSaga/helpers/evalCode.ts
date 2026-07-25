import { compileAndRun as compileAndRunCCode } from '@sourceacademy/c-slang/ctowasm/dist/index';
import type { IConduit } from '@sourceacademy/conductor/conduit';
import { RunnerStatus } from '@sourceacademy/conductor/types';
import type { IEvaluatorDefinition } from '@sourceacademy/language-directory/dist/types';
import { tokenizer } from 'acorn';
import { type Context, interrupt, type Result, resume, runFilesInContext } from 'js-slang';
import { ACORN_PARSE_OPTIONS } from 'js-slang/dist/constants';
import { ErrorSeverity, ErrorType, type SourceError } from 'js-slang/dist/errors/base';
import { InterruptedError } from 'js-slang/dist/errors/errors';
import { Chapter, Variant } from 'js-slang/dist/langs';
import { pick } from 'lodash-es';
import { END, eventChannel, type SagaIterator } from 'redux-saga';
import { call, cancel, cancelled, fork, put, race, select, spawn, take } from 'redux-saga/effects';
import * as Sourceror from 'sourceror';

import InterpreterActions from '../../../../commons/application/actions/InterpreterActions';
import { makeCCompilerConfig, specialCReturnObject } from '../../../../commons/utils/CToWasmHelper';
import { javaRun } from '../../../../commons/utils/JavaHelper';
import { EventType } from '../../../../features/achievement/AchievementTypes';
import type { BrowserHostPlugin } from '../../../../features/conductor/BrowserHostPlugin';
import type {
  CseMachineHostPlugin,
  CseSnapshot,
} from '../../../../features/conductor/CseMachineHostPlugin';
import { selectConductorEnable } from '../../../../features/conductor/flagConductorEnable';
import { CONDUCTOR_STEPPER_TAB_ID } from '../../../../features/conductor/stepperTab';
import LanguageDirectoryActions from '../../../../features/directory/LanguageDirectoryActions';
import { type OverallState } from '../../../application/ApplicationTypes';
import { visitSideContent } from '../../../sideContent/SideContentActions';
import { getTabId } from '../../../sideContent/SideContentHelper';
import sideContentManager from '../../../sideContent/SideContentManager';
import { type SideContentTabId, SideContentType } from '../../../sideContent/SideContentTypes';
import { actions } from '../../../utils/ActionsHelper';
import { closeDialog, showSimplePromptDialog } from '../../../utils/DialogHelper';
import DisplayBufferService from '../../../utils/DisplayBufferService';
import { showWarningMessage } from '../../../utils/notifications/NotificationsHelper';
import { makeExternalBuiltins as makeSourcerorExternalBuiltins } from '../../../utils/SourcerorHelper';
import WorkspaceActions from '../../../workspace/WorkspaceActions';
import {
  EVAL_SILENT,
  type WorkspaceLocation,
  type WorkspaceLocationsWithTools,
} from '../../../workspace/WorkspaceTypes';
import {
  getPreparedConductorSaga,
  preloadConductorEvaluatorSaga,
} from '../../helpers/conductorEvaluatorCache';
import { getEvaluatorDefinitionSaga } from '../../LanguageDirectorySaga';
import { selectWorkspace } from '../../SafeEffects';
import { dumpDisplayBuffer } from './dumpDisplayBuffer';
import { updateInspector } from './updateInspector';

function toConductorSourceError(error: unknown): SourceError {
  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message?: unknown }).message)
      : String(error);
  return {
    type: ErrorType.RUNTIME,
    severity: ErrorSeverity.ERROR,
    location: {
      start: {
        line: 0,
        column: 0,
      },
      end: {
        line: 0,
        column: 0,
      },
    },
    explain: () => message,
    elaborate: () => '',
  };
}

async function wasm_compile_and_run(
  wasmCode: string,
  context: Context,
  isRepl: boolean,
): Promise<Result> {
  try {
    const wasmModule = await Sourceror.compile(wasmCode, context, isRepl);
    const transcoder = new Sourceror.Transcoder();
    const returnedValue = await Sourceror.run(
      wasmModule,
      Sourceror.makePlatformImports(makeSourcerorExternalBuiltins(context), transcoder),
      transcoder,
      context,
      isRepl,
    );
    return { status: 'finished', context, value: returnedValue };
  } catch (e) {
    console.log(e);
    return { status: 'error', context };
  }
}

async function cCompileAndRun(cCode: string, context: Context): Promise<Result> {
  function reportCCompilationError(errorMessage: string, context: Context) {
    context.errors.push({
      type: ErrorType.SYNTAX,
      severity: ErrorSeverity.ERROR,
      location: {
        start: {
          line: 0,
          column: 0,
        },
        end: {
          line: 0,
          column: 0,
        },
      },
      explain: () => errorMessage,
      elaborate: () => '',
    });
  }

  function reportCRuntimeError(errorMessage: string, context: Context) {
    context.errors.push({
      type: ErrorType.RUNTIME,
      severity: ErrorSeverity.ERROR,
      location: {
        start: {
          line: 0,
          column: 0,
        },
        end: {
          line: 0,
          column: 0,
        },
      },
      explain: () => errorMessage,
      elaborate: () => '',
    });
  }
  const cCompilerConfig = await makeCCompilerConfig(cCode, context);
  try {
    const compilationResult = await compileAndRunCCode(cCode, cCompilerConfig);
    if (compilationResult.status === 'failure') {
      // report any compilation failure
      reportCCompilationError(
        `Compilation failed with the following error(s):\n\n${compilationResult.errorMessage}`,
        context,
      );
      return {
        status: 'error',
        context,
      } as Result;
    }
    if (compilationResult.warnings.length > 0) {
      return {
        status: 'finished',
        context,
        value: {
          toReplString: () =>
            `Compilation and program execution successful with the following warning(s):\n${compilationResult.warnings.join(
              '\n',
            )}`,
        },
      };
    }
    if (specialCReturnObject === null) {
      return {
        status: 'finished',
        context,
        value: { toReplString: () => 'Compilation and program execution successful.' },
      };
    }
    return { status: 'finished', context, value: specialCReturnObject };
  } catch (e) {
    console.log(e);
    reportCRuntimeError(e.message, context);
    return { status: 'error', context };
  }
}

export function* evalCodeSaga(
  files: Record<string, string>,
  entrypointFilePath: string,
  context: Context,
  execTime: number,
  actionType: string,
  workspaceLocation: WorkspaceLocation,
): SagaIterator {
  if (yield select(selectConductorEnable)) {
    return yield call(
      evalCodeConductorSaga,
      files,
      entrypointFilePath,
      context,
      workspaceLocation,
      actionType,
    );
  }
  context.runtime.debuggerOn =
    (actionType === WorkspaceActions.evalEditor.type ||
      actionType === InterpreterActions.debuggerResume.type) &&
    context.chapter > 2;

  function* getWorkspaceData() {
    const workspace = yield* selectWorkspace(workspaceLocation);
    const commons = pick(workspace, ['isFolderModeEnabled', 'stepLimit']);

    if (workspaceLocation === 'sicp' || workspaceLocation === 'playground') {
      const { currentStep, updateCse, usingCse, usingSubst } =
        yield* selectWorkspace(workspaceLocation);

      return {
        ...commons,
        currentStep: updateCse ? -1 : currentStep,
        cseIsActive: usingCse,
        needUpdateCse: updateCse,
        substIsActive: usingSubst,
      };
    }

    return {
      ...commons,
      currentStep: -1,
      cseIsActive: false,
      needUpdateCse: false,
      substIsActive: false,
    };
  }

  const entrypointCode = files[entrypointFilePath];
  // Logic for execution of substitution model visualizer
  const { currentStep, cseIsActive, isFolderModeEnabled, needUpdateCse, stepLimit, substIsActive } =
    yield* getWorkspaceData();

  const cseActiveAndCorrectChapter = context.chapter >= Chapter.SOURCE_3 && cseIsActive;
  if (cseActiveAndCorrectChapter) {
    context.executionMethod = 'cse-machine';
  }

  function* getEvalEffect() {
    if (actionType === InterpreterActions.debuggerResume.type) {
      const { lastDebuggerResult } = yield* selectWorkspace(workspaceLocation);
      return call(resume, lastDebuggerResult);
    }

    if (context.variant === Variant.WASM) {
      // Note: WASM does not support multiple file programs.
      return call(
        wasm_compile_and_run,
        entrypointCode,
        context,
        actionType === WorkspaceActions.evalRepl.type,
      );
    }

    switch (context.chapter) {
      case Chapter.FULL_C:
        return call(cCompileAndRun, entrypointCode, context);
      case Chapter.FULL_JAVA: {
        const {
          usingCse: isUsingCse,
          usingUpload: uploadIsActive,
          files: uploads,
        } = yield* selectWorkspace('playground');

        return call(javaRun, entrypointCode, context, currentStep, isUsingCse, {
          uploadIsActive,
          uploads,
        });
      }
    }

    const substActiveAndCorrectChapter =
      actionType !== WorkspaceActions.evalRepl.type &&
      context.chapter <= Chapter.SOURCE_2 &&
      substIsActive;

    return call(
      runFilesInContext,
      isFolderModeEnabled
        ? files
        : {
            [entrypointFilePath]: files[entrypointFilePath],
          },
      entrypointFilePath,
      context,
      {
        originalMaxExecTime: execTime,
        stepLimit: stepLimit,
        throwInfiniteLoops: true,
        useSubst: substActiveAndCorrectChapter,
        envSteps: currentStep,
        executionMethod: cseActiveAndCorrectChapter ? 'cse-machine' : 'auto',
      },
    );
  }

  // Handles `console.log` statements in fullJS
  if (context.chapter === Chapter.FULL_JS || context.chapter === Chapter.FULL_TS) {
    yield call([DisplayBufferService, DisplayBufferService.attachConsole], workspaceLocation);
  }

  const {
    result,
    interrupted,
    paused,
  }: {
    result: Result;
    interrupted: any;
    paused: any;
  } = yield race({
    result: yield* getEvalEffect(),
    /**
     * A BEGIN_INTERRUPT_EXECUTION signals the beginning of an interruption,
     * i.e the trigger for the interpreter to interrupt execution.
     */
    interrupted: take(InterpreterActions.beginInterruptExecution.type),
    paused: take(InterpreterActions.beginDebuggerPause.type),
  });

  if (interrupted) {
    interrupt(context);
    /* Redundancy, added ensure that interruption results in an error. */
    context.errors.push(new InterruptedError(context.runtime.nodes[0]));
    yield put(actions.debuggerReset(workspaceLocation));
    yield put(actions.endInterruptExecution(workspaceLocation));
    yield call(showWarningMessage, 'Execution aborted', 750);
    return;
  }
  if (paused) {
    yield put(actions.endDebuggerPause(workspaceLocation));
    // yield put(actions.updateLastDebuggerResult(manualToggleDebugger(context), workspaceLocation));
    yield call(updateInspector, workspaceLocation);
    yield call(showWarningMessage, 'Execution paused', 750);
    return;
  }

  if (actionType === WorkspaceActions.evalEditor.type) {
    yield put(actions.updateLastDebuggerResult(result, workspaceLocation));
  }

  yield call(updateInspector, workspaceLocation);

  if (result.status === 'suspended-cse-eval') {
    yield put(actions.endDebuggerPause(workspaceLocation));
    yield put(actions.evalInterpreterSuccess('Breakpoint hit!', workspaceLocation));
    return;
  } else if (result.status !== 'finished') {
    yield* dumpDisplayBuffer(workspaceLocation);
    if (workspaceLocation === 'sicp' || workspaceLocation === 'playground') {
      const workspace = yield* selectWorkspace(workspaceLocation);
      if (workspace.usingSubst || workspace.usingCse) {
        yield put(visitSideContent(SideContentType.introduction, undefined, workspaceLocation));
      }
    }
    const specialError = checkSpecialError(context.errors);
    if (specialError !== null) {
      switch (specialError) {
        case 'source_academy_interrupt': {
          yield* handleSourceAcademyInterrupt(context, entrypointCode, workspaceLocation);
          break;
        }
        // This should not happen but we check just in case
        default: {
          yield put(actions.evalInterpreterError(context.errors, workspaceLocation));
        }
      }
    } else {
      yield put(actions.evalInterpreterError(context.errors, workspaceLocation));
      // enable the CSE machine visualizer during errors
      if (context.executionMethod === 'cse-machine' && needUpdateCse) {
        yield put(actions.updateStepsTotal(context.runtime.envStepsTotal + 1, workspaceLocation));
        yield put(actions.toggleUpdateCse(false, workspaceLocation as WorkspaceLocationsWithTools));
        yield put(
          actions.updateBreakpointSteps(context.runtime.breakpointSteps, workspaceLocation),
        );
        yield put(
          actions.updateChangePointSteps(context.runtime.changepointSteps, workspaceLocation),
        );
      }
    }

    const events = context.errors.length > 0 ? [EventType.ERROR] : [];

    yield put(actions.addEvent(events));
    return;
  }

  yield* dumpDisplayBuffer(workspaceLocation);

  // Change token count if its assessment and EVAL_EDITOR
  if (actionType === WorkspaceActions.evalEditor.type && workspaceLocation === 'assessment') {
    const tokens = [...tokenizer(entrypointCode, ACORN_PARSE_OPTIONS)];
    const tokenCounter = tokens.length;
    yield put(actions.setTokenCount(workspaceLocation, tokenCounter));
  }

  // Do not write interpreter output to REPL, if executing chunks (e.g. prepend/postpend blocks)
  if (actionType !== EVAL_SILENT) {
    yield put(actions.evalInterpreterSuccess(result.value, workspaceLocation));
  }

  const lastDebuggerResult = yield select(
    (state: OverallState) => state.workspaces[workspaceLocation].lastDebuggerResult,
  );
  // For EVAL_EDITOR and EVAL_REPL, we send notification to workspace that a program has been evaluated
  if (
    actionType === WorkspaceActions.evalEditor.type ||
    actionType === WorkspaceActions.evalRepl.type ||
    actionType === InterpreterActions.debuggerResume.type
  ) {
    if (context.errors.length > 0) {
      yield put(actions.addEvent([EventType.ERROR]));
    }
    yield put(
      WorkspaceActions.notifyProgramEvaluated(
        result,
        lastDebuggerResult,
        entrypointCode,
        context,
        workspaceLocation,
      ),
    );
  }

  // The first time the code is executed using the explicit control evaluator,
  // the total number of steps and the breakpoints are updated in the CSE Machine slider.
  if (context.executionMethod === 'cse-machine' && needUpdateCse) {
    yield put(actions.updateStepsTotal(context.runtime.envStepsTotal, workspaceLocation));
    // `needUpdateCse` implies `correctWorkspace`, which satisfies the type constraint.
    // But TS can't infer that yet, so we need a typecast here.
    yield put(actions.toggleUpdateCse(false, workspaceLocation as WorkspaceLocationsWithTools));
    yield put(actions.updateBreakpointSteps(context.runtime.breakpointSteps, workspaceLocation));
    yield put(actions.updateChangePointSteps(context.runtime.changepointSteps, workspaceLocation));
  }
  // Stop the home icon from flashing for an error if it is doing so since the evaluation is successful
  if (context.executionMethod === 'cse-machine') {
    yield put(actions.removeSideContentAlert(SideContentType.introduction, workspaceLocation));
  }
}

/**
 * Shared, mutable count of sendOutput/sendResult/sendError messages actually received so far in
 * the current run — incremented by handleStdout/handleResults/handleErrors as each one arrives,
 * and compared by handleStatuses against a terminal status's own sentCount (see IStatusMessage)
 * to wait for genuine delivery instead of guessing with a fixed delay.
 */
type ReceivedCount = { count: number };

function* handleStdout(
  hostPlugin: BrowserHostPlugin,
  workspaceLocation: WorkspaceLocation,
  receivedCount: ReceivedCount,
): SagaIterator {
  const outputChan = eventChannel(emitter => {
    hostPlugin.receiveOutput = emitter;
    return () => {
      if (hostPlugin.receiveOutput === emitter) {
        delete hostPlugin.receiveOutput;
      }
    };
  });
  try {
    while (true) {
      const output = yield take(outputChan);
      receivedCount.count++;
      yield put(actions.handleConsoleLog(workspaceLocation, output));
    }
  } finally {
    if (yield cancelled()) {
      outputChan.close();
    }
  }
}

/**
 * Listens for the runner requesting standard-input (e.g. Python's `input(...)`), shows a
 * blocking popup asking the user for a string, and sends the answer back via `hostPlugin.sendInput`.
 * Runs for the lifetime of the evaluation so a program may call `input()` any number of times.
 */
function* handleInputRequest(
  hostPlugin: BrowserHostPlugin,
  workspaceLocation: WorkspaceLocation,
): SagaIterator {
  const inputRequestChan = eventChannel<string>(emitter => {
    hostPlugin.receiveInputRequest = emitter;
    return () => {
      if (hostPlugin.receiveInputRequest === emitter) {
        delete hostPlugin.receiveInputRequest;
      }
    };
  });
  try {
    while (true) {
      const prompt: string = yield take(inputRequestChan);
      yield put(actions.setIsWaitingForInput(true, workspaceLocation));
      try {
        const response: { buttonResponse: boolean; value: string } = yield call(
          showSimplePromptDialog,
          {
            title: 'Program is requesting input',
            contents: prompt || undefined,
            positiveLabel: 'Submit',
          },
        );
        hostPlugin.sendInput(response.buttonResponse ? response.value : '');
      } catch {
        // showSimplePromptDialog's underlying promise rejects if the dialog is dismissed via its
        // onClose path (e.g. clicking outside) rather than a button response. Without this catch,
        // that rejection would escape the while(true) loop and kill this saga permanently, leaving
        // the runner blocked forever with no way to answer any future input() call either.
        hostPlugin.sendInput('');
      } finally {
        yield put(actions.setIsWaitingForInput(false, workspaceLocation));
      }
    }
  } finally {
    if (yield cancelled()) {
      inputRequestChan.close();
      closeDialog();
    }
  }
}

function* handleResults(
  hostPlugin: BrowserHostPlugin,
  workspaceLocation: WorkspaceLocation,
  receivedCount: ReceivedCount,
): SagaIterator {
  const resultChan = eventChannel(emitter => {
    const onReceiveResult = (result: any) => emitter({ value: result });
    hostPlugin.receiveResult = onReceiveResult;
    return () => {
      if (hostPlugin.receiveResult === onReceiveResult) {
        delete hostPlugin.receiveResult;
      }
    };
  });
  try {
    while (true) {
      const { value: result } = yield take(resultChan);
      receivedCount.count++;
      if (result !== undefined) {
        yield put(actions.appendInterpreterResult(result, workspaceLocation));
      }
      // Completion is signalled by a genuine terminal STATUS (handleStatuses), not by RESULT:
      // an evaluator may still have pending async work after sending its result (e.g. Python's
      // set_timeout — see BasicEvaluator's beginPendingWork/endPendingWork), so treating RESULT
      // itself as "done" would tear the runner down before that work has a chance to run.
    }
  } finally {
    if (yield cancelled()) {
      resultChan.close();
    }
  }
}

/**
 * Surfaces a conductor evaluation error: appends it to the REPL and, when the (REPL-hiding) conductor
 * Stepper or CSE Machine tab is active, or any other tab a module dynamically registered (e.g. sound's
 * tab), switches to the Introduction tab so the error is visible rather than failing silently — the
 * conductor analogue of the legacy `usingSubst`/`usingCse` path.
 *
 * `interrupt` (default true) additionally unblocks the run loop right away — appropriate when there is
 * no runner left to send a terminal status at all (a rejected startEvaluator, or a setup failure before
 * one even exists). A genuine `sendError` from a still-running evaluator (handleErrors' normal path)
 * passes `interrupt: false`: the runner is expected to still send its own terminal STOPPED/ERROR once
 * any pending work (e.g. Python's set_timeout) settles, and handleStatuses drives the interrupt then.
 */
function* surfaceConductorError(
  error: unknown,
  workspaceLocation: WorkspaceLocation,
  interrupt: boolean = true,
): SagaIterator {
  yield put(actions.appendInterpreterError([toConductorSourceError(error)], workspaceLocation));
  const selectedTab: SideContentTabId | undefined = yield select(
    (state: OverallState) => state.sideContent[workspaceLocation]?.selectedTab,
  );
  const isModuleTabSelected = sideContentManager
    .getTabs(workspaceLocation)
    .some(tab => getTabId(tab) === selectedTab);
  if (
    selectedTab === CONDUCTOR_STEPPER_TAB_ID ||
    selectedTab === SideContentType.cseMachine ||
    isModuleTabSelected
  ) {
    yield put(visitSideContent(SideContentType.introduction, selectedTab, workspaceLocation));
  }
  if (interrupt) {
    yield put(actions.beginInterruptExecution(workspaceLocation));
  }
}

function* handleErrors(
  hostPlugin: BrowserHostPlugin,
  workspaceLocation: WorkspaceLocation,
  receivedCount: ReceivedCount,
): SagaIterator {
  const errorChan = eventChannel(emitter => {
    hostPlugin.receiveError = emitter;
    return () => {
      if (hostPlugin.receiveError === emitter) {
        delete hostPlugin.receiveError;
      }
    };
  });
  try {
    while (true) {
      const error = yield take(errorChan);
      receivedCount.count++;
      yield* surfaceConductorError(error, workspaceLocation, false);
    }
  } catch (e) {
    // A conductor evaluator may report a preprocessing/syntax error by rejecting its run rather than
    // via the error channel (the Python stepper does this: the rejection is thrown into this forked
    // task by redux-saga). Handle it the same way and do NOT re-throw — otherwise it aborts the run
    // saga and escapes as an uncaught error (invisible to the user). redux-saga task cancellations are
    // not Error instances, so re-raise those to preserve normal teardown. No runner is expected to send
    // a terminal status after this kind of failure, so this path still interrupts immediately.
    if (e instanceof Error) {
      yield* surfaceConductorError(e, workspaceLocation);
    } else {
      throw e;
    }
  } finally {
    if (yield cancelled()) {
      errorChan.close();
    }
  }
}

type CseSnapshotBatch = { snapshots: CseSnapshot[]; breakpointSteps: number[] };

function* handleCseSnapshots(
  csePlugin: CseMachineHostPlugin,
  workspaceLocation: WorkspaceLocation,
): SagaIterator {
  const snapshotChan = eventChannel<CseSnapshotBatch>(emitter => {
    const receive = (snapshots: CseSnapshot[], breakpointSteps: number[]) =>
      emitter({ snapshots, breakpointSteps });
    csePlugin.receiveSnapshots = receive;
    return () => {
      if (csePlugin.receiveSnapshots === receive) {
        csePlugin.receiveSnapshots = () => {};
      }
    };
  });
  try {
    while (true) {
      const batch: CseSnapshotBatch | typeof END = yield take(snapshotChan);
      if (!('snapshots' in batch) || !Array.isArray(batch.snapshots)) {
        break;
      }
      const { snapshots, breakpointSteps } = batch;
      yield put(WorkspaceActions.updateCseSnapshots(snapshots, workspaceLocation));
      yield put(
        WorkspaceActions.updateStepsTotal(Math.max(0, snapshots.length - 1), workspaceLocation),
      );
      yield put(WorkspaceActions.updateBreakpointSteps(breakpointSteps ?? [], workspaceLocation));
      yield put(
        WorkspaceActions.toggleUpdateCse(false, workspaceLocation as WorkspaceLocationsWithTools),
      );
    }
  } catch (_e) {
    // Swallow errors from this non-critical background task
  } finally {
    snapshotChan.close();
  }
}

function* handleStatuses(
  hostPlugin: BrowserHostPlugin,
  workspaceLocation: WorkspaceLocation,
  receivedCount: ReceivedCount,
): SagaIterator {
  const statusChan = eventChannel<{ status: RunnerStatus; isActive: boolean; sentCount: number }>(
    emitter => {
      const onStatusUpdate = (status: RunnerStatus, isActive: boolean, sentCount: number) =>
        emitter({ status, isActive, sentCount });
      hostPlugin.receiveStatusUpdate = onStatusUpdate;
      return () => {
        if (hostPlugin.receiveStatusUpdate === onStatusUpdate) {
          delete hostPlugin.receiveStatusUpdate;
        }
      };
    },
  );
  try {
    while (true) {
      const { status, isActive, sentCount } = yield take(statusChan);
      const isTerminalStatus =
        isActive && (status === RunnerStatus.STOPPED || status === RunnerStatus.ERROR);
      if (status === RunnerStatus.RUNNING) {
        yield put(actions.setIsRunning(isActive, workspaceLocation));
      }
      if (isTerminalStatus) {
        // The runner has genuinely finished (including any pending async work — e.g. Python's
        // set_timeout — see BasicEvaluator's beginPendingWork/endPendingWork), but sentCount's
        // matching output/result/error may still be in flight on their own MessagePort (no
        // cross-channel ordering guarantee against STATUS). Wait for our own receivedCount to
        // catch up before unblocking the REPL loop, instead of guessing with a fixed delay.
        // Bounded, not open-ended: the program has already finished by this point (STATUS said
        // so), so this is only ever waiting on a few already-sent straggler bytes, not gating a
        // student program's own run time the way the removed execTime watchdog did. A message
        // that's merely delayed clears this in low single-digit milliseconds; only a genuine bug
        // elsewhere (a sibling handler dying before consuming its channel, a runner misreporting
        // sentCount) would ever run out this clock, and this is the fallback for exactly that.
        const drainDeadline = Date.now() + 5000;
        while (receivedCount.count < sentCount) {
          if (Date.now() > drainDeadline) {
            console.warn(
              `Timed out waiting for ${sentCount - receivedCount.count} pending message(s) before interrupting ${workspaceLocation}.`,
            );
            break;
          }
          yield call(() => new Promise(resolve => setTimeout(resolve, 5)));
        }
        yield put(actions.beginInterruptExecution(workspaceLocation));
      }
    }
  } finally {
    statusChan.close();
  }
}
/**
 * Runs code using the evaluators in the Language Directory using the Conductor framework.
 * Invoked when the conductor.enable feature flag is enabled.
 * Uses a preloaded Conductor instance when available to reduce startup latency.
 */
export function* evalCodeConductorSaga(
  files: Record<string, string>,
  entrypointFilePath: string,
  context: Context,
  workspaceLocation: WorkspaceLocation,
  actionType: string,
  storyEnv?: string,
): SagaIterator {
  // Wait 5 seconds for language directory to initialise before continuing evaluation
  let evaluator: IEvaluatorDefinition | undefined = yield call(getEvaluatorDefinitionSaga);
  if (!evaluator?.path) {
    const { timeout } = yield race({
      evaluatorSelected: take(LanguageDirectoryActions.setSelectedEvaluator.type),
      timeout: call(() => new Promise(resolve => setTimeout(() => resolve(true), 5000))),
    });
    if (timeout) {
      throw Error('language directory could not be loaded in time');
    }
    evaluator = yield call(getEvaluatorDefinitionSaga);
    if (!evaluator?.path) {
      throw Error('no evaluator');
    }
  }

  // Clear stale CSE snapshots from the previous run
  yield put(WorkspaceActions.updateCseSnapshots(null, workspaceLocation));

  // Inject step limit so the evaluator knows how many snapshots to collect
  const { stepLimit }: { stepLimit: number } = yield* selectWorkspace(workspaceLocation);
  const filesWithConfig = {
    ...files,
    '/__cse_config__': JSON.stringify({ stepLimit }),
  };

  let conduit: IConduit | undefined;
  let stdoutTask: any;
  let inputTask: any;
  let resultTask: any;
  let errorTask: any;
  let statusTask: any;
  let cseTask: any;

  try {
    // Reuse a preloaded conductor instance when available.
    const prepared: {
      hostPlugin: BrowserHostPlugin;
      csePlugin: CseMachineHostPlugin;
      conduit: IConduit;
    } = yield call(getPreparedConductorSaga, { files: filesWithConfig, consume: true });
    const hostPlugin = prepared.hostPlugin;
    const csePlugin = prepared.csePlugin;
    conduit = prepared.conduit;

    // Immediately start warming the next conductor in the background
    yield spawn(preloadConductorEvaluatorSaga, evaluator.path);

    // Begin evaluation. receivedCount is shared by the four handlers below: handleStdout/
    // handleResults/handleErrors increment it as each output/result/error message actually
    // arrives, and handleStatuses waits for it to reach a terminal status's own sentCount before
    // treating the run as over (see ReceivedCount's doc comment).
    const receivedCount: ReceivedCount = { count: 0 };
    stdoutTask = yield fork(handleStdout, hostPlugin, workspaceLocation, receivedCount);
    inputTask = yield fork(handleInputRequest, hostPlugin, workspaceLocation);
    resultTask = yield fork(handleResults, hostPlugin, workspaceLocation, receivedCount);
    errorTask = yield fork(handleErrors, hostPlugin, workspaceLocation, receivedCount);
    statusTask = yield fork(handleStatuses, hostPlugin, workspaceLocation, receivedCount);
    cseTask = yield fork(handleCseSnapshots, csePlugin, workspaceLocation);

    yield call([hostPlugin, 'startEvaluator'], entrypointFilePath);

    // Wait for the runner to send a genuine terminal STATUS (STOPPED/ERROR, dispatched by
    // handleStatuses only once the evaluator's own pending work — e.g. Python's set_timeout —
    // has settled), or for the user to manually interrupt execution (Stop, or starting another
    // Run — see evalEditorSaga's own beginInterruptExecution dispatch). No watchdog timeout:
    // the Conductor framework gives every run a dedicated Worker that Stop/Run-again can always
    // reclaim, so student programs are free to run (or wait on set_timeout/input()) indefinitely
    // without an arbitrary deadline killing them out from under a legitimate long-running task.
    yield take(actions.beginInterruptExecution.type);

    // Drain pending result/error/output before teardown. Each conductor channel is its own
    // MessagePort with no cross-channel ordering, so the terminal STATUS (which just resolved the
    // take above) can be handled before the result/error/output posted just before it on their own
    // ports. Cancelling the forks immediately would drop those still-in-flight messages (e.g. an
    // evaluator that reports an error via `sendError` rather than by rejecting — see the catch below).
    // Give the forks a brief window to process what the runner already sent.
    yield call(() => new Promise(resolve => setTimeout(resolve, 50)));
  } catch (runError) {
    // Defensive: surface any setup error (e.g. failing to obtain the conductor) or synchronous
    // startEvaluator rejection here rather than letting it escape as an uncaught saga error. The
    // Python stepper's async rejection is delivered to and handled in `handleErrors`, not here.
    yield* surfaceConductorError(runError, workspaceLocation);
  } finally {
    try {
      // getPreparedConductorSaga's contract: a consumed conductor "should be terminated by the
      // caller" - this is that caller. Without this, every Run leaks its Worker instead of
      // shutting it down.
      if (conduit) {
        yield call([conduit, 'terminate']);
      }
      if (cseTask) {
        yield cancel(cseTask);
      }
      if (statusTask) {
        yield cancel(statusTask);
      }
      if (stdoutTask) {
        yield cancel(stdoutTask);
      }
      if (inputTask) {
        yield cancel(inputTask);
      }
      if (resultTask) {
        yield cancel(resultTask);
      }
      if (errorTask) {
        yield cancel(errorTask);
      }
    } finally {
      yield put(actions.endInterruptExecution(workspaceLocation));
      yield put(actions.setIsRunning(false, workspaceLocation));
    }
  }
}

// Special module errors
const specialErrors = ['source_academy_interrupt'] as const;
type SpecialError = (typeof specialErrors)[number];

function checkSpecialError(errors: SourceError[]): SpecialError | null {
  if (errors.length !== 1) {
    return null;
  }
  const firstError = errors[0] as any;
  if (typeof firstError.error !== 'string') {
    return null;
  }
  if (!specialErrors.includes(firstError.error)) {
    return null;
  }

  return firstError.error as SpecialError;
}

function* handleSourceAcademyInterrupt(
  context: Context,
  entrypointCode: string,
  workspaceLocation: WorkspaceLocation,
) {
  yield put(
    actions.evalInterpreterSuccess('Program has been interrupted by module', workspaceLocation),
  );
  context.errors = [];
  yield put(actions.notifyProgramEvaluated(null, null, entrypointCode, context, workspaceLocation));
}
