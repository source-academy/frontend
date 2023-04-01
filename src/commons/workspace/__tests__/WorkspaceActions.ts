import { Chapter, Variant } from 'js-slang/dist/types';

import { createDefaultWorkspace, SALanguage } from '../../application/ApplicationTypes';
import { ExternalLibraryName } from '../../application/types/ExternalTypes';
import { UPDATE_EDITOR_HIGHLIGHTED_LINES } from '../../application/types/InterpreterTypes';
import { Library } from '../../assessment/AssessmentTypes';
import { HighlightedLines } from '../../editor/EditorTypes';
import {
  addEditorTab,
  beginClearContext,
  browseReplHistoryDown,
  browseReplHistoryUp,
  changeExternalLibrary,
  changeSideContentHeight,
  changeSublanguage,
  chapterSelect,
  clearReplInput,
  clearReplOutput,
  clearReplOutputLast,
  endClearContext,
  evalEditor,
  evalRepl,
  evalTestcase,
  externalLibrarySelect,
  moveCursor,
  navigateToDeclaration,
  removeEditorTab,
  removeEditorTabForFile,
  removeEditorTabsForDirectory,
  renameEditorTabForFile,
  renameEditorTabsForDirectory,
  resetTestcase,
  resetWorkspace,
  sendReplInputToOutput,
  setEditorBreakpoint,
  setEditorHighlightedLines,
  setFolderMode,
  shiftEditorTab,
  toggleEditorAutorun,
  toggleFolderMode,
  toggleUsingSubst,
  updateActiveEditorTab,
  updateActiveEditorTabIndex,
  updateCurrentAssessmentId,
  updateCurrentSubmissionId,
  updateEditorValue,
  updateHasUnsavedChanges,
  updateReplValue,
  updateSublanguage
} from '../WorkspaceActions';
import {
  ADD_EDITOR_TAB,
  BEGIN_CLEAR_CONTEXT,
  BROWSE_REPL_HISTORY_DOWN,
  BROWSE_REPL_HISTORY_UP,
  CHANGE_EXTERNAL_LIBRARY,
  CHANGE_SIDE_CONTENT_HEIGHT,
  CHANGE_SUBLANGUAGE,
  CHAPTER_SELECT,
  CLEAR_REPL_INPUT,
  CLEAR_REPL_OUTPUT,
  CLEAR_REPL_OUTPUT_LAST,
  EditorTabState,
  END_CLEAR_CONTEXT,
  EVAL_EDITOR,
  EVAL_REPL,
  EVAL_TESTCASE,
  MOVE_CURSOR,
  NAV_DECLARATION,
  PLAYGROUND_EXTERNAL_SELECT,
  REMOVE_EDITOR_TAB,
  REMOVE_EDITOR_TAB_FOR_FILE,
  REMOVE_EDITOR_TABS_FOR_DIRECTORY,
  RENAME_EDITOR_TAB_FOR_FILE,
  RENAME_EDITOR_TABS_FOR_DIRECTORY,
  RESET_TESTCASE,
  RESET_WORKSPACE,
  SEND_REPL_INPUT_TO_OUTPUT,
  SET_FOLDER_MODE,
  SHIFT_EDITOR_TAB,
  TOGGLE_EDITOR_AUTORUN,
  TOGGLE_FOLDER_MODE,
  TOGGLE_USING_SUBST,
  UPDATE_ACTIVE_EDITOR_TAB,
  UPDATE_ACTIVE_EDITOR_TAB_INDEX,
  UPDATE_CURRENT_ASSESSMENT_ID,
  UPDATE_CURRENT_SUBMISSION_ID,
  UPDATE_EDITOR_BREAKPOINTS,
  UPDATE_EDITOR_VALUE,
  UPDATE_HAS_UNSAVED_CHANGES,
  UPDATE_REPL_VALUE,
  UPDATE_SUBLANGUAGE,
  WorkspaceLocation
} from '../WorkspaceTypes';

