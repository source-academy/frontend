import { RunnerStatus } from '@sourceacademy/conductor/types';
import type { ILanguageDefinition } from '@sourceacademy/language-directory/dist/types';
import type { SagaIterator } from 'redux-saga';
import { call, cancel, delay, fork } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';
import type { Matcher } from 'redux-saga-test-plan/matchers';
import * as matchers from 'redux-saga-test-plan/matchers';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { ErrorType, type InterpreterError } from '../errors/InterpreterError';

// Mock createStore to prevent Immer auto-freeze from freezing defaultWorkspaceManager.
// Importing RequestsSaga triggers store creation via createStore, and due to ES module
// hoisting, rootReducer initializes (freezing shared state) before setAutoFreeze(false) runs.
vi.mock('../../pages/createStore', () => ({
  store: { getState: () => ({ session: {} }) },
  createStore: vi.fn(),
}));

import LanguageDirectoryActions from '../../features/directory/LanguageDirectoryActions';
import {} from '../../features/directory/testCaseLanguage';
import { WORKSPACE_BASE_PATHS } from '../../pages/fileSystem/createInBrowserFileSystem';
import InterpreterActions from '../application/actions/InterpreterActions';
import SessionActions from '../application/actions/SessionActions';
import {
  defaultEditorValue,
  defaultState,
  type OverallState,
} from '../application/ApplicationTypes';
import { TestcaseTypes } from '../assessment/AssessmentTypes';
import { mockTestcases } from '../mocks/GradingMocks';
import { actions } from '../utils/ActionsHelper';
import { showSuccessMessage, showWarningMessage } from '../utils/notifications/NotificationsHelper';
import WorkspaceActions from '../workspace/WorkspaceActions';
import type { WorkspaceLocation, WorkspaceState } from '../workspace/WorkspaceTypes';
import {
  getPreparedConductorSaga,
  preloadConductorEvaluatorSaga,
} from './helpers/conductorEvaluatorCache';
import { getEvaluatorDefinitionSaga } from './LanguageDirectorySaga';
import { getVersionHistory, updateVersionName } from './RequestsSaga';
import workspaceSaga from './WorkspaceSaga';
import { evalCodeConductorSaga } from './WorkspaceSaga/helpers/evalCode';
import { evalEditorSaga } from './WorkspaceSaga/helpers/evalEditor';
import { runTestCase, runTestCaseConductor } from './WorkspaceSaga/helpers/runTestCase';
import { watchSavingStatus } from './WorkspaceSaga/helpers/versionHistory';

vi.mock('src/features/cseMachine/CseMachine', async importOriginal => {
  const actual: any = await importOriginal();
  return {
    ...actual, // Keep all original exports (like the default export)
    CseMachine: {
      ...actual.CseMachine, // Keep any other CseMachine properties
      drawCse: vi.fn(), // Mock just the UI methods that crash the test
      init: vi.fn(),
      clearCse: vi.fn(),
    },
  };
});

function generateDefaultState(
  workspaceLocation: WorkspaceLocation,
  payload: any = {},
): OverallState {
  return {
    ...defaultState,
    session: {
      ...defaultState.session,
      agreedToResearch: false,
      sessionId: 10,
    },
    workspaces: {
      ...defaultState.workspaces,
      [workspaceLocation]: {
        ...defaultState.workspaces[workspaceLocation],
        ...payload,
      },
    },
  };
}

/**
 * `state`, with a question open in its `assessment` or `grading` workspace whose test cases run
 * under the given language and evaluator (there is no default language for those that name none),
 * and a language directory that has them.
 */
function withGraderQuestion(
  state: OverallState,
  grader: { language: string; evaluator: string },
): OverallState {
  const language = (id: string, evaluator: string) =>
    ({ id, name: id, evaluators: [{ id: evaluator }] }) as ILanguageDefinition;
  const library = { chapter: 1, ...grader, external: { name: 'NONE', symbols: [] }, globals: [] };
  const question = { library, frontendGradingLibrary: library };
  return {
    ...state,
    languageDirectory: {
      ...state.languageDirectory,
      languages: [
        language('python1', 'python1Py2js'),
        language('python4', 'python4Py2js'),
        language('python4Typed', 'python4TypedPy2js'),
      ],
    },
    session: {
      ...state.session,
      assessments: { 1: { questions: [question] } },
      gradings: { 1: { answers: [{ question }] } },
    } as unknown as OverallState['session'],
    workspaces: {
      ...state.workspaces,
      assessment: { ...state.workspaces.assessment, currentAssessment: 1, currentQuestion: 0 },
      grading: { ...state.workspaces.grading, currentSubmission: 1, currentQuestion: 0 },
    } as unknown as OverallState['workspaces'],
  };
}

beforeEach(() => {
  // Mock the inspector
  (window as any).Inspector = vi.fn();
  (window as any).Inspector.highlightClean = vi.fn();
  (window as any).Inspector.highlightLine = vi.fn();
});

function withSelectedLanguage(
  state: OverallState,
  language: Partial<OverallState['languageDirectory']['languageMap'][string]> & { id: string },
): OverallState {
  return {
    ...state,
    languageDirectory: {
      ...state.languageDirectory,
      selectedLanguageId: language.id,
      languageMap: { ...state.languageDirectory.languageMap, [language.id]: language as any },
    },
  };
}

describe('SET_FOLDER_MODE', () => {
  test('names the added editor tab using the selected language defaultFileExtension', () => {
    const workspaceLocation = 'playground';
    const currentWorkspaceFields: Partial<WorkspaceState> = {
      isFolderModeEnabled: false,
      editorTabs: [],
    };
    const stateWithNoTabs = withSelectedLanguage(
      generateDefaultState(workspaceLocation, currentWorkspaceFields),
      { id: 'python2', name: 'Python §2', evaluators: [], defaultFileExtension: 'py' },
    );

    return expectSaga(workspaceSaga)
      .withState(stateWithNoTabs)
      .put(
        actions.addEditorTab(
          workspaceLocation,
          `${WORKSPACE_BASE_PATHS[workspaceLocation]}/program.py`,
          defaultEditorValue,
        ),
      )
      .dispatch({
        type: WorkspaceActions.setFolderMode.type,
        payload: { workspaceLocation, isFolderModeEnabled: false },
      })
      .silentRun();
  });
});

describe('TOGGLE_FOLDER_MODE', () => {
  test('enables Folder mode & calls showWarningMessage correctly when isFolderMode is false', () => {
    const workspaceLocation = 'assessment';
    const currentWorkspaceFields: Partial<WorkspaceState> = {
      isFolderModeEnabled: false,
    };
    const updatedDefaultState = generateDefaultState(workspaceLocation, currentWorkspaceFields);

    return expectSaga(workspaceSaga)
      .withState(updatedDefaultState)
      .put(WorkspaceActions.setFolderMode(workspaceLocation, true))
      .call(showWarningMessage, 'Folder mode enabled', 750)
      .dispatch({
        type: WorkspaceActions.toggleFolderMode.type,
        payload: { workspaceLocation },
      })
      .silentRun();
  });

  test('disables Folder mode & calls showWarningMessage correctly when isFolderMode is true', () => {
    const workspaceLocation = 'grading';
    const currentWorkspaceFields: Partial<WorkspaceState> = {
      isFolderModeEnabled: true,
    };
    const updatedDefaultState = generateDefaultState(workspaceLocation, currentWorkspaceFields);

    return expectSaga(workspaceSaga)
      .withState(updatedDefaultState)
      .put(WorkspaceActions.setFolderMode(workspaceLocation, false))
      .call(showWarningMessage, 'Folder mode disabled', 750)
      .dispatch({
        type: WorkspaceActions.toggleFolderMode.type,
        payload: { workspaceLocation },
      })
      .silentRun();
  });
});

