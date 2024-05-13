import { Context, IOptions, Result, resume, runFilesInContext, runInContext } from 'js-slang';
import createContext from 'js-slang/dist/createContext';
import { Chapter, ErrorType, Finished, SourceError, Variant } from 'js-slang/dist/types';
import { call } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import { showFullJSDisclaimer, showFullTSDisclaimer } from 'src/commons/utils/WarningDialogHelper';

import InterpreterActions from '../../application/actions/InterpreterActions';
import {
  defaultState,
  fullJSLanguage,
  fullTSLanguage,
  OverallState
} from '../../application/ApplicationTypes';
import { externalLibraries, ExternalLibraryName } from '../../application/types/ExternalTypes';
import { Library, Testcase, TestcaseType, TestcaseTypes } from '../../assessment/AssessmentTypes';
import { mockRuntimeContext } from '../../mocks/ContextMocks';
import { mockTestcases } from '../../mocks/GradingMocks';
import {
  showSuccessMessage,
  showWarningMessage
} from '../../utils/notifications/NotificationsHelper';
import WorkspaceActions from '../../workspace/WorkspaceActions';
import { WorkspaceLocation, WorkspaceState } from '../../workspace/WorkspaceTypes';
import workspaceSaga from '../WorkspaceSaga';
import { evalCodeSaga } from '../WorkspaceSaga/helpers/evalCode';
import { evalEditorSaga } from '../WorkspaceSaga/helpers/evalEditor';
import { evalTestCode } from '../WorkspaceSaga/helpers/evalTestCode';
import { runTestCase } from '../WorkspaceSaga/helpers/runTestCase';

function generateDefaultState(
  workspaceLocation: WorkspaceLocation,
  payload: any = {}
): OverallState {
  return {
    ...defaultState,
    session: {
      ...defaultState.session,
      agreedToResearch: false,
      sessionId: 10
    },
    workspaces: {
      ...defaultState.workspaces,
      [workspaceLocation]: {
        ...defaultState.workspaces[workspaceLocation],
        ...payload
      }
    }
  };
}

beforeEach(() => {
  // Mock the inspector
  (window as any).Inspector = jest.fn();
  (window as any).Inspector.highlightClean = jest.fn();
  (window as any).Inspector.highlightLine = jest.fn();
});

describe('TOGGLE_FOLDER_MODE', () => {
  test('enables Folder mode & calls showWarningMessage correctly when isFolderMode is false', () => {
    const workspaceLocation = 'assessment';
    const currentWorkspaceFields: Partial<WorkspaceState> = {
      isFolderModeEnabled: false
    };
    const updatedDefaultState = generateDefaultState(workspaceLocation, currentWorkspaceFields);

    return expectSaga(workspaceSaga)
      .withState(updatedDefaultState)
      .put(WorkspaceActions.setFolderMode(workspaceLocation, true))
      .call(showWarningMessage, 'Folder mode enabled', 750)
      .dispatch({
        type: WorkspaceActions.toggleFolderMode.type,
        payload: { workspaceLocation }
      })
      .silentRun();
  });

  test('disables Folder mode & calls showWarningMessage correctly when isFolderMode is true', () => {
    const workspaceLocation = 'grading';
    const currentWorkspaceFields: Partial<WorkspaceState> = {
      isFolderModeEnabled: true
    };
    const updatedDefaultState = generateDefaultState(workspaceLocation, currentWorkspaceFields);

    return expectSaga(workspaceSaga)
      .withState(updatedDefaultState)
      .put(WorkspaceActions.setFolderMode(workspaceLocation, false))
      .call(showWarningMessage, 'Folder mode disabled', 750)
      .dispatch({
        type: WorkspaceActions.toggleFolderMode.type,
        payload: { workspaceLocation }
      })
      .silentRun();
  });
});