const assessmentWorkspace: WorkspaceLocation = 'assessment';
const gradingWorkspace: WorkspaceLocation = 'grading';
const playgroundWorkspace: WorkspaceLocation = 'playground';

test('browseReplHistoryDown generates correct action object', () => {
  const action = browseReplHistoryDown(assessmentWorkspace);
  expect(action).toEqual({
    type: BROWSE_REPL_HISTORY_DOWN,
    payload: { workspaceLocation: assessmentWorkspace }
  });
});

test('browseReplHistoryUp generates correct action object', () => {
  const action = browseReplHistoryUp(gradingWorkspace);
  expect(action).toEqual({
    type: BROWSE_REPL_HISTORY_UP,
    payload: { workspaceLocation: gradingWorkspace }
  });
});

test('changeExternalLibrary generates correct action object', () => {
  const newExternal = 'new-external-test';
  const action = changeExternalLibrary(newExternal, playgroundWorkspace);
  expect(action).toEqual({
    type: CHANGE_EXTERNAL_LIBRARY,
    payload: {
      newExternal,
      workspaceLocation: playgroundWorkspace
    }
  });
});

test('changeSideContentHeight generates correct action object', () => {
  const height = 100;
  const action = changeSideContentHeight(height, gradingWorkspace);
  expect(action).toEqual({
    type: CHANGE_SIDE_CONTENT_HEIGHT,
    payload: {
      height,
      workspaceLocation: gradingWorkspace
    }
  });
});

test('chapterSelect generates correct action object', () => {
  const chapter = Chapter.SOURCE_3;
  const variant = Variant.DEFAULT;
  const action = chapterSelect(chapter, variant, playgroundWorkspace);
  expect(action).toEqual({
    type: CHAPTER_SELECT,
    payload: {
      chapter,
      variant,
      workspaceLocation: playgroundWorkspace
    }
  });
});

test('externalLibrarySelect generates correct action object', () => {
  const externalLibraryName = ExternalLibraryName.SOUNDS;
  const action = externalLibrarySelect(externalLibraryName, assessmentWorkspace);
  expect(action).toEqual({
    type: PLAYGROUND_EXTERNAL_SELECT,
    payload: {
      externalLibraryName,
      workspaceLocation: assessmentWorkspace,
      initialise: false
    }
  });
});

test('toggleEditorAutorun generates correct action object', () => {
  const action = toggleEditorAutorun(gradingWorkspace);
  expect(action).toEqual({
    type: TOGGLE_EDITOR_AUTORUN,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  });
});

test('beginClearContext generates correct action object', () => {
  const library: Library = {
    chapter: Chapter.SOURCE_4,
    external: {
      name: ExternalLibraryName.SOUNDS,
      symbols: []
    },
    globals: []
  };

  const action = beginClearContext(playgroundWorkspace, library, true);
  expect(action).toEqual({
    type: BEGIN_CLEAR_CONTEXT,
    payload: {
      library,
      workspaceLocation: playgroundWorkspace,
      shouldInitLibrary: true
    }
  });
});

test('clearReplInput generates correct action object', () => {
  const action = clearReplInput(assessmentWorkspace);
  expect(action).toEqual({
    type: CLEAR_REPL_INPUT,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  });
});

test('clearReplOutputLast generates correct action object', () => {
  const action = clearReplOutputLast(assessmentWorkspace);
  expect(action).toEqual({
    type: CLEAR_REPL_OUTPUT_LAST,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  });
});

test('clearReplOutput generates correct action object', () => {
  const action = clearReplOutput(gradingWorkspace);
  expect(action).toEqual({
    type: CLEAR_REPL_OUTPUT,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  });
});

