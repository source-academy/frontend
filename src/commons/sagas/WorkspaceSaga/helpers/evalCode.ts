import { compileAndRun as compileAndRunCCode } from '@sourceacademy/c-slang/ctowasm/dist/index';
import type { IConduit } from '@sourceacademy/conductor/dist/conduit';
import { IEvaluatorDefinition } from '@sourceacademy/language-directory/dist/types';
import { tokenizer } from 'acorn';
import { type Context, interrupt, type Result, resume, runFilesInContext } from 'js-slang';
import { ACORN_PARSE_OPTIONS } from 'js-slang/dist/constants';
import { InterruptedError } from 'js-slang/dist/errors/errors';
import { Chapter, ErrorSeverity, ErrorType, type SourceError, Variant } from 'js-slang/dist/types';
import { pick } from 'lodash';
import { eventChannel, type SagaIterator } from 'redux-saga';
import { call, cancel, cancelled, fork, put, race, select, take } from 'redux-saga/effects';
import * as Sourceror from 'sourceror';

import InterpreterActions from '../../../../commons/application/actions/InterpreterActions';
import { makeCCompilerConfig, specialCReturnObject } from '../../../../commons/utils/CToWasmHelper';
import { javaRun } from '../../../../commons/utils/JavaHelper';
import { EventType } from '../../../../features/achievement/AchievementTypes';
import type { BrowserHostPlugin } from '../../../../features/conductor/BrowserHostPlugin';
import { createConductor } from '../../../../features/conductor/createConductor';
import { selectConductorEnable } from '../../../../features/conductor/flagConductorEnable';
import { selectConductorEvaluatorUrl } from '../../../../features/conductor/flagConductorEvaluatorUrl';
import { selectDirectoryLanguageEnable } from '../../../../features/directory/flagDirectoryLanguageEnable';
import StoriesActions from '../../../../features/stories/StoriesActions';
import { isSchemeLanguage, type OverallState } from '../../../application/ApplicationTypes';
import { SideContentType } from '../../../sideContent/SideContentTypes';
import { actions } from '../../../utils/ActionsHelper';
import DisplayBufferService from '../../../utils/DisplayBufferService';
import { showWarningMessage } from '../../../utils/notifications/NotificationsHelper';
import { makeExternalBuiltins as makeSourcerorExternalBuiltins } from '../../../utils/SourcerorHelper';
import WorkspaceActions from '../../../workspace/WorkspaceActions';
import { EVAL_SILENT, type WorkspaceLocation } from '../../../workspace/WorkspaceTypes';
import { getEvaluatorDefinitionSaga } from '../../LanguageDirectorySaga';
import { selectStoryEnv, selectWorkspace } from '../../SafeEffects';
import { dumpDisplayBuffer } from './dumpDisplayBuffer';
import { updateInspector } from './updateInspector';

async function wasm_compile_and_run(
  wasmCode: string,
  context: Context,
  isRepl: boolean
): Promise<Result> {
  try {
    const wasmModule = await Sourceror.compile(wasmCode, context, isRepl);
    const transcoder = new Sourceror.Transcoder();
    const returnedValue = await Sourceror.run(
      wasmModule,
      Sourceror.makePlatformImports(makeSourcerorExternalBuiltins(context), transcoder),
      transcoder,
      context,
      isRepl
    );
    return { status: 'finished', context, value: returnedValue };
  } catch (e) {
    console.log(e);
    return { status: 'error' };
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
          column: 0
        },
        end: {
          line: 0,
          column: 0
        }
      },
      explain: () => errorMessage,
      elaborate: () => ''
    });
  }

  function reportCRuntimeError(errorMessage: string, context: Context) {
    context.errors.push({
      type: ErrorType.RUNTIME,
      severity: ErrorSeverity.ERROR,
      location: {
        start: {
          line: 0,
          column: 0
        },
        end: {
          line: 0,
          column: 0
        }
      },
      explain: () => errorMessage,
      elaborate: () => ''
    });
  }
  const cCompilerConfig = await makeCCompilerConfig(cCode, context);
  try {
    const compilationResult = await compileAndRunCCode(cCode, cCompilerConfig);
    if (compilationResult.status === 'failure') {
      // report any compilation failure
      reportCCompilationError(
        `Compilation failed with the following error(s):\n\n${compilationResult.errorMessage}`,
        context
      );
      return {
        status: 'error',
        context
      } as Result;
    }
    if (compilationResult.warnings.length > 0) {
      return {
        status: 'finished',
        context,
        value: {
          toReplString: () =>
            `Compilation and program execution successful with the following warning(s):\n${compilationResult.warnings.join(
              '\n'
            )}`
        }
      };
    }
    if (specialCReturnObject === null) {
      return {
        status: 'finished',
        context,
        value: { toReplString: () => 'Compilation and program execution successful.' }
      };
    }
    return { status: 'finished', context, value: specialCReturnObject };
  } catch (e) {
    console.log(e);
    reportCRuntimeError(e.message, context);
    return { status: 'error' };
  }
}