describe('EVAL_EDITOR', () => {
  test('puts beginClearContext and correctly executes prepend and value in sequence (calls evalCode)', () => {
    const workspaceLocation = 'playground';
    const programPrependValue = 'const foo = (x) => -1;\n"reeee";';
    const editorValue = 'foo(2);';
    const programPostpendValue = '42;';
    const execTime = 1000;
    const context = createContext();
    const variant = Variant.DEFAULT;
    const globals: Array<[string, any]> = [
      ['testNumber', 3.141592653589793],
      ['testObject', { a: 1, b: 2 }],
      ['testArray', [1, 2, 'a', 'b']]
    ];

    const library = {
      chapter: context.chapter,
      variant,
      external: {
        name: ExternalLibraryName.NONE,
        symbols: context.externalSymbols
      },
      globals
    };

    const newDefaultState = generateDefaultState(workspaceLocation, {
      editorTabs: [
        {
          value: editorValue,
          highlightedLines: [],
          breakpoints: []
        }
      ],
      programPrependValue,
      programPostpendValue,
      execTime,
      context,
      globals
    });

    return (
      expectSaga(workspaceSaga)
        .withState(newDefaultState)
        .put(InterpreterActions.beginInterruptExecution(workspaceLocation))
        .put(WorkspaceActions.beginClearContext(workspaceLocation, library, false))
        .put(WorkspaceActions.clearReplOutput(workspaceLocation))
        // calls evalCode here with the prepend in elevated Context: silent run
        .call.like({
          fn: runFilesInContext,
          args: [
            { '/prepend.js': programPrependValue },
            '/prepend.js',
            {
              scheduler: 'preemptive',
              originalMaxExecTime: execTime,
              stepLimit: 1000,
              useSubst: false,
              throwInfiniteLoops: true
            }
          ]
        })
        // running the prepend block should return 'reeee', but silent run -> not written to REPL
        .not.put(InterpreterActions.evalInterpreterSuccess('reeee', workspaceLocation))
        // Single call to evalCode made by blockExtraMethods
        .call.like({ fn: runFilesInContext })
        // calls evalCode here with the student's program in normal Context
        .call.like({
          fn: runFilesInContext,
          args: [
            { '/playground/program.js': editorValue },
            '/playground/program.js',
            context,
            {
              scheduler: 'preemptive',
              originalMaxExecTime: execTime,
              stepLimit: 1000,
              useSubst: false,
              throwInfiniteLoops: true
            }
          ]
        })
        // running the student's program should return -1, which is written to REPL
        .put(InterpreterActions.evalInterpreterSuccess(-1, workspaceLocation))
        // should NOT attempt to execute the postpend block after above
        .not.call(runFilesInContext)
        .dispatch({
          type: WorkspaceActions.evalEditor.type,
          payload: { workspaceLocation }
        })
        .dispatch({
          type: WorkspaceActions.endClearContext.type
        })
        .silentRun()
    );
  });
});

describe('TOGGLE_EDITOR_AUTORUN', () => {
  test('calls showWarningMessage correctly when isEditorAutorun set to false', () => {
    const workspaceLocation = 'assessment';
    return expectSaga(workspaceSaga)
      .withState(defaultState)
      .call(showWarningMessage, 'Autorun Stopped', 750)
      .dispatch({
        type: WorkspaceActions.toggleEditorAutorun.type,
        payload: { workspaceLocation }
      })
      .silentRun();
  });

  test('calls showWarningMessage correctly when isEditorAutorun set to true', () => {
    const workspaceLocation = 'grading';
    const isEditorAutorun = true;
    const newDefaultState = generateDefaultState(workspaceLocation, { isEditorAutorun });

    return expectSaga(workspaceSaga)
      .withState(newDefaultState)
      .call(showWarningMessage, 'Autorun Started', 750)
      .dispatch({
        type: WorkspaceActions.toggleEditorAutorun.type,
        payload: { workspaceLocation }
      })
      .silentRun();
  });
});

describe('EVAL_REPL', () => {
  test('puts beginInterruptExecution, clearReplInput, sendReplInputToOutput and calls evalCode correctly', () => {
    const workspaceLocation = 'playground';
    const replValue = 'sample code';
    const newState = generateDefaultState(workspaceLocation, { replValue });
    const context = newState.workspaces[workspaceLocation].context;

    return (
      expectSaga(workspaceSaga)
        .withState(newState)
        .put(InterpreterActions.beginInterruptExecution(workspaceLocation))
        .put(WorkspaceActions.clearReplInput(workspaceLocation))
        .put(WorkspaceActions.sendReplInputToOutput(replValue, workspaceLocation))
        // also calls evalCode here
        .call(runFilesInContext, { '/code.js': replValue }, '/code.js', context, {
          scheduler: 'preemptive',
          originalMaxExecTime: 1000,
          stepLimit: 1000,
          useSubst: false,
          throwInfiniteLoops: true,
          envSteps: -1
        })
        .dispatch({
          type: WorkspaceActions.evalRepl.type,
          payload: { workspaceLocation }
        })
        .silentRun()
    );
  });
});

describe('DEBUG_RESUME', () => {
  let workspaceLocation: WorkspaceLocation;
  let editorValue: string;
  let editorValueFilePath: string;
  let files: Record<string, string>;
  let execTime: number;
  let context: Context;
  let state: OverallState;

  beforeEach(() => {
    // Ensure that lastDebuggerResult is set correctly before running each of the tests below
    workspaceLocation = 'playground';
    editorValue = 'sample code here';
    editorValueFilePath = '/playground/program.js';
    files = {
      [editorValueFilePath]: editorValue
    };
    execTime = 1000;
    context = mockRuntimeContext();
    state = generateDefaultState(workspaceLocation);

    return expectSaga(
      evalCodeSaga,
      files,
      editorValueFilePath,
      context,
      execTime,
      workspaceLocation,
      WorkspaceActions.evalEditor.type
    )
      .withState(state)
      .silentRun();
  });

  test('puts beginInterruptExecution, clearReplOutput, setEditorHighlightedLines and calls evalCode correctly', () => {
    const newDefaultState = generateDefaultState(workspaceLocation, {
      editorTabs: [{ value: editorValue }],
      context
    });

    return (
      expectSaga(workspaceSaga)
        .withState(newDefaultState)
        .provide({
          call(effect) {
            if (effect.fn === resume) {
              return { status: 'finished', value: 'abc' };
            } else {
              return;
            }
          }
        })
        .put(InterpreterActions.beginInterruptExecution(workspaceLocation))
        .put(WorkspaceActions.clearReplOutput(workspaceLocation))
        // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
        .put(WorkspaceActions.setEditorHighlightedLines(workspaceLocation, 0, []))
        // also calls evalCode here
        .call.like({
          fn: evalCodeSaga,
          args: [
            { '/code.js': editorValue },
            '/code.js',
            {},
            execTime,
            workspaceLocation,
            InterpreterActions.debuggerResume.type
          ]
        })
        .dispatch({
          type: InterpreterActions.debuggerResume.type,
          payload: { workspaceLocation }
        })
        .silentRun()
    );
  });
});