test('endClearContext generates correct action object', () => {
  const library: Library = {
    chapter: Chapter.SOURCE_4,
    external: {
      name: ExternalLibraryName.SOUNDS,
      symbols: []
    },
    globals: []
  };

  const action = endClearContext(library, playgroundWorkspace);
  expect(action).toEqual({
    type: END_CLEAR_CONTEXT,
    payload: {
      library,
      workspaceLocation: playgroundWorkspace
    }
  });
});

test('evalEditor generates correct action object', () => {
  const action = evalEditor(assessmentWorkspace);
  expect(action).toEqual({
    type: EVAL_EDITOR,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  });
});

test('evalRepl generates correct action object', () => {
  const action = evalRepl(gradingWorkspace);
  expect(action).toEqual({
    type: EVAL_REPL,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  });
});

test('evalTestcase generates correct action object', () => {
  const testcaseId = 3;
  const action = evalTestcase(playgroundWorkspace, testcaseId);
  expect(action).toEqual({
    type: EVAL_TESTCASE,
    payload: {
      testcaseId,
      workspaceLocation: playgroundWorkspace
    }
  });
});

test('toggleFolderMode generates correct action object', () => {
  const action = toggleFolderMode(gradingWorkspace);
  expect(action).toEqual({
    type: TOGGLE_FOLDER_MODE,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  });
});

test('setFolderMode generates correct action object', () => {
  const isFolderModeEnabled = true;
  const action = setFolderMode(gradingWorkspace, isFolderModeEnabled);
  expect(action).toEqual({
    type: SET_FOLDER_MODE,
    payload: {
      workspaceLocation: gradingWorkspace,
      isFolderModeEnabled
    }
  });
});

test('updateActiveEditorTabIndex generates correct action object', () => {
  const activeEditorTabIndex = 3;
  const action = updateActiveEditorTabIndex(playgroundWorkspace, activeEditorTabIndex);
  expect(action).toEqual({
    type: UPDATE_ACTIVE_EDITOR_TAB_INDEX,
    payload: {
      workspaceLocation: playgroundWorkspace,
      activeEditorTabIndex
    }
  });
});

test('updateActiveEditorTab generates correct action object', () => {
  const newEditorTab: Partial<EditorTabState> = { value: 'Hello World' };
  const action = updateActiveEditorTab(assessmentWorkspace, newEditorTab);
  expect(action).toEqual({
    type: UPDATE_ACTIVE_EDITOR_TAB,
    payload: {
      workspaceLocation: assessmentWorkspace,
      activeEditorTabOptions: newEditorTab
    }
  });
});

test('updateEditorValue generates correct action object', () => {
  const editorTabIndex = 3;
  const newEditorValue = 'new_editor_value';
  const action = updateEditorValue(assessmentWorkspace, editorTabIndex, newEditorValue);
  expect(action).toEqual({
    type: UPDATE_EDITOR_VALUE,
    payload: {
      workspaceLocation: assessmentWorkspace,
      editorTabIndex,
      newEditorValue
    }
  });
});

test('setEditorBreakpoint generates correct action object', () => {
  const editorTabIndex = 3;
  const newBreakpoints = ['ace_breakpoint', 'ace_breakpoint'];
  const action = setEditorBreakpoint(gradingWorkspace, editorTabIndex, newBreakpoints);
  expect(action).toEqual({
    type: UPDATE_EDITOR_BREAKPOINTS,
    payload: {
      workspaceLocation: gradingWorkspace,
      editorTabIndex,
      newBreakpoints
    }
  });
});

test('setEditorHighlightedLines generates correct action object', () => {
  const editorTabIndex = 3;
  const newHighlightedLines: HighlightedLines[] = [
    [1, 2],
    [5, 6]
  ];
  const action = setEditorHighlightedLines(
    playgroundWorkspace,
    editorTabIndex,
    newHighlightedLines
  );
  expect(action).toEqual({
    type: UPDATE_EDITOR_HIGHLIGHTED_LINES,
    payload: {
      workspaceLocation: playgroundWorkspace,
      editorTabIndex,
      newHighlightedLines
    }
  });
});

