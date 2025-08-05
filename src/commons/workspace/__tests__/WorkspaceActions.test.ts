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
import WorkspaceActions from '../WorkspaceActions';
import { EditorTabState, WorkspaceLocation } from '../WorkspaceTypes';

const assessmentWorkspace: WorkspaceLocation = 'assessment';
const gradingWorkspace: WorkspaceLocation = 'grading';
const playgroundWorkspace: WorkspaceLocation = 'playground';

test('browseReplHistoryDown generates correct action object', () => {
  const action = WorkspaceActions.browseReplHistoryDown(assessmentWorkspace);
  expect(action).toEqual({
    type: WorkspaceActions.browseReplHistoryDown.type,
    payload: { workspaceLocation: assessmentWorkspace }
  });
});

test('browseReplHistoryUp generates correct action object', () => {
  const action = WorkspaceActions.browseReplHistoryUp(gradingWorkspace);
  expect(action).toEqual({
    type: WorkspaceActions.browseReplHistoryUp.type,
    payload: { workspaceLocation: gradingWorkspace }
  });
});

test('changeExternalLibrary generates correct action object', () => {
  const newExternal = 'new-external-test' as ExternalLibraryName;
  const action = WorkspaceActions.changeExternalLibrary(newExternal, playgroundWorkspace);
  expect(action).toEqual({
    type: WorkspaceActions.changeExternalLibrary.type,
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
  const action = WorkspaceActions.chapterSelect(chapter, variant, playgroundWorkspace);
  expect(action).toEqual({
    type: WorkspaceActions.chapterSelect.type,
    payload: {
      chapter,
      variant,
      workspaceLocation: playgroundWorkspace
    }
  });
});

test('externalLibrarySelect generates correct action object', () => {
  const externalLibraryName = ExternalLibraryName.SOUNDS;
  const action = WorkspaceActions.externalLibrarySelect(externalLibraryName, assessmentWorkspace);
  expect(action).toEqual({
    type: WorkspaceActions.externalLibrarySelect.type,
    payload: {
      externalLibraryName,
      workspaceLocation: assessmentWorkspace,
      initialise: false
    }
  });
});

test('toggleEditorAutorun generates correct action object', () => {
  const action = WorkspaceActions.toggleEditorAutorun(gradingWorkspace);
  expect(action).toEqual({
    type: WorkspaceActions.toggleEditorAutorun.type,
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

  const action = WorkspaceActions.beginClearContext(playgroundWorkspace, library, true);
  expect(action).toEqual({
    type: WorkspaceActions.beginClearContext.type,
    payload: {
      library,
      workspaceLocation: playgroundWorkspace,
      shouldInitLibrary: true
    }
  });
});

test('clearReplInput generates correct action object', () => {
  const action = WorkspaceActions.clearReplInput(assessmentWorkspace);
  expect(action).toEqual({
    type: WorkspaceActions.clearReplInput.type,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  });
});

test('clearReplOutputLast generates correct action object', () => {
  const action = WorkspaceActions.clearReplOutputLast(assessmentWorkspace);
  expect(action).toEqual({
    type: WorkspaceActions.clearReplOutputLast.type,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  });
});

test('clearReplOutput generates correct action object', () => {
  const action = WorkspaceActions.clearReplOutput(gradingWorkspace);
  expect(action).toEqual({
    type: WorkspaceActions.clearReplOutput.type,
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

  const action = WorkspaceActions.endClearContext(library, playgroundWorkspace);
  expect(action).toEqual({
    type: WorkspaceActions.endClearContext.type,
    payload: {
      library,
      workspaceLocation: playgroundWorkspace
    }
  });
});

test('evalEditor generates correct action object', () => {
  const action = WorkspaceActions.evalEditor(assessmentWorkspace);
  expect(action).toEqual({
    type: WorkspaceActions.evalEditor.type,
    payload: {
      workspaceLocation: assessmentWorkspace
    }
  });
});

test('evalRepl generates correct action object', () => {
  const action = WorkspaceActions.evalRepl(gradingWorkspace);
  expect(action).toEqual({
    type: WorkspaceActions.evalRepl.type,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  });
});

test('evalTestcase generates correct action object', () => {
  const testcaseId = 3;
  const action = WorkspaceActions.evalTestcase(playgroundWorkspace, testcaseId);
  expect(action).toEqual({
    type: WorkspaceActions.evalTestcase.type,
    payload: {
      testcaseId,
      workspaceLocation: playgroundWorkspace
    }
  });
});

test('toggleFolderMode generates correct action object', () => {
  const action = WorkspaceActions.toggleFolderMode(gradingWorkspace);
  expect(action).toEqual({
    type: WorkspaceActions.toggleFolderMode.type,
    payload: {
      workspaceLocation: gradingWorkspace
    }
  });
});

test('setFolderMode generates correct action object', () => {
  const isFolderModeEnabled = true;
  const action = WorkspaceActions.setFolderMode(gradingWorkspace, isFolderModeEnabled);
  expect(action).toEqual({
    type: WorkspaceActions.setFolderMode.type,
    payload: {
      workspaceLocation: gradingWorkspace,
      isFolderModeEnabled
    }
  });
});

test('updateActiveEditorTabIndex generates correct action object', () => {
  const activeEditorTabIndex = 3;
  const action = WorkspaceActions.updateActiveEditorTabIndex(
    playgroundWorkspace,
    activeEditorTabIndex
  );
  expect(action).toEqual({
    type: WorkspaceActions.updateActiveEditorTabIndex.type,
    payload: {
      workspaceLocation: playgroundWorkspace,
      activeEditorTabIndex
    }
  });
});

test('updateActiveEditorTab generates correct action object', () => {
  const newEditorTab: Partial<EditorTabState> = { value: 'Hello World' };
  const action = WorkspaceActions.updateActiveEditorTab(assessmentWorkspace, newEditorTab);
  expect(action).toEqual({
    type: WorkspaceActions.updateActiveEditorTab.type,
    payload: {
      workspaceLocation: assessmentWorkspace,
      activeEditorTabOptions: newEditorTab
    }
  });
});

test('updateEditorValue generates correct action object', () => {
  const editorTabIndex = 3;
  const newEditorValue = 'new_editor_value';
  const action = WorkspaceActions.updateEditorValue(
    assessmentWorkspace,
    editorTabIndex,
    newEditorValue
  );
  expect(action).toEqual({
    type: WorkspaceActions.updateEditorValue.type,
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
  const action = WorkspaceActions.setEditorBreakpoint(
    gradingWorkspace,
    editorTabIndex,
    newBreakpoints
  );
  expect(action).toEqual({
    type: WorkspaceActions.setEditorBreakpoint.type,
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
  const action = WorkspaceActions.setEditorHighlightedLines(
    playgroundWorkspace,
    editorTabIndex,
    newHighlightedLines
  );
  expect(action).toEqual({
    type: WorkspaceActions.setEditorHighlightedLines.type,
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
  const action = WorkspaceActions.moveCursor(
    playgroundWorkspace,
    editorTabIndex,
    newCursorPosition
  );
  expect(action).toEqual({
    type: WorkspaceActions.moveCursor.type,
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
  const action = WorkspaceActions.addEditorTab(playgroundWorkspace, filePath, editorValue);
  expect(action).toEqual({
    type: WorkspaceActions.addEditorTab.type,
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
  const action = WorkspaceActions.shiftEditorTab(
    playgroundWorkspace,
    previousEditorTabIndex,
    newEditorTabIndex
  );
  expect(action).toEqual({
    type: WorkspaceActions.shiftEditorTab.type,
    payload: {
      workspaceLocation: playgroundWorkspace,
      previousEditorTabIndex,
      newEditorTabIndex
    }
  });
});

test('removeEditorTab generates correct action object', () => {
  const editorTabIndex = 3;
  const action = WorkspaceActions.removeEditorTab(playgroundWorkspace, editorTabIndex);
  expect(action).toEqual({
    type: WorkspaceActions.removeEditorTab.type,
    payload: {
      workspaceLocation: playgroundWorkspace,
      editorTabIndex
    }
  });
});

test('removeEditorTabForFile generates correct action object', () => {
  const removedFilePath = '/dir1/a.js';
  const action = WorkspaceActions.removeEditorTabForFile(playgroundWorkspace, removedFilePath);
  expect(action).toEqual({
    type: WorkspaceActions.removeEditorTabForFile.type,
    payload: {
      workspaceLocation: playgroundWorkspace,
      removedFilePath
    }
  });
});

test('removeEditorTabsForDirectory generates correct action object', () => {
  const removedDirectoryPath = '/dir1';
  const action = WorkspaceActions.removeEditorTabsForDirectory(
    playgroundWorkspace,
    removedDirectoryPath
  );
  expect(action).toEqual({
    type: WorkspaceActions.removeEditorTabsForDirectory.type,
    payload: {
      workspaceLocation: playgroundWorkspace,
      removedDirectoryPath
    }
  });
});

test('renameEditorTabForFile generates correct action object', () => {
  const oldFilePath = '/dir1/a.js';
  const newFilePath = '/dir1/b.js';
  const action = WorkspaceActions.renameEditorTabForFile(
    playgroundWorkspace,
    oldFilePath,
    newFilePath
  );
  expect(action).toEqual({
    type: WorkspaceActions.renameEditorTabForFile.type,
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
  const action = WorkspaceActions.renameEditorTabsForDirectory(
    playgroundWorkspace,
    oldDirectoryPath,
    newDirectoryPath
  );
  expect(action).toEqual({
    type: WorkspaceActions.renameEditorTabsForDirectory.type,
    payload: {
      workspaceLocation: playgroundWorkspace,
      oldDirectoryPath,
      newDirectoryPath
    }
  });
});

test('updateReplValue generates correct action object', () => {
  const newReplValue = 'new_repl_value';
  const action = WorkspaceActions.updateReplValue(newReplValue, assessmentWorkspace);
  expect(action).toEqual({
    type: WorkspaceActions.updateReplValue.type,
    payload: {
      newReplValue,
      workspaceLocation: assessmentWorkspace
    }
  });
});

test('sendReplInputToOutput generates correct action object', () => {
  const newOutput = 'new_output';
  const action = WorkspaceActions.sendReplInputToOutput(newOutput, gradingWorkspace);
  expect(action).toEqual({
    type: WorkspaceActions.sendReplInputToOutput.type,
    payload: {
      type: 'code',
      value: newOutput,
      workspaceLocation: gradingWorkspace
    }
  });
});

test('resetTestcase generates correct action object', () => {
  const index = 420;
  const action = WorkspaceActions.resetTestcase(assessmentWorkspace, index);
  expect(action).toEqual({
    type: WorkspaceActions.resetTestcase.type,
    payload: {
      workspaceLocation: assessmentWorkspace,
      index
    }
  });
});

test('resetWorkspace generates correct default action object', () => {
  const action = WorkspaceActions.resetWorkspace(playgroundWorkspace);
  expect(action).toEqual({
    type: WorkspaceActions.resetWorkspace.type,
    payload: {
      workspaceLocation: playgroundWorkspace
    }
  });
});

test('resetWorkspace generates correct action object with provided workspace', () => {
  const workspaceOptions = createDefaultWorkspace(assessmentWorkspace);
  const action = WorkspaceActions.resetWorkspace(assessmentWorkspace, workspaceOptions);
  expect(action).toEqual({
    type: WorkspaceActions.resetWorkspace.type,
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
  const action = WorkspaceActions.updateSubmissionsTableFilters({ columnFilters });
  expect(action).toEqual({
    type: WorkspaceActions.updateSubmissionsTableFilters.type,
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
  const action = WorkspaceActions.updateCurrentAssessmentId(assessmentId, questionId);
  expect(action).toEqual({
    type: WorkspaceActions.updateCurrentAssessmentId.type,
    payload: {
      assessmentId,
      questionId
    }
  });
});

test('updateCurrentSubmissionId generates correct action object', () => {
  const submissionId = 3;
  const questionId = 6;
  const action = WorkspaceActions.updateCurrentSubmissionId(submissionId, questionId);
  expect(action).toEqual({
    type: WorkspaceActions.updateCurrentSubmissionId.type,
    payload: {
      submissionId,
      questionId
    }
  });
});

test('updateHasUnsavedChanges generates correct action object', () => {
  const hasUnsavedChanges = true;
  const action = WorkspaceActions.updateHasUnsavedChanges(assessmentWorkspace, hasUnsavedChanges);
  expect(action).toEqual({
    type: WorkspaceActions.updateHasUnsavedChanges.type,
    payload: {
      workspaceLocation: assessmentWorkspace,
      hasUnsavedChanges
    }
  });
});

test('navigateToDeclaration generates correct action object', () => {
  const cursorPosition = { row: 0, column: 0 };
  const action = WorkspaceActions.navigateToDeclaration(playgroundWorkspace, cursorPosition);
  expect(action).toEqual({
    type: WorkspaceActions.navigateToDeclaration.type,
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
  const action = WorkspaceActions.changeSublanguage(sublang);
  expect(action).toEqual({
    type: WorkspaceActions.changeSublanguage.type,
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
  const action = WorkspaceActions.updateSublanguage(sublang);
  expect(action).toEqual({
    type: WorkspaceActions.updateSublanguage.type,
    payload: {
      sublang
    }
  });
});

test('toggleUsingSubst generates correct action object', () => {
  const action = WorkspaceActions.toggleUsingSubst(true, playgroundWorkspace);
  expect(action).toEqual({
    type: WorkspaceActions.toggleUsingSubst.type,
    payload: {
      workspaceLocation: playgroundWorkspace,
      usingSubst: true
    }
  });
});

// TODO: Add toggleusingcse