export function* evalCodeSaga(
  files: Record<string, string>,
  entrypointFilePath: string,
  context: Context,
  execTime: number,
  actionType: string,
  workspaceLocation: WorkspaceLocation,
  storyEnv?: string
): SagaIterator {
  if (yield select(selectConductorEnable)) {
    return yield call(
      evalCodeConductorSaga,
      files,
      entrypointFilePath,
      context,
      execTime,
      workspaceLocation,
      actionType,
      storyEnv
    );
  }
  context.runtime.debuggerOn =
    (actionType === WorkspaceActions.evalEditor.type ||
      actionType === InterpreterActions.debuggerResume.type) &&
    context.chapter > 2;
  const isStoriesBlock = actionType === actions.evalStory.type || workspaceLocation === 'stories';

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
        substIsActive: usingSubst
      };
    }

    if (isStoriesBlock) {
      const { usingSubst } = yield* selectStoryEnv(storyEnv!);
      return {
        ...commons,
        currentStep: -1,
        cseIsActive: false,
        needUpdateCse: false,
        substIsActive: usingSubst
      };
    }

    return {
      ...commons,
      currentStep: -1,
      cseIsActive: false,
      needUpdateCse: false,
      substIsActive: false
    };
  }

  const entrypointCode = files[entrypointFilePath];
  // Logic for execution of substitution model visualizer
  const { currentStep, cseIsActive, isFolderModeEnabled, needUpdateCse, stepLimit, substIsActive } =
    yield* getWorkspaceData();

  const cseActiveAndCorrectChapter =
    (isSchemeLanguage(context.chapter) || context.chapter >= Chapter.SOURCE_3) && cseIsActive;
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
        actionType === WorkspaceActions.evalRepl.type
      );
    }

    switch (context.chapter) {
      case Chapter.FULL_C:
        return call(cCompileAndRun, entrypointCode, context);
      case Chapter.FULL_JAVA: {
        const {
          usingCse: isUsingCse,
          usingUpload: uploadIsActive,
          files: uploads
        } = yield* selectWorkspace('playground');

        return call(javaRun, entrypointCode, context, currentStep, isUsingCse, {
          uploadIsActive,
          uploads
        });
      }
    }

    const substActiveAndCorrectChapter = context.chapter <= Chapter.SOURCE_2 && substIsActive;

    return call(
      runFilesInContext,
      isFolderModeEnabled
        ? files
        : {
            [entrypointFilePath]: files[entrypointFilePath]
          },
      entrypointFilePath,
      context,
      {
        originalMaxExecTime: execTime,
        stepLimit: stepLimit,
        throwInfiniteLoops: true,
        useSubst: substActiveAndCorrectChapter,
        envSteps: currentStep,
        executionMethod: cseActiveAndCorrectChapter ? 'cse-machine' : 'auto'
      }
    );
  }

  // Handles `console.log` statements in fullJS
  if (context.chapter === Chapter.FULL_JS || context.chapter === Chapter.FULL_TS) {
    yield call([DisplayBufferService, DisplayBufferService.attachConsole], workspaceLocation);
  }

  const {
    result,
    interrupted,
    paused
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
    paused: take(InterpreterActions.beginDebuggerPause.type)
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

  // do not highlight for stories
  if (!isStoriesBlock) {
    yield call(updateInspector, workspaceLocation);
  }

  if (result.status === 'suspended-cse-eval') {
    yield put(actions.endDebuggerPause(workspaceLocation));
    yield put(actions.evalInterpreterSuccess('Breakpoint hit!', workspaceLocation));
    return;
  } else if (result.status !== 'finished') {
    yield* dumpDisplayBuffer(workspaceLocation, isStoriesBlock, storyEnv);
    if (!isStoriesBlock) {
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
          yield put(actions.toggleUpdateCse(false, workspaceLocation as any));
          yield put(
            actions.updateBreakpointSteps(context.runtime.breakpointSteps, workspaceLocation)
          );
          yield put(
            actions.updateChangePointSteps(context.runtime.changepointSteps, workspaceLocation)
          );
        }
      }
    } else {
      // Safe to use ! as storyEnv will be defined from above when we call from EVAL_STORY
      yield put(actions.evalStoryError(context.errors, storyEnv!));
    }

    const events = context.errors.length > 0 ? [EventType.ERROR] : [];

    yield put(actions.addEvent(events));
    return;
  }

  yield* dumpDisplayBuffer(workspaceLocation, isStoriesBlock, storyEnv);

  // Change token count if its assessment and EVAL_EDITOR
  if (actionType === WorkspaceActions.evalEditor.type && workspaceLocation === 'assessment') {
    const tokens = [...tokenizer(entrypointCode, ACORN_PARSE_OPTIONS)];
    const tokenCounter = tokens.length;
    yield put(actions.setTokenCount(workspaceLocation, tokenCounter));
  }

  // Do not write interpreter output to REPL, if executing chunks (e.g. prepend/postpend blocks)
  if (actionType !== EVAL_SILENT) {
    if (!isStoriesBlock) {
      yield put(actions.evalInterpreterSuccess(result.value, workspaceLocation));
    } else {
      // Safe to use ! as storyEnv will be defined from above when we call from EVAL_STORY
      yield put(actions.evalStorySuccess(result.value, storyEnv!));
    }
  }

  const lastDebuggerResult = yield select(
    (state: OverallState) => state.workspaces[workspaceLocation].lastDebuggerResult
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
        workspaceLocation
      )
    );
  }
  if (isStoriesBlock) {
    yield put(
      // Safe to use ! as storyEnv will be defined from above when we call from EVAL_STORY
      StoriesActions.notifyStoriesEvaluated(
        result,
        lastDebuggerResult,
        entrypointCode,
        context,
        storyEnv!
      )
    );
  }

  // The first time the code is executed using the explicit control evaluator,
  // the total number of steps and the breakpoints are updated in the CSE Machine slider.
  if (context.executionMethod === 'cse-machine' && needUpdateCse) {
    yield put(actions.updateStepsTotal(context.runtime.envStepsTotal, workspaceLocation));
    // `needUpdateCse` implies `correctWorkspace`, which satisfies the type constraint.
    // But TS can't infer that yet, so we need a typecast here.
    yield put(actions.toggleUpdateCse(false, workspaceLocation as any));
    yield put(actions.updateBreakpointSteps(context.runtime.breakpointSteps, workspaceLocation));
    yield put(actions.updateChangePointSteps(context.runtime.changepointSteps, workspaceLocation));
  }
  // Stop the home icon from flashing for an error if it is doing so since the evaluation is successful
  if (context.executionMethod === 'cse-machine') {
    if (workspaceLocation !== 'stories') {
      yield put(actions.removeSideContentAlert(SideContentType.introduction, workspaceLocation));
    } else {
      yield put(
        actions.removeSideContentAlert(SideContentType.introduction, `stories.${storyEnv!}`)
      );
    }
  }
}