test('moveCursor generates correct action object', () => {
  const editorTabIndex = 3;
  const newCursorPosition = { row: 0, column: 0 };
  const action = moveCursor(playgroundWorkspace, editorTabIndex, newCursorPosition);
  expect(action).toEqual({
    type: MOVE_CURSOR,
    payload: {
      workspaceLocation: playgroundWorkspace,
      editorTabIndex,
      newCursorPosition
    }
  });
});

test('addEditorTab generates correct action object', () => {
  const filePath = '/playground/program.js';
  const editorValue = 'Hello World!';
  const action = addEditorTab(playgroundWorkspace, filePath, editorValue);
  expect(action).toEqual({
    type: ADD_EDITOR_TAB,
    payload: {
      workspaceLocation: playgroundWorkspace,
      filePath,
      editorValue
    }
  });
});

test('shiftEditorTab generates correct action object', () => {
  const previousEditorTabIndex = 3;
  const newEditorTabIndex = 1;
  const action = shiftEditorTab(playgroundWorkspace, previousEditorTabIndex, newEditorTabIndex);
  expect(action).toEqual({
    type: SHIFT_EDITOR_TAB,
    payload: {
      workspaceLocation: playgroundWorkspace,
      previousEditorTabIndex,
      newEditorTabIndex
    }
  });
});

test('removeEditorTab generates correct action object', () => {
  const editorTabIndex = 3;
  const action = removeEditorTab(playgroundWorkspace, editorTabIndex);
  expect(action).toEqual({
    type: REMOVE_EDITOR_TAB,
    payload: {
      workspaceLocation: playgroundWorkspace,
      editorTabIndex
    }
  });
});

test('removeEditorTabForFile generates correct action object', () => {
  const removedFilePath = '/dir1/a.js';
  const action = removeEditorTabForFile(playgroundWorkspace, removedFilePath);
  expect(action).toEqual({
    type: REMOVE_EDITOR_TAB_FOR_FILE,
    payload: {
      workspaceLocation: playgroundWorkspace,
      removedFilePath
    }
  });
});

test('removeEditorTabsForDirectory generates correct action object', () => {
  const removedDirectoryPath = '/dir1';
  const action = removeEditorTabsForDirectory(playgroundWorkspace, removedDirectoryPath);
  expect(action).toEqual({
    type: REMOVE_EDITOR_TABS_FOR_DIRECTORY,
    payload: {
      workspaceLocation: playgroundWorkspace,
      removedDirectoryPath
    }
  });
});

test('renameEditorTabForFile generates correct action object', () => {
  const oldFilePath = '/dir1/a.js';
  const newFilePath = '/dir1/b.js';
  const action = renameEditorTabForFile(playgroundWorkspace, oldFilePath, newFilePath);
  expect(action).toEqual({
    type: RENAME_EDITOR_TAB_FOR_FILE,
    payload: {
      workspaceLocation: playgroundWorkspace,
      oldFilePath,
      newFilePath
    }
  });
});

test('renameEditorTabsForDirectory generates correct action object', () => {
  const oldDirectoryPath = '/dir1';
  const newDirectoryPath = '/dir2';
  const action = renameEditorTabsForDirectory(
    playgroundWorkspace,
    oldDirectoryPath,
    newDirectoryPath
  );
  expect(action).toEqual({
    type: RENAME_EDITOR_TABS_FOR_DIRECTORY,
    payload: {
      workspaceLocation: playgroundWorkspace,
      oldDirectoryPath,
      newDirectoryPath
    }
  });
});

test('updateReplValue generates correct action object', () => {
  const newReplValue = 'new_repl_value';
  const action = updateReplValue(newReplValue, assessmentWorkspace);
  expect(action).toEqual({
    type: UPDATE_REPL_VALUE,
    payload: {
      newReplValue,
      workspaceLocation: assessmentWorkspace
    }
  });
});

