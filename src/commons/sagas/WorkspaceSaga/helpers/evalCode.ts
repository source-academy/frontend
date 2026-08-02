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
import { channel, END, eventChannel, type SagaIterator, type Task } from 'redux-saga';
import { call, cancel, cancelled, put, race, select, spawn, take } from 'redux-saga/effects';
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

/** Reported by handleStatuses (via a session's chunkSettledChan) each time a chunk finishes:
 * `terminal: false` for an ordinary chunk boundary (RunnerStatus.EVAL_READY - the evaluator is
 * alive and waiting for the next chunk), `terminal: true` when the session is actually over
 * (STOPPED/ERROR, or the caller was interrupted while waiting - see waitForChunkSettled). */
type ChunkSettled = { terminal: boolean };

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
      const { output, interrupted } = yield race({
        output: take(outputChan),
        interrupted: take(actions.beginInterruptExecution.type),
      });
      if (interrupted) {
        // Stop is a hard Worker.terminate(), not a cooperative signal the runner checks - so a
        // fast-but-large output burst (e.g. a module's per-sample loop calling print() tens of
        // thousands of times) can already be fully buffered and about to flood this channel by
        // the time Stop is clicked. Once interrupted, stop rendering: the runner is already gone,
        // so draining and dispatching every remaining queued message would just make the REPL
        // look like the program kept running long after Stop was pressed.
        outputChan.close();
        break;
      }
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
    // Same undefined-forbidden-by-eventChannel issue as the result channel: the
    // conductor package's BasicHostPlugin calls receiveError with errorMessage.error
    // directly, which isn't guaranteed to be defined.
    const onReceiveError = (error: unknown) => emitter(error === undefined ? null : error);
    hostPlugin.receiveError = onReceiveError;
    return () => {
      if (hostPlugin.receiveError === onReceiveError) {
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
  chunkSettledChan: ReturnType<typeof channel<ChunkSettled>>,
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
      // A chunk boundary: the evaluator finished whatever it was just sent (the entrypoint file,
      // or a later REPL line) and is waiting for the next one - see conductor's
      // BasicEvaluator.startEvaluator, which reports EVAL_READY between chunks instead of
      // STOPPED so the session (and everything declared in it) survives. STOPPED/ERROR are
      // genuinely terminal: the evaluator crashed, or setup (e.g. loading the entrypoint file)
      // failed before the chunk loop ever started.
      const isChunkBoundary = isActive && status === RunnerStatus.EVAL_READY;
      const isTerminalStatus =
        isActive && (status === RunnerStatus.STOPPED || status === RunnerStatus.ERROR);
      if (status === RunnerStatus.RUNNING) {
        yield put(actions.setIsRunning(isActive, workspaceLocation));
      }
      if (isChunkBoundary || isTerminalStatus) {
        yield put(actions.setIsRunning(false, workspaceLocation));
        // The runner has finished this chunk (including any pending async work — e.g. Python's
        // set_timeout — see BasicEvaluator's beginPendingWork/endPendingWork), but sentCount's
        // matching output/result/error may still be in flight on their own MessagePort (no
        // cross-channel ordering guarantee against STATUS). Wait for our own receivedCount to
        // catch up before reporting this chunk settled, instead of guessing with a fixed delay.
        // Bounded, not open-ended: the chunk has already finished by this point (STATUS said so),
        // so this is only ever waiting on a few already-sent straggler bytes, not gating a
        // student program's own run time the way the removed execTime watchdog did. A message
        // that's merely delayed clears this in low single-digit milliseconds; only a genuine bug
        // elsewhere (a sibling handler dying before consuming its channel, a runner misreporting
        // sentCount) would ever run out this clock, and this is the fallback for exactly that.
        const drainDeadline = Date.now() + 5000;
        while (receivedCount.count < sentCount) {
          if (Date.now() > drainDeadline) {
            console.warn(
              `Timed out waiting for ${sentCount - receivedCount.count} pending message(s) before continuing ${workspaceLocation}.`,
            );
            break;
          }
          yield call(() => new Promise(resolve => setTimeout(resolve, 5)));
        }
        chunkSettledChan.put({ terminal: isTerminalStatus });
        if (isTerminalStatus) {
          // The session itself is over - nothing more will ever come through this channel.
          statusChan.close();
          return;
        }
      }
    }
  } finally {
    statusChan.close();
  }
}