function* handleStdout(
  hostPlugin: BrowserHostPlugin,
  workspaceLocation: WorkspaceLocation
): SagaIterator {
  const outputChan = eventChannel(emitter => {
    hostPlugin.receiveOutput = emitter;
    return () => {
      if (hostPlugin.receiveOutput === emitter) delete hostPlugin.receiveOutput;
    };
  });
  try {
    while (true) {
      const output = yield take(outputChan);
      yield put(actions.handleConsoleLog(workspaceLocation, output));
    }
  } finally {
    if (yield cancelled()) {
      outputChan.close();
    }
  }
}

export function* evalCodeConductorSaga(
  files: Record<string, string>,
  entrypointFilePath: string,
  context: Context,
  execTime: number,
  workspaceLocation: WorkspaceLocation,
  actionType: string,
  storyEnv?: string
): SagaIterator {
  let path: string;
  if (yield select(selectDirectoryLanguageEnable)) {
    const evaluator: IEvaluatorDefinition | undefined = yield call(getEvaluatorDefinitionSaga);
    if (!evaluator?.path) throw Error('no evaluator');
    path = evaluator.path;
  } else {
    path = yield select(selectConductorEvaluatorUrl);
  }
  const evaluatorResponse: Response = yield call(fetch, path);
  if (!evaluatorResponse.ok) throw Error("can't get evaluator");
  const evaluatorBlob: Blob = yield call([evaluatorResponse, 'blob']);
  const url: string = yield call(URL.createObjectURL, evaluatorBlob);
  const { hostPlugin, conduit }: { hostPlugin: BrowserHostPlugin; conduit: IConduit } = yield call(
    createConductor,
    url,
    async (fileName: string) => files[fileName],
    (pluginName: string) => {} // TODO: implement dynamic plugin loading
  );
  const stdoutTask = yield fork(handleStdout, hostPlugin, workspaceLocation);
  yield call([hostPlugin, 'startEvaluator'], entrypointFilePath);
  while (true) {
    const { stop } = yield race({
      repl: take(actions.evalRepl.type),
      stop: take(actions.beginInterruptExecution.type)
    });
    if (stop) break;
    const code: string = yield select(
      (state: OverallState) => state.workspaces[workspaceLocation].replValue
    );
    yield put(actions.sendReplInputToOutput(code, workspaceLocation));
    yield put(actions.clearReplInput(workspaceLocation));
    yield call([hostPlugin, 'sendChunk'], code);
  }
  yield call([conduit, 'terminate']);
  yield cancel(stdoutTask);
  //yield put(actions.debuggerReset(workspaceLocation));
  yield put(actions.endInterruptExecution(workspaceLocation));
  console.log('killed');
  yield call(URL.revokeObjectURL, url);
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
  workspaceLocation: WorkspaceLocation
) {
  yield put(
    actions.evalInterpreterSuccess('Program has been interrupted by module', workspaceLocation)
  );
  context.errors = [];
  yield put(actions.notifyProgramEvaluated(null, null, entrypointCode, context, workspaceLocation));
}
