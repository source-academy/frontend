import { compileAndRun as compileAndRunCCode } from '@sourceacademy/c-slang/ctowasm/dist/index';
import { tokenizer } from 'acorn';
import { Context, interrupt, Result, resume, runFilesInContext } from 'js-slang';
import { ACORN_PARSE_OPTIONS, TRY_AGAIN } from 'js-slang/dist/constants';
import { InterruptedError } from 'js-slang/dist/errors/errors';
import { manualToggleDebugger } from 'js-slang/dist/stdlib/inspector';
import { Chapter, ErrorSeverity, ErrorType, SourceError, Variant } from 'js-slang/dist/types';
import { SagaIterator } from 'redux-saga';
import { call, put, race, select, take } from 'redux-saga/effects';
import * as Sourceror from 'sourceror';
import InterpreterActions from 'src/commons/application/actions/InterpreterActions';
import { makeCCompilerConfig, specialCReturnObject } from 'src/commons/utils/CToWasmHelper';
import { javaRun } from 'src/commons/utils/JavaHelper';
import StoriesActions from 'src/features/stories/StoriesActions';

import { EventType } from '../../../../features/achievement/AchievementTypes';
import { isSchemeLanguage, OverallState } from '../../../application/ApplicationTypes';
import { SideContentType } from '../../../sideContent/SideContentTypes';
import { actions } from '../../../utils/ActionsHelper';
import DisplayBufferService from '../../../utils/DisplayBufferService';
import { showWarningMessage } from '../../../utils/notifications/NotificationsHelper';
import { makeExternalBuiltins as makeSourcerorExternalBuiltins } from '../../../utils/SourcerorHelper';
import WorkspaceActions from '../../../workspace/WorkspaceActions';
import {
  EVAL_SILENT,
  PlaygroundWorkspaceState,
  SicpWorkspaceState,
  WorkspaceLocation
} from '../../../workspace/WorkspaceTypes';
import { dumpDisplayBuffer } from './dumpDisplayBuffer';
import { updateInspector } from './updateInspector';