describe('EVAL_EDITOR under Conductor', () => {
  test('concatenates prepend into the entrypoint for a single Conductor call instead of evaluating it separately', () => {
    const workspaceLocation = 'playground';
    const programPrependValue = 'COUNTER = 0';
    const editorValue = 'print(COUNTER)';
    const execTime = 1000;

    const newDefaultState = {
      ...generateDefaultState(workspaceLocation, {
        editorTabs: [{ value: editorValue, highlightedLines: [], breakpoints: [] }],
        programPrependValue,
        execTime,
      }),
    };

    const entrypointFilePath = `${WORKSPACE_BASE_PATHS[workspaceLocation]}/program.js`;

    return expectSaga(workspaceSaga)
      .withState(newDefaultState)
      .provide([[matchers.call.fn(evalCodeConductorSaga), undefined]])
      .call.like({
        fn: evalCodeConductorSaga,
        args: [{ [entrypointFilePath]: `${programPrependValue}\n${editorValue}` }],
      })
      .not.call.like({ fn: evalCodeConductorSaga, args: [{ '/prepend.js': programPrependValue }] })
      .dispatch({
        type: WorkspaceActions.evalEditor.type,
        payload: { workspaceLocation },
      })
      .silentRun();
  });

  test('does not alter the entrypoint when there is no prepend', () => {
    const workspaceLocation = 'playground';
    const editorValue = 'print(1)';
    const execTime = 1000;

    const newDefaultState = {
      ...generateDefaultState(workspaceLocation, {
        editorTabs: [{ value: editorValue, highlightedLines: [], breakpoints: [] }],
        programPrependValue: '',
        execTime,
      }),
    };

    const entrypointFilePath = `${WORKSPACE_BASE_PATHS[workspaceLocation]}/program.js`;

    return expectSaga(workspaceSaga)
      .withState(newDefaultState)
      .provide([[matchers.call.fn(evalCodeConductorSaga), undefined]])
      .call.like({
        fn: evalCodeConductorSaga,
        args: [{ [entrypointFilePath]: editorValue }],
      })
      .dispatch({
        type: WorkspaceActions.evalEditor.type,
        payload: { workspaceLocation },
      })
      .silentRun();
  });

  test("names the entrypoint using the selected language's defaultFileExtension", () => {
    const workspaceLocation = 'playground';
    const editorValue = 'print(1)';
    const execTime = 1000;

    const newDefaultState = {
      ...withSelectedLanguage(
        generateDefaultState(workspaceLocation, {
          editorTabs: [{ value: editorValue, highlightedLines: [], breakpoints: [] }],
          programPrependValue: '',
          execTime,
        }),
        { id: 'python2', name: 'Python §2', evaluators: [], defaultFileExtension: 'py' },
      ),
    };

    const entrypointFilePath = `${WORKSPACE_BASE_PATHS[workspaceLocation]}/program.py`;

    return expectSaga(workspaceSaga)
      .withState(newDefaultState)
      .provide([[matchers.call.fn(evalCodeConductorSaga), undefined]])
      .call.like({
        fn: evalCodeConductorSaga,
        args: [{ [entrypointFilePath]: editorValue }],
      })
      .dispatch({
        type: WorkspaceActions.evalEditor.type,
        payload: { workspaceLocation },
      })
      .silentRun();
  });
});

/**
 * A minimal fake Conductor host driving evalCodeConductorSaga's real session-management logic
 * while faking only the underlying Worker transport. startEvaluator()/sendChunk() each simulate a
 * chunk settling on the next microtask by calling back through whatever handleStatuses (spawned
 * for real, not mocked) assigned to hostPlugin.receiveStatusUpdate - mirroring conductor's own
 * BasicEvaluator chunk loop (RUNNING, then EVAL_READY between chunks - see
 * source-academy/conductor#66), unless overridden via `nextStatus`.
 *
 * `options.error`, if given, is delivered through hostPlugin.receiveError on the *next* settle -
 * simulating the runner reporting an error (e.g. a py-slang EvaluatorError) on this chunk, the way
 * conductor's RunnerPlugin.sendError does - before the chunk's own status update. Like
 * `setNextStatus` below, it can also be changed later via `setNextError` for a later chunk (e.g. a
 * REPL line sent to an already-live session) sent to this same fake.
 */
function makeFakeConductor(
  options: { error?: unknown; lateOutput?: string[]; hold?: boolean } = {},
) {
  const sentChunks: string[] = [];
  const terminate = vi.fn();
  let nextStatus: RunnerStatus = RunnerStatus.EVAL_READY;
  let nextError: unknown = options.error;
  const settle = () => {
    Promise.resolve().then(async () => {
      if (nextError !== undefined) {
        hostPlugin.receiveError?.(nextError);
      }
      // `options.lateOutput`: the lines the program printed before the error, delivered after it
      // (each conductor channel is its own MessagePort, so the error can overtake them) and
      // counted in the status update's sentCount the way RunnerPlugin counts them.
      const late = options.lateOutput ?? [];
      for (const line of late) {
        await new Promise(resolve => setTimeout(resolve, 0));
        hostPlugin.receiveOutput?.(line);
      }
      const sentCount = late.length + (nextError !== undefined && options.lateOutput ? 1 : 0);
      hostPlugin.receiveStatusUpdate?.(RunnerStatus.RUNNING, true, sentCount);
      hostPlugin.receiveStatusUpdate?.(nextStatus, true, sentCount);
    });
  };
  // A pending Promise models a chunk that is still running: `hold` leaves startEvaluator (and
  // sendChunk) unresolved until the test emits a status manually.
  const held = () => new Promise<void>(() => {});
  const hostPlugin: any = {
    startEvaluator: vi.fn(() => (options.hold ? held() : settle())),
    sendChunk: vi.fn((chunk: string) => {
      sentChunks.push(chunk);
      if (!options.hold) {
        settle();
      }
    }),
  };
  const csePlugin: any = { sendSnapshots: vi.fn() };
  const conduit: any = { terminate };
  return {
    hostPlugin,
    csePlugin,
    conduit,
    sentChunks,
    terminate,
    /** Makes the *next* settle() report `status` instead of the default EVAL_READY - e.g.
     * RunnerStatus.STOPPED, to simulate the runner (or Stop) ending the session. */
    setNextStatus: (status: RunnerStatus) => {
      nextStatus = status;
    },
    /** Makes the *next* settle() also deliver `error` through hostPlugin.receiveError first, or
     * stop delivering one if called with `undefined`. */
    setNextError: (error: unknown) => {
      nextError = error;
    },
    /** Delivers a status directly, as a held runner would when its current chunk ends. */
    emitStatus: (status: RunnerStatus, isActive: boolean = true, sentCount: number = 0) => {
      hostPlugin.receiveStatusUpdate?.(status, isActive, sentCount);
    },
  };
}