/**
 * A REPL session: one live conductor Worker that survives across a Run's initial chunk and every
 * REPL line submitted afterward, so a later chunk can see an earlier chunk's declarations (e.g.
 * `x` from an earlier line) — see conductor's BasicEvaluator.startEvaluator, which loops on
 * further chunks instead of stopping after the first (source-academy/conductor#66). Ends (Worker
 * killed, background tasks cancelled) only via endReplSessionSaga: explicitly on Stop or the next
 * Run, never automatically just because one chunk finished, the way a Run or REPL submission used
 * to tear its own one-shot Worker down unconditionally.
 */
type ReplSession = {
  hostPlugin: BrowserHostPlugin;
  conduit: IConduit;
  /** The evaluator path this session was established against - see evalCodeConductorSaga's own
   * evaluatorPath check for why a REPL chunk send validates this before reusing a session. */
  evaluatorPath: string;
  chunkSettledChan: ReturnType<typeof channel<ChunkSettled>>;
  /** handleStdout/handleInputRequest/handleResults/handleErrors/handleStatuses/
   * handleCseSnapshots, spawn()ed (not fork()ed) when the session was established - their
   * lifetime is this session's, not tied to whichever saga call happens to be sending the
   * current chunk, so they must keep running after that call returns. */
  tasks: Task[];
};

const replSessions = new Map<WorkspaceLocation, ReplSession>();

/**
 * Ends `workspaceLocation`'s live REPL session, if any — the only place a session's Worker is
 * actually terminated. Idempotent and safe to call whether or not a session is currently live:
 * both Stop and starting a new Run call this unconditionally before doing anything else.
 */
function* endReplSessionSaga(workspaceLocation: WorkspaceLocation): SagaIterator {
  const session = replSessions.get(workspaceLocation);
  if (!session) {
    return;
  }
  replSessions.delete(workspaceLocation);
  try {
    // Each conductor channel is its own MessagePort with no cross-channel ordering, so a chunk's
    // terminal/boundary STATUS can be handled before output/result/error posted just before it on
    // their own ports. Cancelling the tasks immediately would drop those still-in-flight messages -
    // give them a brief window to process what the runner already sent first.
    yield call(() => new Promise(resolve => setTimeout(resolve, 50)));
  } finally {
    // Runs even if the delay above is itself cancelled (e.g. a second Run's takeLatest
    // superseding whichever saga call ended up in here) - the session was already removed from
    // replSessions above, so this is the only remaining chance to cancel its tasks and kill its
    // Worker; skipping it would leak both for the rest of the page session.
    for (const task of session.tasks) {
      yield cancel(task);
    }
    session.chunkSettledChan.close();
    try {
      // This session's Worker is nobody else's responsibility to shut down - the conductor cache
      // keeps the underlying conductor object around afterward (its tabs stay on screen), but never
      // touches its Worker again. Without this, every session leaks its Worker instead of shutting
      // it down.
      session.conduit.terminate();
    } catch {
      // already terminated (e.g. the runner tore itself down before we got here)
    }
    yield put(actions.endInterruptExecution(workspaceLocation));
    yield put(actions.setIsRunning(false, workspaceLocation));
  }
}

/**
 * Waits for the chunk the caller just sent to settle: naturally (chunkSettledChan, written by
 * handleStatuses), or because the user hit Stop, or because evalEditorSaga is about to start a
 * fresh Run over this same session (both dispatch beginInterruptExecution — see its own doc
 * comment). No watchdog timeout either way: the Conductor framework gives every session a
 * dedicated Worker that Stop/Run-again can always reclaim, so student programs are free to run
 * (or wait on set_timeout/input()) indefinitely without an arbitrary deadline killing them out
 * from under a legitimate long-running task. The caller is responsible for calling
 * endReplSessionSaga when this resolves `terminal: true`.
 */
