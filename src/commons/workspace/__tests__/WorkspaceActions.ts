import { Chapter, Variant } from 'js-slang/dist/types';
import { changeSideContentHeight } from 'src/commons/sideContent/SideContentActions';

import {
  createDefaultWorkspace,
  SALanguage,
  SupportedLanguage
} from '../../application/ApplicationTypes';
import { ExternalLibraryName } from '../../application/types/ExternalTypes';
import { Library } from '../../assessment/AssessmentTypes';
import { HighlightedLines } from '../../editor/EditorTypes';
import {
  addEditorTab,
  beginClearContext,
  browseReplHistoryDown,
  browseReplHistoryUp,
  changeExternalLibrary,
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
  updateSublanguage,
  updateSubmissionsTableFilters
} from '../WorkspaceActions';
import { EditorTabState, WorkspaceLocation } from '../WorkspaceTypes';

const assessmentWorkspace: WorkspaceLocation = 'assessment';
const gradingWorkspace: WorkspaceLocation = 'grading';
const playgroundWorkspace: WorkspaceLocation = 'playground';

test('browseReplHistoryDown generates correct action object', () => {
  const action = browseReplHistoryDown(assessmentWorkspace);
  expect(action).toEqual({
    type: browseReplHistoryDown.type,
    payload: { workspaceLocation: assessmentWorkspace }
  });
});

test('browseReplHistoryUp generates correct action object', () => {
  const action = browseReplHistoryUp(gradingWorkspace);
  expect(action).toEqual({
    type: browseReplHistoryUp.type,
    payload: { workspaceLocation: gradingWorkspace }
  });
});

test('changeExternalLibrary generates correct action object', () => {
  const newExternal = 'new-external-test' as ExternalLibraryName;
  const action = changeExternalLibrary(newExternal, playgroundWorkspace);
  expect(action).toEqual({
    type: changeExternalLibrary.type,
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
    type: changeSideContentHeight.type,
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
    type: chapterSelect.type,
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
    type: externalLibrarySelect.type,
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
    type: toggleEditorAutorun.type,
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
    type: beginClearContext.type,
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
    type: clearReplInput.type,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  });
});

test('clearReplOutputLast generates correct action object', () => {
  const action = clearReplOutputLast(assessmentWorkspace);
  expect(action).toEqual({
    type: clearReplOutputLast.type,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  });
});

test('clearReplOutput generates correct action object', () => {
  const action = clearReplOutput(gradingWorkspace);
  expect(action).toEqual({
    type: clearReplOutput.type,
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
    type: endClearContext.type,
    payload: {
      library,
      workspaceLocation: playgroundWorkspace
    }
  });
});

test('evalEditor generates correct action object', () => {
  const action = evalEditor(assessmentWorkspace);
  expect(action).toEqual({
    type: evalEditor.type,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  });
});

test('evalRepl generates correct action object', () => {
  const action = evalRepl(gradingWorkspace);
  expect(action).toEqual({
    type: evalRepl.type,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  });
});

test('evalTestcase generates correct action object', () => {
  const testcaseId = 3;
  const action = evalTestcase(playgroundWorkspace, testcaseId);
  expect(action).toEqual({
    type: evalTestcase.type,
    payload: {
      testcaseId,
      workspaceLocation: playgroundWorkspace
    }
  });
});

test('toggleFolderMode generates correct action object', () => {
  const action = toggleFolderMode(gradingWorkspace);
  expect(action).toEqual({
    type: toggleFolderMode.type,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  });
});

test('setFolderMode generates correct action object', () => {
  const isFolderModeEnabled = true;
  const action = setFolderMode(gradingWorkspace, isFolderModeEnabled);
  expect(action).toEqual({
    type: setFolderMode.type,
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
    type: updateActiveEditorTabIndex.type,
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
    type: updateActiveEditorTab.type,
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
    type: updateEditorValue.type,
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
    type: setEditorBreakpoint.type,
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
    type: setEditorHighlightedLines.type,
    payload: {
      workspaceLocation: playgroundWorkspace,
      editorTabIndex,
      newHighlightedLines
    }
  });
});

// TODO: Test setEditorHighlightedLinesControl

test('moveCursor generates correct action object', () => {
  const editorTabIndex = 3;
  const newCursorPosition = { row: 0, column: 0 };
  const action = moveCursor(playgroundWorkspace, editorTabIndex, newCursorPosition);
  expect(action).toEqual({
    type: moveCursor.type,
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
    type: addEditorTab.type,
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
    type: shiftEditorTab.type,
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
    type: removeEditorTab.type,
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
    type: removeEditorTabForFile.type,
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
    type: removeEditorTabsForDirectory.type,
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
    type: renameEditorTabForFile.type,
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
    type: renameEditorTabsForDirectory.type,
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
    type: updateReplValue.type,
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
    type: sendReplInputToOutput.type,
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
    type: resetTestcase.type,
    payload: {
      workspaceLocation: assessmentWorkspace,
      index
    }
  });
});

test('resetWorkspace generates correct default action object', () => {
  const action = resetWorkspace(playgroundWorkspace);
  expect(action).toEqual({
    type: resetWorkspace.type,
    payload: {
      workspaceLocation: playgroundWorkspace
    }
  });
});

test('resetWorkspace generates correct action object with provided workspace', () => {
  const workspaceOptions = createDefaultWorkspace(assessmentWorkspace);
  const action = resetWorkspace(assessmentWorkspace, workspaceOptions);
  expect(action).toEqual({
    type: resetWorkspace.type,
    payload: {
      workspaceLocation: assessmentWorkspace,
      workspaceOptions
    }
  });
});

test('updateSubmissionsTableFilters generates correct action object', () => {
  const columnFilters = [
    {
      id: 'groupName',
      value: '1A'
    },
    {
      id: 'assessmentType',
      value: 'Missions'
    }
  ];
  const action = updateSubmissionsTableFilters({ columnFilters });
  expect(action).toEqual({
    type: updateSubmissionsTableFilters.type,
    payload: {
      filters: {
        columnFilters
      }
    }
  });
});

test('updateCurrentAssessmentId generates correct action object', () => {
  const assessmentId = 2;
  const questionId = 4;
  const action = updateCurrentAssessmentId(assessmentId, questionId);
  expect(action).toEqual({
    type: updateCurrentAssessmentId.type,
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
    type: updateCurrentSubmissionId.type,
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
    type: updateHasUnsavedChanges.type,
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
    type: navigateToDeclaration.type,
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
    displayName: 'Source \xa72',
    mainLanguage: SupportedLanguage.JAVASCRIPT,
    supports: {}
  };
  const action = changeSublanguage(sublang);
  expect(action).toEqual({
    type: changeSublanguage.type,
    payload: {
      sublang
    }
  });
});

test('updateChapter generates correct action object', () => {
  const sublang: SALanguage = {
    chapter: Chapter.SOURCE_2,
    variant: Variant.DEFAULT,
    displayName: 'Source \xa72',
    mainLanguage: SupportedLanguage.JAVASCRIPT,
    supports: {}
  };
  const action = updateSublanguage(sublang);
  expect(action).toEqual({
    type: updateSublanguage.type,
    payload: {
      sublang
    }
  });
});

test('toggleUsingSubst generates correct action object', () => {
  const action = toggleUsingSubst(true, playgroundWorkspace);
  expect(action).toEqual({
    type: toggleUsingSubst.type,
    payload: {
      workspaceLocation: playgroundWorkspace,
      usingSubst: true
    }
  });
});

// TODO: Add toggleusingcse