describe('EVAL_REPL session persistence under Conductor', () => {
  const workspaceLocation: WorkspaceLocation = 'playground';

  test('a REPL chunk after a Run reuses the live session instead of requesting a new conductor', async () => {
    const fake = makeFakeConductor();
    const state = generateDefaultState(workspaceLocation);
    const providers: [Matcher, unknown][] = [
      [matchers.call.fn(getEvaluatorDefinitionSaga), { path: 'fake-evaluator-path' }],
      [matchers.call.fn(getPreparedConductorSaga), fake],
      [matchers.spawn.fn(preloadConductorEvaluatorSaga), undefined],
    ];

    // A Run establishes the session.
    await expectSaga(
      evalCodeConductorSaga,
      { '/code.js': 'x = 1' },
      '/code.js',
      workspaceLocation,
      WorkspaceActions.evalEditor.type,
    )
      .withState(state)
      .provide([...providers])
      .call.fn(getPreparedConductorSaga)
      .silentRun();

    expect(fake.hostPlugin.startEvaluator).toHaveBeenCalledTimes(1);

    // A REPL line reuses that same session: no new conductor requested, the line is sent as a
    // chunk to the already-live evaluator, and (since this test ends it with STOPPED) the
    // session's own conduit - not a fresh one - is what gets terminated.
    fake.setNextStatus(RunnerStatus.STOPPED);
    await expectSaga(
      evalCodeConductorSaga,
      { '/code.js': 'print(x)' },
      '/code.js',
      workspaceLocation,
      WorkspaceActions.evalRepl.type,
    )
      .withState(state)
      .provide([...providers])
      .not.call.fn(getPreparedConductorSaga)
      .silentRun();

    expect(fake.sentChunks).toEqual(['print(x)']);
    expect(fake.terminate).toHaveBeenCalledTimes(1);
  });

  test('a REPL submission with no prior Run establishes its own session from just that line', async () => {
    const fake = makeFakeConductor();
    const state = generateDefaultState(workspaceLocation);

    fake.setNextStatus(RunnerStatus.STOPPED);
    await expectSaga(
      evalCodeConductorSaga,
      { '/code.js': 'x = 1' },
      '/code.js',
      workspaceLocation,
      WorkspaceActions.evalRepl.type,
    )
      .withState(state)
      .provide([
        [matchers.call.fn(getEvaluatorDefinitionSaga), { path: 'fake-evaluator-path' }],
        [matchers.call.fn(getPreparedConductorSaga), fake],
        [matchers.spawn.fn(preloadConductorEvaluatorSaga), undefined],
      ])
      .call.fn(getPreparedConductorSaga)
      .silentRun();

    expect(fake.hostPlugin.startEvaluator).toHaveBeenCalledWith('/code.js');
    expect(fake.terminate).toHaveBeenCalledTimes(1);
  });

  test('a late status from a superseded session cannot hide the new Run Stop button', async () => {
    // Regression test for source-academy/frontend#4555, including the follow-up review finding:
    // cancelling a still-running Run leaves its handlers alive for the teardown delay. A status
    // that arrives in that window used to clear isRunning after the replacement Run had set it,
    // hiding Stop for the new program.
    const firstFake = makeFakeConductor({ hold: true });
    const secondFake = makeFakeConductor({ hold: true });
    const state = generateDefaultState(workspaceLocation);
    const runningValues: boolean[] = [];
    let preparedCalls = 0;
    let valuesBeforeSecondTeardown: boolean[] = [];

    function* overlappingRuns(): SagaIterator {
      const first = yield fork(
        evalCodeConductorSaga,
        { '/code.py': 'print(1)' },
        '/code.py',
        workspaceLocation,
        WorkspaceActions.evalEditor.type,
      );
      // Let the first Run establish its session and block on its (held) first chunk.
      while (firstFake.hostPlugin.startEvaluator.mock.calls.length === 0) {
        yield delay(1);
      }

      // Cancel the first Run and let its asynchronous teardown start without awaiting it, as
      // takeLatest does. Its session is removed immediately; its handlers survive for the delay.
      yield fork(function* () {
        yield cancel(first);
      });
      yield delay(10);

      const second = yield fork(
        evalCodeConductorSaga,
        { '/code.py': 'while True:\n    pass' },
        '/code.py',
        workspaceLocation,
        WorkspaceActions.evalEditor.type,
      );
      // Wait until the replacement Run has claimed the generation and marked itself running.
      while (runningValues.filter(Boolean).length < 2) {
        yield delay(1);
      }

      // The superseded session reports a chunk boundary while its teardown is still in flight.
      firstFake.emitStatus(RunnerStatus.EVAL_READY, true, 0);
      yield delay(50);

      valuesBeforeSecondTeardown = [...runningValues];
      yield cancel(second);
    }

    await expectSaga(overlappingRuns)
      .withState(state)
      .provide([
        [matchers.call.fn(getEvaluatorDefinitionSaga), { path: 'fake-evaluator-path' }],
        [matchers.spawn.fn(preloadConductorEvaluatorSaga), undefined],
        {
          call(effect, next) {
            if (effect.fn === getPreparedConductorSaga) {
              return preparedCalls++ === 0 ? firstFake : secondFake;
            }
            return next();
          },
        },
        {
          put(effect, next) {
            if (effect.action.type === InterpreterActions.setIsRunning.type) {
              runningValues.push(effect.action.payload.isRunning);
            }
            return next();
          },
        },
      ])
      .silentRun(2000);

    // Both Runs marked themselves running, and the superseded session's late EVAL_READY did not
    // clear that state before the replacement Run was torn down by this test.
    expect(valuesBeforeSecondTeardown.filter(Boolean)).toHaveLength(2);
    expect(valuesBeforeSecondTeardown.filter(value => !value)).toHaveLength(0);
    expect(secondFake.hostPlugin.startEvaluator).toHaveBeenCalledTimes(1);
  });

  test('the evalRepl handler does not dispatch beginInterruptExecution before the Conductor branch', () => {
    // Dispatch-level check (through the real workspaceSaga -> evalRepl handler, not
    // evalCodeConductorSaga directly, unlike the tests above): a regression where
    // workspaceSaga's evalRepl handler dispatches beginInterruptExecution before reaching the
    // Conductor branch would end the live REPL session on every single submission, even though
    // evalCodeConductorSaga itself never called anything that would catch that.
    const replValue = 'x = 1';
    const newState = {
      ...generateDefaultState(workspaceLocation, { replValue }),
    };

    return expectSaga(workspaceSaga)
      .withState(newState)
      .provide([[matchers.call.fn(evalCodeConductorSaga), undefined]])
      .not.put(InterpreterActions.beginInterruptExecution(workspaceLocation))
      .call.like({ fn: evalCodeConductorSaga })
      .dispatch({
        type: WorkspaceActions.evalRepl.type,
        payload: { workspaceLocation },
      })
      .silentRun();
  });
});

describe('Conductor runtime errors keep the output printed before them (source-academy/frontend#4406)', () => {
  const workspaceLocation: WorkspaceLocation = 'playground';

  test('output that arrives after the error is still shown, and the worker is stopped only afterwards', async () => {
    // A real Error instance, as a runtime error arrives after a Worker's structured clone:
    // redux-saga's take throws an Error taken from a channel into the generator, which used to
    // send it down handleErrors' interrupting catch path and tear the Worker down before the
    // lines printed ahead of the error had been received.
    const printed = ['1', '2', '3'];
    const fake = makeFakeConductor({
      error: new TypeError('unsupported argument type for head: None'),
      lateOutput: printed,
    });
    fake.setNextStatus(RunnerStatus.STOPPED);
    const state = generateDefaultState(workspaceLocation);

    const shown: string[] = [];
    let terminatedAfter = -1;
    fake.terminate.mockImplementation(() => {
      terminatedAfter = shown.length;
    });
    await expectSaga(
      evalCodeConductorSaga,
      { '/code.py': 'print(1)' },
      '/code.py',
      workspaceLocation,
      WorkspaceActions.evalEditor.type,
    )
      .withState(state)
      .provide([
        [matchers.call.fn(getEvaluatorDefinitionSaga), { path: 'fake-evaluator-path' }],
        [matchers.call.fn(getPreparedConductorSaga), fake],
        [matchers.spawn.fn(preloadConductorEvaluatorSaga), undefined],
        {
          put(effect, next) {
            if (effect.action.type === InterpreterActions.handleConsoleLog.type) {
              shown.push(...effect.action.payload.logString);
            }
            return next();
          },
        },
      ])
      .silentRun(1000);

    expect(shown).toEqual(printed);
    expect(terminatedAfter).toBe(printed.length);
  });
});