function* waitForChunkSettled(
  workspaceLocation: WorkspaceLocation,
  chunkSettledChan: ReturnType<typeof channel<ChunkSettled>>,
): SagaIterator<ChunkSettled> {
  const { settled, interrupted } = yield race({
    settled: take(chunkSettledChan),
    // Matched by payload, not just type: beginInterruptExecution is dispatched per-workspace
    // (Stop, or evalEditorSaga starting a new Run), and an unfiltered take here would let a
    // Stop/Run in a *different* workspace end this workspace's session and Worker too.
    interrupted: take(
      (action: any) =>
        action.type === actions.beginInterruptExecution.type &&
        action.payload?.workspaceLocation === workspaceLocation,
    ),
  });
  return interrupted ? { terminal: true } : settled;
}

/**
 * Runs code using the evaluators in the Language Directory using the Conductor framework.
 * Invoked when the conductor.enable feature flag is enabled.
 *
 * A Run (EVAL_EDITOR) always starts a fresh REPL session, ending whatever was live before it -
 * matching the classic (non-Conductor) REPL's own "Run rebuilds the context" behavior. A REPL
 * submission (EVAL_REPL) sends its code as another chunk to the current session if one is live,
 * or - if the REPL is used before any Run - starts a fresh one-chunk session from just that line,
 * the same way Run does. Either way, the session (and everything declared in it) survives until
 * the next Run, Stop, or evaluator/language switch (see endReplSessionSaga / endConductorSession).
 */