describe('DEBUG_RESET', () => {
  test('puts clearReplOutput and highlightHighlightedLine correctly', () => {
    const workspaceLocation = 'assessment';
    const newDefaultState = generateDefaultState(workspaceLocation, {
      editorTabs: [{ value: 'test-value' }]
    });

    return (
      expectSaga(workspaceSaga)
        .withState(newDefaultState)
        .put(WorkspaceActions.clearReplOutput(workspaceLocation))
        // TODO: Hardcoded to make use of the first editor tab. Rewrite after editor tabs are added.
        .put(WorkspaceActions.setEditorHighlightedLines(workspaceLocation, 0, []))
        .dispatch({
          type: InterpreterActions.debuggerReset.type,
          payload: { workspaceLocation }
        })
        .silentRun()
        .then(result => {
          expect(result.storeState.workspaces[workspaceLocation].context.runtime.break).toBe(false);
        })
    );
  });
});

describe('EVAL_TESTCASE', () => {
  test('correctly executes prepend, value, postpend, testcase in sequence (calls evalTestCode)', () => {
    const workspaceLocation = 'grading';
    const programPrependValue = 'let z = 2;\nconst bar = (x, y) => 10 * x + y;\n"boink";';
    const editorValue = 'bar(6, 9);';
    const programPostpendValue = '777;';
    const execTime = 1000;
    const testcaseId = 0;

    const editorTestcases: Testcase[] = [
      {
        type: TestcaseTypes.public,
        answer: '42',
        program: 'bar(4, z);', // test program.
        score: 1
      }
    ];

    const context = createContext();
    const globals: Array<[string, any]> = [
      ['testNumber', 3.141592653589793],
      ['testObject', { a: 1, b: 2 }],
      ['testArray', [1, 2, 'a', 'b']]
    ];

    const library: Library = {
      chapter: context.chapter,
      variant: Variant.DEFAULT,
      external: {
        name: ExternalLibraryName.NONE,
        symbols: context.externalSymbols
      },
      globals
    };

    const newDefaultState = generateDefaultState(workspaceLocation, {
      editorTabs: [
        {
          value: editorValue,
          highlightedLines: [],
          breakpoints: []
        }
      ],
      programPrependValue,
      programPostpendValue,
      editorTestcases,
      execTime,
      context,
      globals
    });

    return (
      expectSaga(workspaceSaga)
        .withState(newDefaultState)
        // Should interrupt execution and clear context but not clear REPL
        .not.put(InterpreterActions.beginInterruptExecution(workspaceLocation))
        .put(WorkspaceActions.beginClearContext(workspaceLocation, library, false))
        .not.put.actionType(WorkspaceActions.clearReplOutput.type)
        // Expect it to shard a new privileged context here and execute chunks in order
        // calls evalCode here with the prepend in elevated Context: silent run
        .call.like({
          fn: runFilesInContext,
          args: [
            { '/prepend.js': programPrependValue },
            '/prepend.js',
            { scheduler: 'preemptive', originalMaxExecTime: execTime }
          ]
        })
        // running the prepend block should return 'boink', but silent run -> not written to REPL
        .not.put(InterpreterActions.evalInterpreterSuccess('boink', workspaceLocation))
        // Single call to evalCode made by blockExtraMethods
        .call.like({ fn: runFilesInContext })
        // calls evalCode here with the student's program in normal Context
        .call.like({
          fn: runFilesInContext,
          args: [
            { '/value.js': editorValue },
            '/value.js',
            context,
            { scheduler: 'preemptive', originalMaxExecTime: execTime }
          ]
        })
        // running the student's program should return 69, which is NOT written to REPL (silent)
        .not.put(InterpreterActions.evalInterpreterSuccess(69, workspaceLocation))
        // Single call to evalCode made by restoreExtraMethods to enable postpend to run in S4
        .call.like({ fn: runFilesInContext })
        // calls evalCode here again with the postpend now in elevated Context: silent run
        .call.like({
          fn: runFilesInContext,
          args: [
            { '/postpend.js': programPostpendValue },
            '/postpend.js',
            { scheduler: 'preemptive', originalMaxExecTime: execTime }
          ]
        })
        // running the postpend block should return true, but silent run -> not written to REPL
        .not.put(InterpreterActions.evalInterpreterSuccess(true, workspaceLocation))
        // Single call to evalCode made by blockExtraMethods after postpend execution is complete
        .call.like({ fn: runFilesInContext })
        // finally calls evalTestCode on the testcase
        .call.like({
          fn: runInContext,
          args: [editorTestcases[0].program]
        })
        // this testcase should execute fine in the elevated context and thus write result to REPL
        .put(InterpreterActions.evalInterpreterSuccess(42, workspaceLocation))
        .put(InterpreterActions.evalTestcaseSuccess(42, workspaceLocation, testcaseId))
        .dispatch({
          type: WorkspaceActions.evalTestcase.type,
          payload: { workspaceLocation, testcaseId }
        })
        .dispatch({
          type: WorkspaceActions.endClearContext.type
        })
        .silentRun()
    );
  });
});