describe('Conductor errors subtract the prepend line shift (source-academy/frontend#4244)', () => {
  const workspaceLocation: WorkspaceLocation = 'playground';

  test("a one-line prepend shifts a reported error line back to the student's own line", async () => {
    // Mirrors the reported bug exactly: a one-line PREPEND made every error line off-by-one.
    // evalEditorSaga concatenates `${prepend}\n${entrypoint}` before this saga ever runs (see
    // toConductorInterpreterError's doc comment), so the student's own first line becomes combined-file
    // line 2 - simulate the evaluator (e.g. py-slang) reporting an error there via a structured,
    // EvaluatorError-shaped object (line/column/rawMessage own properties survive a Worker's
    // postMessage structured clone even though the class prototype doesn't).
    const programPrependValue = 'COUNTER = 0';
    const editorValue = 'undefined_name';
    const entrypointFilePath = '/code.py';
    const fakeError = {
      name: 'EvaluatorRuntimeError',
      line: 2,
      column: 0,
      rawMessage: "NameError: name 'undefined_name' is not defined",
      message: "2:0: NameError: name 'undefined_name' is not defined",
    };
    const fake = makeFakeConductor({ error: fakeError });
    fake.setNextStatus(RunnerStatus.STOPPED);
    const state = generateDefaultState(workspaceLocation, {
      programPrependValue,
      editorTabs: [{ value: editorValue, highlightedLines: [], breakpoints: [] }],
      activeEditorTabIndex: 0,
    });

    let capturedErrors: InterpreterError[] | undefined;
    await expectSaga(
      evalCodeConductorSaga,
      { [entrypointFilePath]: `${programPrependValue}\n${editorValue}` },
      entrypointFilePath,
      workspaceLocation,
      WorkspaceActions.evalEditor.type,
    )
      .withState(state)
      .provide([
        [matchers.call.fn(getEvaluatorDefinitionSaga), { path: 'fake-evaluator-path' }],
        [matchers.call.fn(getPreparedConductorSaga), fake],
        [matchers.spawn.fn(preloadConductorEvaluatorSaga), undefined],
        {
          put(effect, next) {
            if (effect.action.type === InterpreterActions.appendInterpreterError.type) {
              capturedErrors = effect.action.payload.errors;
            }
            return next();
          },
        },
      ])
      .silentRun();

    expect(capturedErrors).toHaveLength(1);
    // Corrected back to the student's own line 1 (2 minus the 1-line prepend), not the raw
    // combined-file line 2 the evaluator actually reported.
    expect(capturedErrors![0].location.start.line).toBe(1);
    expect(capturedErrors![0].explain()).toBe("NameError: name 'undefined_name' is not defined");
  });

  test("a REPL chunk sent to an already-live session is not shifted by that session's own prepend", async () => {
    // The offset only applies to a session's initial entrypoint chunk (which had prepend
    // concatenated onto it) - a REPL line sent afterwards is raw input with no prepend involved,
    // so an error there must be reported as-is, not shifted by the Run's prepend all over again.
    const programPrependValue = 'COUNTER = 0';
    const state = generateDefaultState(workspaceLocation, { programPrependValue });
    const providers: [Matcher, unknown][] = [
      [matchers.call.fn(getEvaluatorDefinitionSaga), { path: 'fake-evaluator-path' }],
      [matchers.spawn.fn(preloadConductorEvaluatorSaga), undefined],
    ];

    // A Run establishes the session (no error on this chunk). handleErrors is spawn()ed as a
    // detached task inside *this* expectSaga call and keeps running (and keeps dispatching
    // through *this* call's own store/middleware) after this call's own silentRun() resolves -
    // it's the same task that later handles the REPL chunk's error below, so the put-capturing
    // provider has to be registered here, not on the second expectSaga call, to see it.
    let capturedErrors: InterpreterError[] | undefined;
    const runFake = makeFakeConductor();
    await expectSaga(
      evalCodeConductorSaga,
      { '/code.py': `${programPrependValue}\nx = 1` },
      '/code.py',
      workspaceLocation,
      WorkspaceActions.evalEditor.type,
    )
      .withState(state)
      .provide([
        ...providers,
        [matchers.call.fn(getPreparedConductorSaga), runFake],
        {
          put(effect, next) {
            if (effect.action.type === InterpreterActions.appendInterpreterError.type) {
              capturedErrors = effect.action.payload.errors;
            }
            return next();
          },
        },
      ])
      .silentRun();

    // A later REPL line reuses that live session and errors on its own (unshifted) line 1.
    runFake.setNextError({
      name: 'EvaluatorRuntimeError',
      line: 1,
      column: 0,
      rawMessage: "NameError: name 'undefined_name' is not defined",
      message: "1:0: NameError: name 'undefined_name' is not defined",
    });
    runFake.setNextStatus(RunnerStatus.STOPPED);
    await expectSaga(
      evalCodeConductorSaga,
      { '/code.py': 'undefined_name' },
      '/code.py',
      workspaceLocation,
      WorkspaceActions.evalRepl.type,
    )
      .withState(state)
      .provide([...providers])
      .silentRun();

    expect(capturedErrors).toHaveLength(1);
    // Reported as-is (line 1), not shifted down by the Run's prepend all over again.
    expect(capturedErrors![0].location.start.line).toBe(1);
  });
});