export function* evalCodeConductorSaga(
  files: Record<string, string>,
  entrypointFilePath: string,
  context: Context,
  workspaceLocation: WorkspaceLocation,
  actionType: string,
  storyEnv?: string,
): SagaIterator {
  // Clear stale CSE snapshots from the previous chunk, whether or not this one produces any of
  // its own (e.g. a REPL line at a chapter below §3) - otherwise the CSE Machine tab would keep
  // showing an earlier chunk's steps well after that chunk is no longer the "current" one.
  yield put(WorkspaceActions.updateCseSnapshots(null, workspaceLocation));

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

  const isReplChunk = actionType === WorkspaceActions.evalRepl.type;
  const existingSession = replSessions.get(workspaceLocation);

  // A live session only gets a chunk sent to it if it belongs to the currently selected
  // evaluator - one for a since-changed evaluator/language is stale (its Worker may already be
  // gone via endConductorSession's own teardown on a language switch) and must not receive a
  // chunk meant for a different evaluator; fall through to establishing a fresh one instead.
  if (isReplChunk && existingSession && existingSession.evaluatorPath === evaluator.path) {
    try {
      existingSession.hostPlugin.sendChunk(files[entrypointFilePath]);
    } catch (runError) {
      yield* surfaceConductorError(runError, workspaceLocation);
      yield* endReplSessionSaga(workspaceLocation);
      return;
    }
    const { terminal } = yield* waitForChunkSettled(
      workspaceLocation,
      existingSession.chunkSettledChan,
    );
    if (terminal) {
      yield* endReplSessionSaga(workspaceLocation);
    }
    return;
  }

  // Starting a fresh session: a Run always supersedes whatever REPL session was live before it; a
  // REPL line with no live (same-evaluator) session establishes one from just that line.
  yield* endReplSessionSaga(workspaceLocation);

  // Inject step limit so the evaluator knows how many snapshots to collect
  const { stepLimit }: { stepLimit: number } = yield* selectWorkspace(workspaceLocation);
  const filesWithConfig = {
    ...files,
    '/__cse_config__': JSON.stringify({ stepLimit }),
  };

  try {
    // Reuse a preloaded conductor instance when available.
    const prepared: {
      hostPlugin: BrowserHostPlugin;
      csePlugin: CseMachineHostPlugin;
      conduit: IConduit;
    } = yield call(getPreparedConductorSaga, {
      files: filesWithConfig,
      consume: true,
      workspaceLocation,
    });
    const { hostPlugin, csePlugin, conduit } = prepared;

    // Immediately start warming the next conductor in the background. forceFresh is required
    // here: the instance just obtained above is now consumed and kept alive as this workspace's
    // live REPL session, so without it this would just find that same consumed instance again and
    // do nothing, leaving the *next* Run to build fresh from scratch instead of reusing a spare.
    yield spawn(preloadConductorEvaluatorSaga, evaluator.path, { forceFresh: true });

    // receivedCount is shared by the background handlers below (see ReceivedCount's doc comment).
    // chunkSettledChan is how handleStatuses reports each chunk boundary back to whichever saga
    // call is currently waiting on one - this session's first chunk right now, or a later REPL
    // chunk send. spawn(), not fork(): these tasks must outlive this particular saga call and keep
    // running for every later chunk sent to this session, until endReplSessionSaga explicitly
    // cancels them - fork()'s attached-fork semantics would instead tie their lifetime to this
    // call's own completion.
    //
    // The session is registered *before* any handler is spawned, with an empty tasks list that
    // each spawn() below appends to - so a cancellation at any point during this setup (e.g. a
    // second Run's takeLatest superseding this one) always finds a registered session for the
    // `finally` guard below to hand to endReplSessionSaga, instead of orphaning whichever tasks
    // had already been spawned by that point.
    const receivedCount: ReceivedCount = { count: 0 };
    const chunkSettledChan = channel<ChunkSettled>();
    const session: ReplSession = {
      hostPlugin,
      conduit,
      evaluatorPath: evaluator.path,
      chunkSettledChan,
      tasks: [],
    };
    replSessions.set(workspaceLocation, session);
    session.tasks.push(yield spawn(handleStdout, hostPlugin, workspaceLocation, receivedCount));
    session.tasks.push(yield spawn(handleInputRequest, hostPlugin, workspaceLocation));
    session.tasks.push(yield spawn(handleResults, hostPlugin, workspaceLocation, receivedCount));
    session.tasks.push(yield spawn(handleErrors, hostPlugin, workspaceLocation, receivedCount));
    session.tasks.push(
      yield spawn(handleStatuses, hostPlugin, workspaceLocation, receivedCount, chunkSettledChan),
    );
    session.tasks.push(yield spawn(handleCseSnapshots, csePlugin, workspaceLocation));

    yield call([hostPlugin, 'startEvaluator'], entrypointFilePath);

    const { terminal } = yield* waitForChunkSettled(workspaceLocation, chunkSettledChan);
    if (terminal) {
      yield* endReplSessionSaga(workspaceLocation);
    }
  } catch (runError) {
    // Defensive: surface any setup error (e.g. failing to obtain the conductor) or synchronous
    // startEvaluator rejection here rather than letting it escape as an uncaught saga error. The
    // Python stepper's async rejection is delivered to and handled in `handleErrors`, not here.
    yield* surfaceConductorError(runError, workspaceLocation);
    yield* endReplSessionSaga(workspaceLocation);
  } finally {
    // Guards against this call itself being cancelled mid-setup (e.g. a second Run's takeLatest
    // superseding this one) - without this, the tasks/conduit spawned just above would be
    // orphaned: spawn()'s whole point is that they don't die with this call, so nothing else
    // would ever clean them up. Safe (and a no-op) even before replSessions.set() has run yet,
    // since endReplSessionSaga simply returns when there's nothing registered for this
    // workspace - see its own early-registration comment above for why any cancellation from
    // that point onward always does find something to tear down.
    if (yield cancelled()) {
      yield* endReplSessionSaga(workspaceLocation);
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