describe('CHAPTER_SELECT', () => {
  let workspaceLocation: WorkspaceLocation;
  let globals: Array<[string, any]>;
  let context: Context;

  beforeEach(() => {
    workspaceLocation = 'playground';
    globals = [
      ['testNumber', 3.141592653589793],
      ['testObject', { a: 1, b: 2 }],
      ['testArray', [1, 2, 'a', 'b']]
    ];
    context = {
      ...mockRuntimeContext(),
      chapter: Chapter.SOURCE_4
    };
  });

  test('puts beginClearContext, clearReplOutput and calls showSuccessMessage correctly', () => {
    const newChapter = Chapter.SOURCE_3;
    const library: Library = {
      chapter: newChapter,
      variant: Variant.DEFAULT,
      external: {
        name: 'NONE' as ExternalLibraryName,
        symbols: context.externalSymbols
      },
      globals
    };

    const newDefaultState = generateDefaultState(workspaceLocation, { context, globals });

    return expectSaga(workspaceSaga)
      .withState(newDefaultState)
      .put(WorkspaceActions.beginClearContext(workspaceLocation, library, false))
      .put(WorkspaceActions.clearReplOutput(workspaceLocation))
      .call(showSuccessMessage, `Switched to Source \xa7${newChapter}`, 1000)
      .dispatch({
        type: WorkspaceActions.chapterSelect.type,
        payload: { chapter: newChapter, variant: Variant.DEFAULT, workspaceLocation }
      })
      .silentRun();
  });

  test('does not call beginClearContext, clearReplOutput and showSuccessMessage when oldChapter === newChapter and oldVariant === newVariant', () => {
    const newChapter = Chapter.SOURCE_4;
    const newVariant = Variant.DEFAULT;
    const newDefaultState = generateDefaultState(workspaceLocation, { context, globals });

    return expectSaga(workspaceSaga)
      .withState(newDefaultState)
      .not.put.actionType(WorkspaceActions.beginClearContext.type)
      .not.put.actionType(WorkspaceActions.clearReplOutput.type)
      .not.call.fn(showSuccessMessage)
      .dispatch({
        type: WorkspaceActions.chapterSelect.type,
        payload: { chapter: newChapter, variant: newVariant, workspaceLocation }
      })
      .silentRun();
  });

  describe('show disclaimer when fullJS is chosen', () => {
    test('correct actions when user proceeds', () => {
      const newDefaultState = generateDefaultState(workspaceLocation, { context, globals });
      const library: Library = {
        chapter: fullJSLanguage.chapter,
        variant: fullJSLanguage.variant,
        external: {
          name: 'NONE' as ExternalLibraryName,
          symbols: context.externalSymbols
        },
        globals
      };

      return expectSaga(workspaceSaga)
        .provide([[matchers.call.fn(showFullJSDisclaimer), true]])
        .withState(newDefaultState)
        .call(showFullJSDisclaimer)
        .put(WorkspaceActions.beginClearContext(workspaceLocation, library, false))
        .put(WorkspaceActions.clearReplOutput(workspaceLocation))
        .call(showSuccessMessage, `Switched to full JavaScript`, 1000)
        .dispatch({
          type: WorkspaceActions.chapterSelect.type,
          payload: {
            chapter: fullJSLanguage.chapter,
            variant: fullJSLanguage.variant,
            workspaceLocation
          }
        })
        .silentRun();
    });

    test('correct actions when user cancels', () => {
      const newDefaultState = generateDefaultState(workspaceLocation, { context, globals });

      return expectSaga(workspaceSaga)
        .provide([[matchers.call.fn(showFullJSDisclaimer), false]])
        .withState(newDefaultState)
        .call(showFullJSDisclaimer)
        .not.put.actionType(WorkspaceActions.beginClearContext.type)
        .not.put.actionType(WorkspaceActions.clearReplOutput.type)
        .not.call.fn(showSuccessMessage)
        .dispatch({
          type: WorkspaceActions.chapterSelect.type,
          payload: {
            chapter: fullJSLanguage.chapter,
            variant: fullJSLanguage.variant,
            workspaceLocation
          }
        })
        .silentRun();
    });
  });

  describe('show disclaimer when fullTS is chosen', () => {
    test('correct actions when user proceeds', () => {
      const newDefaultState = generateDefaultState(workspaceLocation, { context, globals });
      const library: Library = {
        chapter: fullTSLanguage.chapter,
        variant: fullTSLanguage.variant,
        external: {
          name: 'NONE' as ExternalLibraryName,
          symbols: context.externalSymbols
        },
        globals
      };

      return expectSaga(workspaceSaga)
        .provide([[matchers.call.fn(showFullTSDisclaimer), true]])
        .withState(newDefaultState)
        .call(showFullTSDisclaimer)
        .put(WorkspaceActions.beginClearContext(workspaceLocation, library, false))
        .put(WorkspaceActions.clearReplOutput(workspaceLocation))
        .call(showSuccessMessage, `Switched to full TypeScript`, 1000)
        .dispatch({
          type: WorkspaceActions.chapterSelect.type,
          payload: {
            chapter: fullTSLanguage.chapter,
            variant: fullTSLanguage.variant,
            workspaceLocation
          }
        })
        .silentRun();
    });

    test('correct actions when user cancels', () => {
      const newDefaultState = generateDefaultState(workspaceLocation, { context, globals });

      return expectSaga(workspaceSaga)
        .provide([[matchers.call.fn(showFullTSDisclaimer), false]])
        .withState(newDefaultState)
        .call(showFullTSDisclaimer)
        .not.put.actionType(WorkspaceActions.beginClearContext.type)
        .not.put.actionType(WorkspaceActions.clearReplOutput.type)
        .not.call.fn(showSuccessMessage)
        .dispatch({
          type: WorkspaceActions.chapterSelect.type,
          payload: {
            chapter: fullTSLanguage.chapter,
            variant: fullTSLanguage.variant,
            workspaceLocation
          }
        })
        .silentRun();
    });
  });
});