describe('EVAL_TESTCASE under Conductor (runTestCaseConductor)', () => {
  const workspaceLocation: WorkspaceLocation = 'grading';
  const programPrependValue = 'COUNTER = 0';
  const editorValue = 'def f():\n    return True';
  const programPostpendValue = 'RESULT = f()';
  const testcaseProgram = 'print(RESULT)';
  const testcaseId = 0;
  const gradedState = (payload: object) =>
    withGraderQuestion(generateDefaultState(workspaceLocation, payload), {
      language: 'python4',
      evaluator: 'python4Py2js',
    });

  test('runs prepend+code+postpend+testcase as a single concatenated Conductor call', () => {
    return expectSaga(
      runTestCaseConductor,
      workspaceLocation,
      testcaseId,
      editorValue,
      testcaseProgram,
      TestcaseTypes.public,
      programPrependValue,
      programPostpendValue,
    )
      .withState(
        gradedState({
          output: [],
        }),
      )
      .provide([[matchers.call.fn(evalCodeConductorSaga), undefined]])
      .call.like({
        fn: evalCodeConductorSaga,
        args: [
          {
            '/testcase.py': [
              programPrependValue,
              editorValue,
              `__program__ = ${JSON.stringify(editorValue)}`,
              programPostpendValue,
              testcaseProgram,
            ].join('\n'),
          },
        ],
      })
      .silentRun();
  });

  test('makes the student source available as a string for postpend to inspect', () => {
    // Since grading always runs under the top chapter regardless of the student's own
    // sub-chapter, a postpend wanting to enforce e.g. "no loops" has to do so itself via
    // the chapter-4 parse() builtin - which needs the student's source as a string, not
    // just as already-executed code.
    const editorValueWithQuotesAndNewlines = 'x = "a\\nb"\ndef f():\n    return x';

    return expectSaga(
      runTestCaseConductor,
      workspaceLocation,
      testcaseId,
      editorValueWithQuotesAndNewlines,
      testcaseProgram,
      TestcaseTypes.public,
      programPrependValue,
      programPostpendValue,
    )
      .withState(
        gradedState({
          output: [],
        }),
      )
      .provide([[matchers.call.fn(evalCodeConductorSaga), undefined]])
      .call.like({
        fn: evalCodeConductorSaga,
        args: [
          {
            '/testcase.py': [
              programPrependValue,
              editorValueWithQuotesAndNewlines,
              `__program__ = ${JSON.stringify(editorValueWithQuotesAndNewlines)}`,
              programPostpendValue,
              testcaseProgram,
            ].join('\n'),
          },
        ],
      })
      .silentRun();
  });

  test('an OCaml question runs its testcase as an .ml file, without the Python __program__ line', () => {
    const ocaml = {
      id: 'ocaml',
      name: 'OCaml',
      evaluators: [{ id: 'ocamlJsOfOCaml' }],
      defaultFileExtension: 'ml',
    };
    const named = { chapter: 1, language: 'ocaml', evaluator: 'ocamlJsOfOCaml' };
    const base = generateDefaultState(workspaceLocation, {
      output: [],
      currentSubmission: 9,
      currentQuestion: 0,
    });
    const state = {
      ...base,
      session: {
        ...base.session,
        gradings: { 9: { answers: [{ question: { library: named } }] } } as any,
      },
      languageDirectory: {
        ...base.languageDirectory,
        languages: [ocaml] as any,
        languageMap: { ocaml } as any,
      },
    } as OverallState;

    return expectSaga(
      runTestCaseConductor,
      workspaceLocation,
      testcaseId,
      'let f () = true',
      ';; f ()',
      TestcaseTypes.public,
      '',
      '',
    )
      .withState(state)
      .provide([[matchers.call.fn(evalCodeConductorSaga), undefined]])
      .call.like({
        fn: evalCodeConductorSaga,
        args: [{ '/testcase.ml': ['let f () = true', ';; f ()'].join('\n') }],
      })
      .silentRun();
  });

  test('grades by the last printed line, not a returned value', () => {
    let capturedValue: string | undefined;

    return expectSaga(
      runTestCaseConductor,
      workspaceLocation,
      testcaseId,
      editorValue,
      testcaseProgram,
      TestcaseTypes.public,
      programPrependValue,
      programPostpendValue,
    )
      .withState(
        gradedState({
          // Simulate a completed Conductor run whose last printed line was "True" -
          // note there is no distinct 'result' value, matching Python's script-level
          // semantics of not producing a REPL-style last-expression value.
          output: [{ type: 'result', consoleLogs: ['True'] } as any],
        }),
      )
      .provide([
        [matchers.call.fn(evalCodeConductorSaga), undefined],
        {
          put(effect, next) {
            if (effect.action.type === InterpreterActions.evalTestcaseSuccess.type) {
              capturedValue = effect.action.payload.value;
            }
            return next();
          },
        },
      ])
      .put.like({
        action: {
          type: InterpreterActions.evalTestcaseSuccess.type,
          payload: { workspaceLocation, index: testcaseId },
        },
      })
      .run()
      .then(() => {
        expect(capturedValue).toBe('True');
      });
  });

  test('finds printed output even when the trailing output entry has no consoleLogs of its own', () => {
    let capturedValue: string | undefined;

    return expectSaga(
      runTestCaseConductor,
      workspaceLocation,
      testcaseId,
      editorValue,
      testcaseProgram,
      TestcaseTypes.public,
      programPrependValue,
      programPostpendValue,
    )
      .withState(
        gradedState({
          // stdout and result messages travel on separate Conductor channels with no
          // guaranteed relative ordering, and output is never cleared between runs -
          // so the printed text can end up on an earlier entry than the trailing one.
          output: [{ type: 'result', consoleLogs: ['True'] }, { type: 'result' }] as any,
        }),
      )
      .provide([
        [matchers.call.fn(evalCodeConductorSaga), undefined],
        {
          put(effect, next) {
            if (effect.action.type === InterpreterActions.evalTestcaseSuccess.type) {
              capturedValue = effect.action.payload.value;
            }
            return next();
          },
        },
      ])
      .run()
      .then(() => {
        expect(capturedValue).toBe('True');
      });
  });

  test('reports failure without crashing when the Conductor run errors', () => {
    const errors: InterpreterError[] = [
      {
        type: ErrorType.RUNTIME,
        severity: 'Error' as any,
        location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
        explain: () => 'boom',
        elaborate: () => '',
      },
    ];

    return expectSaga(
      runTestCaseConductor,
      workspaceLocation,
      testcaseId,
      editorValue,
      testcaseProgram,
      TestcaseTypes.public,
      programPrependValue,
      programPostpendValue,
    )
      .withState(
        gradedState({
          output: [{ type: 'errors', errors } as any],
        }),
      )
      .provide([[matchers.call.fn(evalCodeConductorSaga), undefined]])
      .put.like({
        action: {
          type: InterpreterActions.evalTestcaseFailure.type,
          payload: { workspaceLocation, index: testcaseId },
        },
      })
      .silentRun();
  });

  test('excludes prepend from a Conductor testcase error location (source-academy/frontend#4244)', () => {
    // Two lines, so combinedCode's own line 3 is `editorValue`'s line 1 - see
    // runTestCaseConductor's combinedCode, which joins prepend/value/.../testcase with '\n'.
    const twoLinePrepend = 'COUNTER = 0\nDOUBLE = 2';
    const errors: InterpreterError[] = [
      {
        type: ErrorType.RUNTIME,
        severity: 'Error' as any,
        location: { start: { line: 3, column: 2 }, end: { line: 3, column: 2 } },
        explain: () => 'boom',
        elaborate: () => '',
      },
    ];
    let capturedErrors: InterpreterError[] | undefined;

    return expectSaga(
      runTestCaseConductor,
      workspaceLocation,
      testcaseId,
      editorValue,
      testcaseProgram,
      TestcaseTypes.public,
      twoLinePrepend,
      programPostpendValue,
    )
      .withState(
        gradedState({
          output: [{ type: 'errors', errors } as any],
        }),
      )
      .provide([
        [matchers.call.fn(evalCodeConductorSaga), undefined],
        {
          put(effect, next) {
            if (effect.action.type === InterpreterActions.evalTestcaseFailure.type) {
              capturedErrors = effect.action.payload.value;
            }
            return next();
          },
        },
      ])
      .silentRun()
      .then(() => {
        expect(capturedErrors).toHaveLength(1);
        // Reported as line 1 of the student's own code, not line 3 of the prepend-inclusive
        // combined file.
        expect(capturedErrors![0].location.start.line).toBe(1);
        expect(capturedErrors![0].location.end.line).toBe(1);
      });
  });

  test('leaves a Conductor testcase error with no location info (line 0) unshifted', () => {
    const errors: InterpreterError[] = [
      {
        type: ErrorType.RUNTIME,
        severity: 'Error' as any,
        location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
        explain: () => 'boom',
        elaborate: () => '',
      },
    ];
    let capturedErrors: InterpreterError[] | undefined;

    return expectSaga(
      runTestCaseConductor,
      workspaceLocation,
      testcaseId,
      editorValue,
      testcaseProgram,
      TestcaseTypes.public,
      programPrependValue,
      programPostpendValue,
    )
      .withState(
        gradedState({
          output: [{ type: 'errors', errors } as any],
        }),
      )
      .provide([
        [matchers.call.fn(evalCodeConductorSaga), undefined],
        {
          put(effect, next) {
            if (effect.action.type === InterpreterActions.evalTestcaseFailure.type) {
              capturedErrors = effect.action.payload.value;
            }
            return next();
          },
        },
      ])
      .silentRun()
      .then(() => {
        expect(capturedErrors).toHaveLength(1);
        expect(capturedErrors![0].location.start.line).toBe(0);
      });
  });
});