test('sendReplInputToOutput generates correct action object', () => {
  const newOutput = 'new_output';
  const action = sendReplInputToOutput(newOutput, gradingWorkspace);
  expect(action).toEqual({
    type: SEND_REPL_INPUT_TO_OUTPUT,
    payload: {
      type: 'code',
      value: newOutput,
      workspaceLocation: gradingWorkspace
    }
  });
});

test('resetTestcase generates correct action object', () => {
  const index = 420;
  const action = resetTestcase(assessmentWorkspace, index);
  expect(action).toEqual({
    type: RESET_TESTCASE,
    payload: {
      workspaceLocation: assessmentWorkspace,
      index
    }
  });
});

test('resetWorkspace generates correct default action object', () => {
  const action = resetWorkspace(playgroundWorkspace);
  expect(action).toEqual({
    type: RESET_WORKSPACE,
    payload: {
      workspaceLocation: playgroundWorkspace
    }
  });
});

test('resetWorkspace generates correct action object with provided workspace', () => {
  const workspaceOptions = createDefaultWorkspace(assessmentWorkspace);
  const action = resetWorkspace(assessmentWorkspace, workspaceOptions);
  expect(action).toEqual({
    type: RESET_WORKSPACE,
    payload: {
      workspaceLocation: assessmentWorkspace,
      workspaceOptions
    }
  });
});

test('updateCurrentAssessmentId generates correct action object', () => {
  const assessmentId = 2;
  const questionId = 4;
  const action = updateCurrentAssessmentId(assessmentId, questionId);
  expect(action).toEqual({
    type: UPDATE_CURRENT_ASSESSMENT_ID,
    payload: {
      assessmentId,
      questionId
    }
  });
});

test('updateCurrentSubmissionId generates correct action object', () => {
  const submissionId = 3;
  const questionId = 6;
  const action = updateCurrentSubmissionId(submissionId, questionId);
  expect(action).toEqual({
    type: UPDATE_CURRENT_SUBMISSION_ID,
    payload: {
      submissionId,
      questionId
    }
  });
});

test('updateHasUnsavedChanges generates correct action object', () => {
  const hasUnsavedChanges = true;
  const action = updateHasUnsavedChanges(assessmentWorkspace, hasUnsavedChanges);
  expect(action).toEqual({
    type: UPDATE_HAS_UNSAVED_CHANGES,
    payload: {
      workspaceLocation: assessmentWorkspace,
      hasUnsavedChanges
    }
  });
});

test('navigateToDeclaration generates correct action object', () => {
  const cursorPosition = { row: 0, column: 0 };
  const action = navigateToDeclaration(playgroundWorkspace, cursorPosition);
  expect(action).toEqual({
    type: NAV_DECLARATION,
    payload: {
      workspaceLocation: playgroundWorkspace,
      cursorPosition
    }
  });
});

test('changeSublanguage generates correct action object', () => {
  const sublang: SALanguage = {
    chapter: Chapter.SOURCE_2,
    variant: Variant.DEFAULT,
    displayName: 'Source \xa72'
  };
  const action = changeSublanguage(sublang);
  expect(action).toEqual({
    type: CHANGE_SUBLANGUAGE,
    payload: {
      sublang
    }
  });
});

test('updateChapter generates correct action object', () => {
  const sublang: SALanguage = {
    chapter: Chapter.SOURCE_2,
    variant: Variant.DEFAULT,
    displayName: 'Source \xa72'
  };
  const action = updateSublanguage(sublang);
  expect(action).toEqual({
    type: UPDATE_SUBLANGUAGE,
    payload: {
      sublang
    }
  });
});

test('toggleUsingSubst generates correct action object', () => {
  const action = toggleUsingSubst(true, playgroundWorkspace);
  expect(action).toEqual({
    type: TOGGLE_USING_SUBST,
    payload: {
      workspaceLocation: playgroundWorkspace,
      usingSubst: true
    }
  });
});