describe('PLAYGROUND_EXTERNAL_SELECT', () => {
  let workspaceLocation: WorkspaceLocation;
  let globals: Array<[string, any]>;
  let chapter: Chapter;
  let context: Context;

  beforeEach(() => {
    workspaceLocation = 'playground';
    globals = [
      ['testNumber', 3.141592653589793],
      ['testObject', { a: 1, b: 2 }],
      ['testArray', [1, 2, 'a', 'b']]
    ];
    chapter = Chapter.SOURCE_4;
    context = {
      ...mockRuntimeContext(),
      chapter
    };
  });

  test('puts changeExternalLibrary, beginClearContext, clearReplOutput and calls showSuccessMessage correctly', () => {
    const oldExternalLibraryName = ExternalLibraryName.NONE;
    const newExternalLibraryName = ExternalLibraryName.SOUNDS;

    const newDefaultState = generateDefaultState(workspaceLocation, {
      context,
      globals,
      externalLibrary: oldExternalLibraryName
    });

    const symbols = externalLibraries.get(newExternalLibraryName)!;
    const library: Library = {
      chapter,
      external: {
        name: newExternalLibraryName,
        symbols
      },
      globals
    };

    return expectSaga(workspaceSaga)
      .withState(newDefaultState)
      .put(WorkspaceActions.changeExternalLibrary(newExternalLibraryName, workspaceLocation))
      .put(WorkspaceActions.beginClearContext(workspaceLocation, library, true))
      .put(WorkspaceActions.clearReplOutput(workspaceLocation))
      .call(showSuccessMessage, `Switched to ${newExternalLibraryName} library`, 1000)
      .dispatch({
        type: WorkspaceActions.externalLibrarySelect.type,
        payload: {
          externalLibraryName: newExternalLibraryName,
          workspaceLocation
        }
      })
      .silentRun();
  });

  test('does not call the above when oldExternalLibraryName === newExternalLibraryName', () => {
    const oldExternalLibraryName = ExternalLibraryName.SOUNDS;
    const newExternalLibraryName = ExternalLibraryName.SOUNDS;
    const newDefaultState = generateDefaultState(workspaceLocation, {
      context,
      globals,
      externalLibrary: oldExternalLibraryName
    });

    return expectSaga(workspaceSaga)
      .withState(newDefaultState)
      .not.put.actionType(WorkspaceActions.changeExternalLibrary.type)
      .not.put.actionType(WorkspaceActions.beginClearContext.type)
      .not.put.actionType(WorkspaceActions.clearReplOutput.type)
      .not.call.fn(showSuccessMessage)
      .dispatch({
        type: WorkspaceActions.externalLibrarySelect.type,
        payload: {
          externalLibraryName: newExternalLibraryName,
          workspaceLocation
        }
      })
      .silentRun();
  });
});

describe('BEGIN_CLEAR_CONTEXT', () => {
  let loadLib: any;
  let getReadyWebGLForCanvas: any;
  let getReadyStringifyForRunes: any;
  let chapter: Chapter;
  let globals: Array<[string, any]>;
  let workspaceLocation: WorkspaceLocation;

  beforeEach(() => {
    loadLib = jest.fn();
    getReadyWebGLForCanvas = jest.fn();
    getReadyStringifyForRunes = jest.fn();

    (window as any).loadLib = loadLib;
    (window as any).getReadyWebGLForCanvas = getReadyWebGLForCanvas;
    (window as any).getReadyStringifyForRunes = getReadyStringifyForRunes;

    workspaceLocation = 'grading';
    chapter = Chapter.SOURCE_4;
    globals = [
      ['testNumber', 3.141592653589793],
      ['testObject', { a: 1, b: 2 }],
      ['testArray', [1, 2, 'a', 'b']]
    ];
  });

  test('loads SOUNDS library correctly', () => {
    const newExternalLibraryName = ExternalLibraryName.SOUNDS;

    const symbols = externalLibraries.get(newExternalLibraryName)!;
    const library: Library = {
      chapter,
      external: {
        name: newExternalLibraryName,
        symbols
      },
      globals
    };

    return expectSaga(workspaceSaga)
      .put.like({ action: WorkspaceActions.endClearContext(library, workspaceLocation) })
      .dispatch({
        type: WorkspaceActions.beginClearContext.type,
        payload: { library, workspaceLocation, shouldInitLibrary: true }
      })
      .silentRun();
  });
});