describe('NAV_DECLARATION', () => {
  let workspaceLocation: WorkspaceLocation;
  let editorValue: string;
  let state: OverallState;

  beforeEach(() => {
    workspaceLocation = 'playground';
    editorValue = 'const foo = (x) => -1; foo(2);';
    state = generateDefaultState(workspaceLocation, {
      editorTabs: [{ value: editorValue }],
    });
  });

  test('moves cursor to declaration correctly', () => {
    const loc = { row: 0, column: 24 };
    const resultLoc = { row: 0, column: 6 };
    return (
      expectSaga(workspaceSaga)
        .withState(state)
        .dispatch({
          type: WorkspaceActions.navigateToDeclaration.type,
          payload: { workspaceLocation, cursorPosition: loc },
        })
        // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
        .put(WorkspaceActions.moveCursor(workspaceLocation, 0, resultLoc))
        .silentRun()
    );
  });

  test('does not move cursor if node is not an identifier', () => {
    const pos = { row: 0, column: 27 };
    const resultPos = { row: 0, column: 6 };
    return (
      expectSaga(workspaceSaga)
        .withState(state)
        .dispatch({
          type: WorkspaceActions.navigateToDeclaration.type,
          payload: { workspaceLocation, cursorPosition: pos },
        })
        // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
        .not.put(WorkspaceActions.moveCursor(workspaceLocation, 0, resultPos))
        .silentRun()
    );
  });

  test('does not move cursor if node is same as declaration', () => {
    const pos = { row: 0, column: 7 };
    const resultPos = { row: 0, column: 6 };
    return (
      expectSaga(workspaceSaga)
        .withState(state)
        .dispatch({
          type: WorkspaceActions.navigateToDeclaration.type,
          payload: { workspaceLocation, cursorPosition: pos },
        })
        // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
        .not.put(WorkspaceActions.moveCursor(workspaceLocation, 0, resultPos))
        .silentRun()
    );
  });
});

describe('EVAL_EDITOR_AND_TESTCASES', () => {
  let workspaceLocation: WorkspaceLocation;
  let state: OverallState;

  beforeEach(() => {
    workspaceLocation = 'assessment';
    state = generateDefaultState(workspaceLocation);
  });

  test('does not call runTestCase when there are no testcases', () => {
    state = generateDefaultState(workspaceLocation, {
      editorTestcases: [],
    });

    return expectSaga(workspaceSaga)
      .withState(state)
      .call.fn(evalEditorSaga)
      .not.call.fn(showSuccessMessage)
      .not.call.fn(runTestCase)
      .dispatch({
        type: WorkspaceActions.runAllTestcases.type,
        payload: { workspaceLocation },
      })
      .silentRun();
  });

  test('calls runTestCase when there are testcases', () => {
    state = withGraderQuestion(
      generateDefaultState(workspaceLocation, {
        editorTestcases: mockTestcases,
      }),
      { language: 'python4', evaluator: 'python4Py2js' },
    );

    return expectSaga(workspaceSaga)
      .withState(state)
      .dispatch({
        type: WorkspaceActions.runAllTestcases.type,
        payload: { workspaceLocation },
      })
      .call(showSuccessMessage, 'Running all testcases!', 2000)
      .call.fn(evalEditorSaga)
      .call(runTestCase, workspaceLocation, 0, true)
      .call(runTestCase, workspaceLocation, 1, true)
      .call(runTestCase, workspaceLocation, 2, true)
      .call(runTestCase, workspaceLocation, 3, true)
      .provide([
        [call(runTestCase, workspaceLocation, 0, true), true],
        [call(runTestCase, workspaceLocation, 1, true), true],
        [call(runTestCase, workspaceLocation, 2, true), true],
        [call(runTestCase, workspaceLocation, 3, true), true],
        [matchers.call.fn(evalEditorSaga), undefined],
      ])
      .silentRun(2000);
  });

  test('prematurely terminates if execution of one testcase results in an error', () => {
    state = withGraderQuestion(
      generateDefaultState(workspaceLocation, {
        editorTestcases: mockTestcases.slice(0, 2),
      }),
      { language: 'python4', evaluator: 'python4Py2js' },
    );

    return expectSaga(workspaceSaga)
      .withState(state)
      .dispatch({
        type: WorkspaceActions.runAllTestcases.type,
        payload: { workspaceLocation },
      })
      .call(showSuccessMessage, 'Running all testcases!', 2000)
      .call.fn(evalEditorSaga)
      .call(runTestCase, workspaceLocation, 0, true)
      .not.call(runTestCase, workspaceLocation, 1, true)
      .not.call(runTestCase, workspaceLocation, 2, true)
      .not.call(runTestCase, workspaceLocation, 3, true)
      .provide([
        [call(runTestCase, workspaceLocation, 0, true), false],
        [matchers.call.fn(evalEditorSaga), undefined],
      ])
      .silentRun(2000);
  });

  test('switches the test-case language once for the whole batch instead of once per testcase', () => {
    state = withGraderQuestion(
      {
        ...generateDefaultState(workspaceLocation, { editorTestcases: mockTestcases }),
        languageDirectory: {
          ...defaultState.languageDirectory,
          selectedLanguageId: 'python1',
          selectedEvaluatorId: 'python1Py2js',
        },
      },
      { language: 'python4', evaluator: 'python4Py2js' },
    );

    const capturedSkipFlags: unknown[] = [];
    let setTestCaseLanguageCount = 0;
    let setTestCaseEvaluatorCount = 0;
    let restoreLanguageCount = 0;
    let restoreEvaluatorCount = 0;

    return expectSaga(workspaceSaga)
      .withState(state)
      .provide([
        {
          call(effect, next) {
            if (effect.fn === runTestCase) {
              capturedSkipFlags.push(effect.args[2]);
              return true;
            }
            return next();
          },
          put(effect, next) {
            if (effect.action.type === LanguageDirectoryActions.setSelectedLanguage.type) {
              if (effect.action.payload.languageId === 'python4') {
                setTestCaseLanguageCount++;
              } else if (effect.action.payload.languageId === 'python1') {
                restoreLanguageCount++;
              }
            }
            if (effect.action.type === LanguageDirectoryActions.setSelectedEvaluator.type) {
              if (effect.action.payload.evaluatorId === 'python4Py2js') {
                setTestCaseEvaluatorCount++;
              } else if (effect.action.payload.evaluatorId === 'python1Py2js') {
                restoreEvaluatorCount++;
              }
            }
            return next();
          },
        },
        [matchers.call.fn(evalEditorSaga), undefined],
        [matchers.call.fn(showSuccessMessage), undefined],
      ])
      .dispatch({
        type: WorkspaceActions.runAllTestcases.type,
        payload: { workspaceLocation },
      })
      .run(2000)
      .then(() => {
        expect(capturedSkipFlags).toEqual([true, true, true, true]);
        expect(setTestCaseLanguageCount).toBe(1);
        expect(setTestCaseEvaluatorCount).toBe(1);
        expect(restoreLanguageCount).toBe(1);
        expect(restoreEvaluatorCount).toBe(1);
      });
  });
});

describe('runTestCaseConductor for Python §4 Typed', () => {
  test('runs one test case under the typed evaluator and restores the selection, also after an error', () => {
    const workspaceLocation: WorkspaceLocation = 'grading';
    const state: OverallState = withGraderQuestion(
      {
        ...generateDefaultState(workspaceLocation, { output: [] }),
        languageDirectory: {
          ...defaultState.languageDirectory,
          selectedLanguageId: 'python4Typed',
          selectedEvaluatorId: 'python4TypedPy2js',
        },
      },
      { language: 'python4Typed', evaluator: 'python4TypedPy2js' },
    );
    const languages: string[] = [];
    const evaluators: string[] = [];

    return expectSaga(
      runTestCaseConductor,
      workspaceLocation,
      0,
      'def f(x: int) -> int:\n    return x',
      'print(f(1))',
      TestcaseTypes.public,
      '',
      '',
    )
      .withState(state)
      .provide([
        {
          call(effect, next) {
            // the evaluation fails, as a type error does
            return effect.fn === evalCodeConductorSaga
              ? Promise.reject(new Error('type error'))
              : next();
          },
          put(effect, next) {
            if (effect.action.type === LanguageDirectoryActions.setSelectedLanguage.type) {
              languages.push(effect.action.payload.languageId);
            }
            if (effect.action.type === LanguageDirectoryActions.setSelectedEvaluator.type) {
              evaluators.push(effect.action.payload.evaluatorId);
            }
            return next();
          },
        },
      ])
      .run()
      .catch(() => undefined)
      .then(() => {
        // Never python4/python4Py2js (which rejects annotations); selected, then restored.
        expect(languages).toEqual(['python4Typed', 'python4Typed']);
        expect(evaluators).toEqual(['python4TypedPy2js', 'python4TypedPy2js']);
      });
  });
});