export function* evalCodeSaga(
  files: Record<string, string>,
  entrypointFilePath: string,
  context: Context,
  execTime: number,
  workspaceLocation: WorkspaceLocation,
  actionType: string,
  storyEnv?: string
): SagaIterator {
  context.runtime.debuggerOn =
    (actionType === WorkspaceActions.evalEditor.type ||
      actionType === InterpreterActions.debuggerResume.type) &&
    context.chapter > 2;
  const isStoriesBlock = actionType === actions.evalStory.type || workspaceLocation === 'stories';

  // Logic for execution of substitution model visualizer
  const correctWorkspace = workspaceLocation === 'playground' || workspaceLocation === 'sicp';
  const substIsActive: boolean = correctWorkspace
    ? yield select(
        (state: OverallState) =>
          (state.workspaces[workspaceLocation] as PlaygroundWorkspaceState | SicpWorkspaceState)
            .usingSubst
      )
    : isStoriesBlock
      ? // Safe to use ! as storyEnv will be defined from above when we call from EVAL_STORY
        yield select((state: OverallState) => state.stories.envs[storyEnv!].usingSubst)
      : false;
  const stepLimit: number = isStoriesBlock
    ? yield select((state: OverallState) => state.stories.envs[storyEnv!].stepLimit)
    : yield select((state: OverallState) => state.workspaces[workspaceLocation].stepLimit);
  const substActiveAndCorrectChapter = context.chapter <= 2 && substIsActive;
  if (substActiveAndCorrectChapter) {
    context.executionMethod = 'interpreter';
  }

  const uploadIsActive: boolean = correctWorkspace
    ? yield select(
        (state: OverallState) =>
          (state.workspaces[workspaceLocation] as PlaygroundWorkspaceState | SicpWorkspaceState)
            .usingUpload
      )
    : false;
  const uploads = yield select((state: OverallState) => state.workspaces[workspaceLocation].files);

  // For the CSE machine slider
  const cseIsActive: boolean = correctWorkspace
    ? yield select(
        (state: OverallState) =>
          (state.workspaces[workspaceLocation] as PlaygroundWorkspaceState | SicpWorkspaceState)
            .usingCse
      )
    : false;
  const needUpdateCse: boolean = correctWorkspace
    ? yield select(
        (state: OverallState) =>
          (state.workspaces[workspaceLocation] as PlaygroundWorkspaceState | SicpWorkspaceState)
            .updateCse
      )
    : false;
  // When currentStep is -1, the entire code is run from the start.
  const currentStep: number = needUpdateCse
    ? -1
    : correctWorkspace
      ? yield select(
          (state: OverallState) =>
            (state.workspaces[workspaceLocation] as PlaygroundWorkspaceState | SicpWorkspaceState)
              .currentStep
        )
      : -1;
  const cseActiveAndCorrectChapter =
    (isSchemeLanguage(context.chapter) || context.chapter >= 3) && cseIsActive;
  if (cseActiveAndCorrectChapter) {
    context.executionMethod = 'cse-machine';
  }

  const isFolderModeEnabled: boolean = yield select(
    (state: OverallState) => state.workspaces[workspaceLocation].isFolderModeEnabled
  );

  const entrypointCode = files[entrypointFilePath];
  const lastNonDetResult = yield select(
    (state: OverallState) => state.workspaces[workspaceLocation].lastNonDetResult
  );

  function call_variant(variant: Variant) {
    if (variant === Variant.NON_DET) {
      return entrypointCode.trim() === TRY_AGAIN
        ? call(resume, lastNonDetResult)
        : call(runFilesInContext, files, entrypointFilePath, context, {
            executionMethod: 'interpreter',
            originalMaxExecTime: execTime,
            stepLimit: stepLimit,
            useSubst: substActiveAndCorrectChapter,
            envSteps: currentStep
          });
    } else if (variant === Variant.LAZY) {
      return call(runFilesInContext, files, entrypointFilePath, context, {
        scheduler: 'preemptive',
        originalMaxExecTime: execTime,
        stepLimit: stepLimit,
        useSubst: substActiveAndCorrectChapter,
        envSteps: currentStep
      });
    } else if (variant === Variant.WASM) {
      // Note: WASM does not support multiple file programs.
      return call(
        wasm_compile_and_run,
        entrypointCode,
        context,
        actionType === WorkspaceActions.evalRepl.type
      );
    } else {
      throw new Error('Unknown variant: ' + variant);
    }
  }
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

  async function cCompileAndRun(cCode: string, context: Context) {
    const cCompilerConfig = await makeCCompilerConfig(cCode, context);
    return await compileAndRunCCode(cCode, cCompilerConfig)
      .then(compilationResult => {
        if (compilationResult.status === 'failure') {
          // report any compilation failure
          reportCCompilationError(
            `Compilation failed with the following error(s):\n\n${compilationResult.errorMessage}`,
            context
          );
          return {
            status: 'error',
            context
          };
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
      })
      .catch((e: any): Result => {
        console.log(e);
        reportCRuntimeError(e.message, context);
        return { status: 'error' };
      });
  }

  const isNonDet: boolean = context.variant === Variant.NON_DET;
  const isLazy: boolean = context.variant === Variant.LAZY;
  const isWasm: boolean = context.variant === Variant.WASM;
  const isC: boolean = context.chapter === Chapter.FULL_C;
  const isJava: boolean = context.chapter === Chapter.FULL_JAVA;

  let lastDebuggerResult = yield select(
    (state: OverallState) => state.workspaces[workspaceLocation].lastDebuggerResult
  );
  const isUsingCse = yield select((state: OverallState) => state.workspaces['playground'].usingCse);

  // Handles `console.log` statements in fullJS
  const detachConsole: () => void =
    context.chapter === Chapter.FULL_JS
      ? DisplayBufferService.attachConsole(workspaceLocation)
      : () => {};

  const { result, interrupted, paused } = yield race({
    result:
      actionType === InterpreterActions.debuggerResume.type
        ? call(resume, lastDebuggerResult)
        : isNonDet || isLazy || isWasm
          ? call_variant(context.variant)
          : isC
            ? call(cCompileAndRun, entrypointCode, context)
            : isJava
              ? call(javaRun, entrypointCode, context, currentStep, isUsingCse, {
                  uploadIsActive,
                  uploads
                })
              : call(
                  runFilesInContext,
                  isFolderModeEnabled
                    ? files
                    : {
                        [entrypointFilePath]: files[entrypointFilePath]
                      },
                  entrypointFilePath,
                  context,
                  {
                    scheduler: 'preemptive',
                    originalMaxExecTime: execTime,
                    stepLimit: stepLimit,
                    throwInfiniteLoops: true,
                    useSubst: substActiveAndCorrectChapter,
                    envSteps: currentStep
                  }
                ),

    /**
     * A BEGIN_INTERRUPT_EXECUTION signals the beginning of an interruption,
     * i.e the trigger for the interpreter to interrupt execution.
     */
    interrupted: take(InterpreterActions.beginInterruptExecution.type),
    paused: take(InterpreterActions.beginDebuggerPause.type)
  });

  detachConsole();

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
    yield put(actions.updateLastDebuggerResult(manualToggleDebugger(context), workspaceLocation));
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

  if (
    result.status !== 'suspended' &&
    result.status !== 'finished' &&
    result.status !== 'suspended-non-det' &&
    result.status !== 'suspended-cse-eval'
  ) {
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
  } else if (result.status === 'suspended' || result.status === 'suspended-cse-eval') {
    yield put(actions.endDebuggerPause(workspaceLocation));
    yield put(actions.evalInterpreterSuccess('Breakpoint hit!', workspaceLocation));
    return;
  } else if (isNonDet) {
    if (result.value === 'cut') {
      result.value = undefined;
    }
    yield put(actions.updateLastNonDetResult(result, workspaceLocation));
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

  lastDebuggerResult = yield select(
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
  if (context.executionMethod === 'cse-machine' || context.executionMethod === 'interpreter') {
    const introIcon = document.getElementById(SideContentType.introduction + '-icon');
    introIcon?.classList.remove('side-content-tab-alert-error');
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
  workspaceLocation: WorkspaceLocation
) {
  yield put(
    actions.evalInterpreterSuccess('Program has been interrupted by module', workspaceLocation)
  );
  context.errors = [];
  yield put(actions.notifyProgramEvaluated(null, null, entrypointCode, context, workspaceLocation));
}