describe('evalCode', () => {
  let workspaceLocation: WorkspaceLocation;
  let code: string;
  let codeFilePath: string;
  let files: Record<string, string>;
  let execTime: number;
  let actionType: string;
  let context: Context;
  let value: string;
  let options: Partial<IOptions>;
  let lastDebuggerResult: Result;
  let state: OverallState;

  beforeEach(() => {
    workspaceLocation = 'assessment';
    code = 'sample code';
    codeFilePath = '/assessment/program.js';
    files = {
      [codeFilePath]: code
    };
    execTime = 1000;
    actionType = WorkspaceActions.evalEditor.type;
    context = createContext(); // mockRuntimeContext();
    value = 'test value';
    options = {
      scheduler: 'preemptive',
      originalMaxExecTime: 1000,
      stepLimit: 1000,
      useSubst: false,
      throwInfiniteLoops: true,
      envSteps: -1
    };
    lastDebuggerResult = { status: 'error' };
    state = generateDefaultState(workspaceLocation, { lastDebuggerResult: { status: 'error' } });
  });

  describe('on EVAL_EDITOR action without interruptions or pausing', () => {
    test('calls runInContext, puts evalInterpreterSuccess when runInContext returns finished', () => {
      return expectSaga(
        evalCodeSaga,
        files,
        codeFilePath,
        context,
        execTime,
        workspaceLocation,
        actionType
      )
        .withState(state)
        .provide([
          [
            call(runFilesInContext, files, codeFilePath, context, options),
            { status: 'finished', value }
          ]
        ])
        .call(runFilesInContext, files, codeFilePath, context, {
          scheduler: 'preemptive',
          originalMaxExecTime: execTime,
          stepLimit: 1000,
          useSubst: false,
          throwInfiniteLoops: true,
          envSteps: -1
        })
        .put(InterpreterActions.evalInterpreterSuccess(value, workspaceLocation))
        .silentRun();
    });

    test('calls runInContext, puts endDebuggerPause and evalInterpreterSuccess when runInContext returns suspended', () => {
      return expectSaga(
        evalCodeSaga,
        files,
        codeFilePath,
        context,
        execTime,
        workspaceLocation,
        actionType
      )
        .withState(state)
        .provide([
          [call(runFilesInContext, files, codeFilePath, context, options), { status: 'suspended' }]
        ])
        .call(runFilesInContext, files, codeFilePath, context, {
          scheduler: 'preemptive',
          originalMaxExecTime: execTime,
          stepLimit: 1000,
          useSubst: false,
          throwInfiniteLoops: true,
          envSteps: -1
        })
        .put(InterpreterActions.endDebuggerPause(workspaceLocation))
        .put(InterpreterActions.evalInterpreterSuccess('Breakpoint hit!', workspaceLocation))
        .silentRun();
    });

    test('calls runInContext, puts evalInterpreterError when runInContext returns error', () => {
      return expectSaga(
        evalCodeSaga,
        files,
        codeFilePath,
        context,
        execTime,
        workspaceLocation,
        actionType
      )
        .withState(state)
        .call(runFilesInContext, files, codeFilePath, context, {
          scheduler: 'preemptive',
          originalMaxExecTime: execTime,
          stepLimit: 1000,
          useSubst: false,
          throwInfiniteLoops: true,
          envSteps: -1
        })
        .put.like({ action: { type: InterpreterActions.evalInterpreterError.type } })
        .silentRun();
    });

    // TODO: rewrite tests in a way that actually reflects known information.
    test('with error in the code, should return correct line number in error', () => {
      code = '// Prepend\n error';
      state = generateDefaultState(workspaceLocation, {
        programPrependValue: '// Prepend'
      });

      runFilesInContext(files, codeFilePath, context, {
        scheduler: 'preemptive',
        originalMaxExecTime: 1000,
        useSubst: false
      }).then(result => (context = (result as Finished).context));

      return expectSaga(
        evalCodeSaga,
        files,
        codeFilePath,
        context,
        execTime,
        workspaceLocation,
        actionType
      )
        .withState(state)
        .call(runFilesInContext, files, codeFilePath, context, {
          scheduler: 'preemptive',
          originalMaxExecTime: execTime,
          stepLimit: 1000,
          useSubst: false,
          throwInfiniteLoops: true,
          envSteps: -1
        })
        .put(InterpreterActions.evalInterpreterError(context.errors, workspaceLocation))
        .silentRun();
    });
  });

  describe('on DEBUG_RESUME action without interruptions or pausing', () => {
    // Ensure that lastDebuggerResult is set correctly before running each of the tests below
    beforeEach(() => {
      return expectSaga(
        evalCodeSaga,
        files,
        codeFilePath,
        context,
        execTime,
        workspaceLocation,
        WorkspaceActions.evalEditor.type
      )
        .withState(state)
        .silentRun();
    });

    test('calls resume, puts evalInterpreterSuccess when resume returns finished', () => {
      actionType = InterpreterActions.debuggerResume.type;

      return expectSaga(
        evalCodeSaga,
        files,
        codeFilePath,
        context,
        execTime,
        workspaceLocation,
        actionType
      )
        .withState(state)
        .provide([[call(resume, lastDebuggerResult), { status: 'finished', value }]])
        .call(resume, lastDebuggerResult)
        .put(InterpreterActions.evalInterpreterSuccess(value, workspaceLocation))
        .silentRun();
    });

    test('calls resume, puts endDebuggerPause and evalInterpreterSuccess when resume returns suspended', () => {
      actionType = InterpreterActions.debuggerResume.type;

      return expectSaga(
        evalCodeSaga,
        files,
        codeFilePath,
        context,
        execTime,
        workspaceLocation,
        actionType
      )
        .withState(state)
        .provide([[call(resume, lastDebuggerResult), { status: 'suspended' }]])
        .call(resume, lastDebuggerResult)
        .put(InterpreterActions.endDebuggerPause(workspaceLocation))
        .put(InterpreterActions.evalInterpreterSuccess('Breakpoint hit!', workspaceLocation))
        .silentRun();
    });

    test('calls resume, puts evalInterpreterError when resume returns error', () => {
      actionType = InterpreterActions.debuggerResume.type;

      return expectSaga(
        evalCodeSaga,
        files,
        codeFilePath,
        context,
        execTime,
        workspaceLocation,
        actionType
      )
        .withState(state)
        .call(resume, lastDebuggerResult)
        .put.like({ action: { type: InterpreterActions.evalInterpreterError.type } })
        .silentRun();
    });
  });

  describe('on interrupt', () => {
    test('puts debuggerReset, endInterruptExecution and calls showWarningMessage', () => {
      return expectSaga(
        evalCodeSaga,
        files,
        codeFilePath,
        context,
        execTime,
        workspaceLocation,
        actionType
      )
        .withState(state)
        .provide({
          race: () => ({
            interrupted: {
              type: InterpreterActions.beginInterruptExecution.type,
              payload: { workspaceLocation }
            }
          })
        })
        .put(InterpreterActions.debuggerReset(workspaceLocation))
        .put(InterpreterActions.endInterruptExecution(workspaceLocation))
        .call(showWarningMessage, 'Execution aborted', 750)
        .silentRun()
        .then(result => {
          expect(context.errors[0]).toHaveProperty(['type'], 'Runtime');
        });
    });
  });

  describe('on paused', () => {
    test('puts endDebuggerPause and calls showWarningMessage', () => {
      return expectSaga(
        evalCodeSaga,
        files,
        codeFilePath,
        context,
        execTime,
        workspaceLocation,
        actionType
      )
        .withState(state)
        .provide({
          race: () => ({
            paused: {
              type: InterpreterActions.beginDebuggerPause.type,
              payload: { workspaceLocation }
            }
          })
        })
        .put(InterpreterActions.endDebuggerPause(workspaceLocation))
        .call(showWarningMessage, 'Execution paused', 750)
        .silentRun();
    });
  });

  describe('special error', () => {
    test('on throwing of special error, calls evalInterpreterSuccess ', async () => {
      context.errors = [
        { type: ErrorType.RUNTIME, error: 'source_academy_interrupt' } as unknown as SourceError
      ];
      return expectSaga(
        evalCodeSaga,
        files,
        codeFilePath,
        context,
        execTime,
        workspaceLocation,
        actionType
      )
        .withState(state)
        .provide([
          [
            call(runFilesInContext, files, codeFilePath, context, options),
            { status: 'error', value }
          ]
        ])
        .put(
          InterpreterActions.evalInterpreterSuccess(
            'Program has been interrupted by module',
            workspaceLocation
          )
        )
        .silentRun();
    });
  });
});