describe('runAllTestcases for Python §4 Typed', () => {
  test('grades under the typed evaluator and restores the selection', () => {
    const workspaceLocation: WorkspaceLocation = 'assessment';
    const state: OverallState = withGraderQuestion(
      {
        ...generateDefaultState(workspaceLocation, { editorTestcases: mockTestcases }),
        languageDirectory: {
          ...defaultState.languageDirectory,
          selectedLanguageId: 'python4Typed',
          selectedEvaluatorId: 'python4TypedPy2js',
        },
      },
      { language: 'python4Typed', evaluator: 'python4TypedPy2js' },
    );
    const languages: string[] = [];
    const evaluators: string[] = [];

    return expectSaga(workspaceSaga)
      .withState(state)
      .provide([
        {
          call(effect, next) {
            return effect.fn === runTestCase ? true : next();
          },
          put(effect, next) {
            if (effect.action.type === LanguageDirectoryActions.setSelectedLanguage.type) {
              languages.push(effect.action.payload.languageId);
            }
            if (effect.action.type === LanguageDirectoryActions.setSelectedEvaluator.type) {
              evaluators.push(effect.action.payload.evaluatorId);
            }
            return next();
          },
        },
        [matchers.call.fn(evalEditorSaga), undefined],
        [matchers.call.fn(showSuccessMessage), undefined],
      ])
      .dispatch({ type: WorkspaceActions.runAllTestcases.type, payload: { workspaceLocation } })
      .run(2000)
      .then(() => {
        // Set once for the batch and restored once: never python4/python4Py2js, which rejects
        // type annotations.
        expect(languages).toEqual(['python4Typed', 'python4Typed']);
        expect(evaluators).toEqual(['python4TypedPy2js', 'python4TypedPy2js']);
      });
  });
});