describe('evalTestCode', () => {
  let workspaceLocation: WorkspaceLocation;
  let code: string;
  let execTime: number;
  let context: Context;
  let value: string;
  let options: Partial<IOptions>;
  let index: number;
  let type: TestcaseType;
  let state: OverallState;

  beforeEach(() => {
    workspaceLocation = 'assessment';
    code = 'more sample code';
    execTime = 1000;
    context = mockRuntimeContext();
    value = 'another test value';
    options = {
      scheduler: 'preemptive',
      originalMaxExecTime: 1000,
      throwInfiniteLoops: true
    };
    index = 1;
    type = TestcaseTypes.public;
    state = generateDefaultState(workspaceLocation);
  });

  describe('without interrupt', () => {
    test('puts evalInterpreterSuccess and evalTestcaseSuccess on finished status', () => {
      return expectSaga(evalTestCode, code, context, execTime, workspaceLocation, index, type)
        .withState(state)
        .provide([[call(runInContext, code, context, options), { status: 'finished', value }]])
        .put(InterpreterActions.evalInterpreterSuccess(value, workspaceLocation))
        .put(InterpreterActions.evalTestcaseSuccess(value, workspaceLocation, index))
        .not.put(WorkspaceActions.clearReplOutputLast(workspaceLocation))
        .silentRun();
    });

    test('puts additional clearReplOutputLast for opaque testcases after finished status', () => {
      type = TestcaseTypes.opaque;

      return expectSaga(evalTestCode, code, context, execTime, workspaceLocation, index, type)
        .withState(state)
        .provide([[call(runInContext, code, context, options), { status: 'finished', value }]])
        .put(InterpreterActions.evalInterpreterSuccess(value, workspaceLocation))
        .put(InterpreterActions.evalTestcaseSuccess(value, workspaceLocation, index))
        .put(WorkspaceActions.clearReplOutputLast(workspaceLocation))
        .silentRun();
    });

    test('puts evalInterpreterError and evalTestcaseFailure on error status', () => {
      return expectSaga(evalTestCode, code, context, execTime, workspaceLocation, index, type)
        .withState(state)
        .provide([[call(runInContext, code, context, options), { status: 'error' }]])
        .put(InterpreterActions.evalInterpreterError(context.errors, workspaceLocation))
        .put(InterpreterActions.evalTestcaseFailure(context.errors, workspaceLocation, index))
        .not.put(WorkspaceActions.clearReplOutputLast(workspaceLocation))
        .silentRun();
    });

    test('puts additional clearReplOutputLast for opaque testcases after error status', () => {
      type = TestcaseTypes.opaque;

      return expectSaga(evalTestCode, code, context, execTime, workspaceLocation, index, type)
        .withState(state)
        .provide([[call(runInContext, code, context, options), { status: 'error' }]])
        .put(InterpreterActions.evalInterpreterError(context.errors, workspaceLocation))
        .put(InterpreterActions.evalTestcaseFailure(context.errors, workspaceLocation, index))
        .put(WorkspaceActions.clearReplOutputLast(workspaceLocation))
        .silentRun();
    });
  });

  describe('on interrupt', () => {
    test('puts endInterruptExecution and calls showWarningMessage', () => {
      return expectSaga(
        evalTestCode,
        code,
        context,
        execTime,
        workspaceLocation,
        index,
        TestcaseTypes.public
      )
        .withState(state)
        .provide({
          race: () => ({
            interrupted: {
              type: InterpreterActions.beginInterruptExecution.type,
              payload: { workspaceLocation }
            }
          })
        })
        .put(InterpreterActions.endInterruptExecution(workspaceLocation))
        .call(showWarningMessage, `Execution of testcase ${index} aborted`, 750)
        .silentRun()
        .then(() => {
          expect(context.errors[0]).toHaveProperty(['type'], 'Runtime');
        });
    });
  });
});