describe('VERSION_HISTORY', () => {
  // Helper to build state with proper assessment/grading data so getCurrentQuestionId
  // can resolve the actual question ID from the question index.
  const mockAssessmentId = 42;
  const mockQuestionDbId = 101; // The actual DB question ID
  const mockQuestionIndex = 0; // The index in the questions array
  const mockSubmissionId = 7;

  function versionHistoryState(
    workspaceLocation: WorkspaceLocation,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    const workspacePayload: any = { currentQuestion: mockQuestionIndex };
    if (workspaceLocation === 'assessment') {
      workspacePayload.currentAssessment = mockAssessmentId;
    }
    if (workspaceLocation === 'grading') {
      workspacePayload.currentSubmission = mockSubmissionId;
    }

    const state = generateDefaultState(workspaceLocation, workspacePayload);

    const sessionOverrides: any = {
      ...state.session,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };

    if (workspaceLocation === 'assessment') {
      sessionOverrides.assessments = {
        [mockAssessmentId]: {
          questions: [{ id: mockQuestionDbId }],
        },
      };
    }

    if (workspaceLocation === 'grading') {
      sessionOverrides.gradings = {
        [mockSubmissionId]: {
          answers: [{ question: { id: mockQuestionDbId } }],
        },
      };
    }

    return { ...state, session: sessionOverrides };
  }

  describe('FETCH_VERSION_HISTORY', () => {
    test('fetches version history successfully', () => {
      const workspaceLocation = 'assessment';
      const tokens = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      };

      const mockVersions = [
        {
          id: 'v1',
          code: 'const x = 1;',
          timestamp: 1234567890,
          name: 'Version 1',
        },
        {
          id: 'v2',
          code: 'const x = 2;',
          timestamp: 1234567900,
        },
      ];

      const state = versionHistoryState(workspaceLocation, tokens);

      return expectSaga(workspaceSaga)
        .withState(state)
        .provide([[matchers.call.fn(getVersionHistory), mockVersions]])
        .put(WorkspaceActions.receiveVersionHistory(workspaceLocation, mockVersions))
        .dispatch({
          type: WorkspaceActions.fetchVersionHistory.type,
          payload: { workspaceLocation },
        })
        .dispatch(WorkspaceActions.updateSaveStatus(workspaceLocation, 'saved'))
        .silentRun();
    });

    test('returns empty array when no question ID is available', () => {
      const workspaceLocation = 'playground';
      const state = generateDefaultState(workspaceLocation);

      return expectSaga(workspaceSaga)
        .withState(state)
        .put(WorkspaceActions.receiveVersionHistory(workspaceLocation, []))
        .dispatch({
          type: WorkspaceActions.fetchVersionHistory.type,
          payload: { workspaceLocation },
        })
        .silentRun();
    });

    test('shows warning when fetch fails', () => {
      const workspaceLocation = 'assessment';
      const tokens = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      };

      const state = versionHistoryState(workspaceLocation, tokens);

      return expectSaga(workspaceSaga)
        .withState(state)
        .provide([[matchers.call.fn(getVersionHistory), null]])
        .put(WorkspaceActions.receiveVersionHistory(workspaceLocation, []))
        .call(showWarningMessage, 'Failed to load version history')
        .dispatch({
          type: WorkspaceActions.fetchVersionHistory.type,
          payload: { workspaceLocation },
        })
        .dispatch(WorkspaceActions.updateSaveStatus(workspaceLocation, 'saved'))
        .silentRun();
    });
  });

  describe('NAME_VERSION', () => {
    test('names version successfully without refetching', () => {
      const workspaceLocation = 'assessment';
      const versionId = 'v1';
      const name = 'Final Version';
      const tokens = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      };

      const state = versionHistoryState(workspaceLocation, tokens);

      const mockResponse = new Response(null, { status: 200, statusText: 'OK' });

      return expectSaga(workspaceSaga)
        .withState(state)
        .provide([[matchers.call.fn(updateVersionName), mockResponse]])
        .not.put.actionType(WorkspaceActions.receiveVersionHistory.type)
        .dispatch({
          type: WorkspaceActions.nameVersion.type,
          payload: { workspaceLocation, versionId, name },
        })
        .silentRun();
    });

    test('shows warning when no question ID is available', () => {
      const workspaceLocation = 'playground';
      const versionId = 'v1';
      const name = 'Final Version';

      const state = generateDefaultState(workspaceLocation);

      return expectSaga(workspaceSaga)
        .withState(state)
        .call(showWarningMessage, 'Error renaming version: No question ID found')
        .dispatch({
          type: WorkspaceActions.nameVersion.type,
          payload: { workspaceLocation, versionId, name },
        })
        .silentRun();
    });

    test('shows warning and refetches when naming fails', () => {
      const workspaceLocation = 'assessment';
      const versionId = 'v1';
      const name = 'Final Version';
      const tokens = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      };

      const state = versionHistoryState(workspaceLocation, tokens);

      const mockFailedResponse = new Response(null, { status: 500, statusText: 'Error' });

      return expectSaga(workspaceSaga)
        .withState(state)
        .provide([
          [matchers.call.fn(updateVersionName), mockFailedResponse],
          [matchers.call.fn(getVersionHistory), []],
        ])
        .call(showWarningMessage, 'Failed to rename version')
        .put(WorkspaceActions.receiveVersionHistory(workspaceLocation, []))
        .dispatch({
          type: WorkspaceActions.nameVersion.type,
          payload: { workspaceLocation, versionId, name },
        })
        .dispatch(WorkspaceActions.updateSaveStatus(workspaceLocation, 'saved'))
        .silentRun();
    });

    test('refetches history when response is null', () => {
      const workspaceLocation = 'grading';
      const versionId = 'v1';
      const name = 'Final Version';
      const tokens = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      };

      const state = versionHistoryState(workspaceLocation, tokens);

      return expectSaga(workspaceSaga)
        .withState(state)
        .provide([
          [matchers.call.fn(updateVersionName), null],
          [matchers.call.fn(getVersionHistory), []],
        ])
        .call(showWarningMessage, 'Failed to rename version')
        .put(WorkspaceActions.receiveVersionHistory(workspaceLocation, []))
        .dispatch({
          type: WorkspaceActions.nameVersion.type,
          payload: { workspaceLocation, versionId, name },
        })
        .silentRun();
    });
  });

  describe('RESTORE_VERSION', () => {
    test('returns early for non-assessment workspace', () => {
      const workspaceLocation = 'playground';
      const state = generateDefaultState(workspaceLocation);

      return expectSaga(workspaceSaga)
        .withState(state)
        .not.put.actionType(WorkspaceActions.updateHasUnsavedChanges.type)
        .dispatch({
          type: WorkspaceActions.restoreVersion.type,
          payload: { workspaceLocation, versionId: 'v1', name: undefined, timestamp: 100 },
        })
        .silentRun();
    });

    test('puts updateHasUnsavedChanges for team assessment without submitting', () => {
      const workspaceLocation = 'assessment';
      const versionId = 'v1';
      const tokens = { accessToken: 'test-access', refreshToken: 'test-refresh' };
      const base = versionHistoryState(workspaceLocation, tokens);

      const state = {
        ...base,
        workspaces: {
          ...base.workspaces,
          assessment: {
            ...base.workspaces.assessment,
            versionHistory: {
              versions: [{ id: versionId, code: 'const x = 1;', timestamp: 100 }],
              isLoading: false,
              isHistoryPanelOpen: false,
            },
          },
        },
        session: {
          ...base.session,
          assessmentOverviews: [{ id: mockAssessmentId, maxTeamSize: 4 }],
        },
      };

      return expectSaga(workspaceSaga)
        .withState(state)
        .put(WorkspaceActions.updateHasUnsavedChanges(workspaceLocation, true))
        .not.put.actionType(SessionActions.submitAnswer.type)
        .dispatch({
          type: WorkspaceActions.restoreVersion.type,
          payload: { workspaceLocation, versionId, name: undefined, timestamp: 100 },
        })
        .silentRun();
    });

    test('puts updateSaveStatus saved when editor code matches latest version', () => {
      const workspaceLocation = 'assessment';
      const versionId = 'v1';
      const code = 'const x = 1;';
      const tokens = { accessToken: 'test-access', refreshToken: 'test-refresh' };
      const base = versionHistoryState(workspaceLocation, tokens);

      const state = {
        ...base,
        session: {
          ...base.session,
          assessmentOverviews: [{ id: mockAssessmentId, isAutosaveEnabled: true, maxTeamSize: 1 }],
          assessments: {
            [mockAssessmentId]: {
              questions: [{ id: mockQuestionDbId, type: 'programming', answer: code }],
            },
          },
        },
        workspaces: {
          ...base.workspaces,
          assessment: {
            ...base.workspaces.assessment,
            editorTabs: [{ value: code, highlightedLines: [], breakpoints: [] }],
            activeEditorTabIndex: 0,
            versionHistory: {
              versions: [{ id: versionId, code, timestamp: 100 }],
              isLoading: false,
              isHistoryPanelOpen: false,
            },
          },
        },
      };

      return expectSaga(workspaceSaga)
        .withState(state)
        .put(WorkspaceActions.updateHasUnsavedChanges(workspaceLocation, true))
        .put(WorkspaceActions.updateSaveStatus(workspaceLocation, 'saving'))
        .put(WorkspaceActions.updateSaveStatus(workspaceLocation, 'saved'))
        .not.put.actionType(SessionActions.submitAnswer.type)
        .dispatch({
          type: WorkspaceActions.restoreVersion.type,
          payload: { workspaceLocation, versionId, name: undefined, timestamp: 100 },
        })
        .silentRun();
    });

    test('submits answer and renames newest version after successful restore', () => {
      const workspaceLocation = 'assessment';
      const versionId = 'v1';
      const currentEditorCode = 'const current = 1;';
      const tokens = { accessToken: 'test-access', refreshToken: 'test-refresh' };
      const base = versionHistoryState(workspaceLocation, tokens);

      const initialVersions = [
        { id: 'v2', code: 'const v2 = 1;', timestamp: 200 },
        { id: 'v1', code: 'const original = 1;', timestamp: 100, name: 'Old Version' },
      ];

      const state = {
        ...base,
        session: {
          ...base.session,
          assessmentOverviews: [{ id: mockAssessmentId, isAutosaveEnabled: true, maxTeamSize: 1 }],
          assessments: {
            [mockAssessmentId]: {
              questions: [{ id: mockQuestionDbId, type: 'programming' }],
            },
          },
        },
        workspaces: {
          ...base.workspaces,
          assessment: {
            ...base.workspaces.assessment,
            editorTabs: [{ value: currentEditorCode, highlightedLines: [], breakpoints: [] }],
            activeEditorTabIndex: 0,
            versionHistory: {
              versions: initialVersions,
              isLoading: false,
              isHistoryPanelOpen: false,
            },
          },
        },
      };

      return expectSaga(workspaceSaga)
        .withState(state)
        .provide([[matchers.call.fn(getVersionHistory), initialVersions]])
        .put(WorkspaceActions.updateHasUnsavedChanges(workspaceLocation, true))
        .put(WorkspaceActions.updateSaveStatus(workspaceLocation, 'saving'))
        .put(SessionActions.submitAnswer(mockQuestionDbId, currentEditorCode))
        .put(WorkspaceActions.receiveVersionHistory(workspaceLocation, initialVersions))
        .put(WorkspaceActions.nameVersion(workspaceLocation, 'v2', 'Old Version-restored'))
        .dispatch({
          type: WorkspaceActions.restoreVersion.type,
          payload: { workspaceLocation, versionId, name: 'Old Version', timestamp: 100 },
        })
        .dispatch(WorkspaceActions.updateSaveStatus(workspaceLocation, 'saved'))
        .dispatch(WorkspaceActions.updateSaveStatus(workspaceLocation, 'saved'))
        .silentRun();
    });
  });
});

describe('WATCH_SAVING_STATUS', () => {
  test('puts updateSaveStatus saving for assessment workspace', () => {
    const assessmentId = 42;
    const base = generateDefaultState('assessment', { currentAssessment: assessmentId });
    const state = {
      ...base,
      session: {
        ...base.session,
        assessmentOverviews: [{ id: assessmentId, type: 'Missions', isAutosaveEnabled: true }],
      },
    };
    return expectSaga(watchSavingStatus)
      .withState(state)
      .put(WorkspaceActions.updateSaveStatus('assessment', 'saving'))
      .dispatch(WorkspaceActions.updateEditorValue('assessment', 0, 'new code'))
      .silentRun();
  });

  test('does not put updateSaveStatus for non-assessment workspace', () => {
    return expectSaga(watchSavingStatus)
      .not.put.actionType(WorkspaceActions.updateSaveStatus.type)
      .dispatch(WorkspaceActions.updateEditorValue('playground', 0, 'new code'))
      .silentRun();
  });
});