describe('NAV_DECLARATION', () => {
  let workspaceLocation: WorkspaceLocation;
  let context: Context;
  let editorValue: string;
  let state: OverallState;

  beforeEach(() => {
    workspaceLocation = 'playground';
    editorValue = 'const foo = (x) => -1; foo(2);';
    context = {
      ...mockRuntimeContext(),
      chapter: Chapter.SOURCE_4
    };
    state = generateDefaultState(workspaceLocation, {
      editorTabs: [{ value: editorValue }],
      context
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
          payload: { workspaceLocation, cursorPosition: loc }
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
          payload: { workspaceLocation, cursorPosition: pos }
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
          payload: { workspaceLocation, cursorPosition: pos }
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
      editorTestcases: []
    });

    return expectSaga(workspaceSaga)
      .withState(state)
      .call.fn(evalEditorSaga)
      .not.call.fn(showSuccessMessage)
      .not.call.fn(runTestCase)
      .dispatch({
        type: WorkspaceActions.runAllTestcases.type,
        payload: { workspaceLocation }
      })
      .silentRun();
  });

  test('calls runTestCase when there are testcases', () => {
    state = generateDefaultState(workspaceLocation, {
      editorTestcases: mockTestcases
    });

    return expectSaga(workspaceSaga)
      .withState(state)
      .dispatch({
        type: WorkspaceActions.runAllTestcases.type,
        payload: { workspaceLocation }
      })
      .call(showSuccessMessage, 'Running all testcases!', 2000)
      .call.fn(evalEditorSaga)
      .call(runTestCase, workspaceLocation, 0)
      .call(runTestCase, workspaceLocation, 1)
      .call(runTestCase, workspaceLocation, 2)
      .call(runTestCase, workspaceLocation, 3)
      .provide([
        [call(runTestCase, workspaceLocation, 0), true],
        [call(runTestCase, workspaceLocation, 1), true],
        [call(runTestCase, workspaceLocation, 2), true],
        [call(runTestCase, workspaceLocation, 3), true]
      ])
      .silentRun(2000);
  });

  test('prematurely terminates if execution of one testcase results in an error', () => {
    state = generateDefaultState(workspaceLocation, {
      editorTestcases: mockTestcases.slice(0, 2)
    });

    return expectSaga(workspaceSaga)
      .withState(state)
      .dispatch({
        type: WorkspaceActions.runAllTestcases.type,
        payload: { workspaceLocation }
      })
      .call(showSuccessMessage, 'Running all testcases!', 2000)
      .call.fn(evalEditorSaga)
      .call(runTestCase, workspaceLocation, 0)
      .not.call(runTestCase, workspaceLocation, 1)
      .not.call(runTestCase, workspaceLocation, 2)
      .not.call(runTestCase, workspaceLocation, 3)
      .provide([[call(runTestCase, workspaceLocation, 0), false]])
      .silentRun(2000);
  });
});
