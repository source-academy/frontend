import { Chapter, Variant } from 'js-slang/dist/langs';
import { describe, expect, it } from 'vitest';
import { changeSideContentHeight } from 'src/commons/sideContent/SideContentActions';

import {
  SupportedLanguage,
  createDefaultWorkspace,
  type SALanguage
} from '../../application/ApplicationTypes';
import { ExternalLibraryName } from '../../application/types/ExternalTypes';
import type { Library } from '../../assessment/AssessmentTypes';
import type { HighlightedLines } from '../../editor/EditorTypes';
import WorkspaceActions from '../WorkspaceActions';
import type { EditorTabState, WorkspaceLocation } from '../WorkspaceTypes';

const assessmentWorkspace: WorkspaceLocation = 'assessment';
const gradingWorkspace: WorkspaceLocation = 'grading';
const playgroundWorkspace: WorkspaceLocation = 'playground';

describe(WorkspaceActions.browseReplHistoryDown.type, () => {
  it('generates correct action object', () => {
    const action = WorkspaceActions.browseReplHistoryDown(assessmentWorkspace);
    expect(action).toEqual({
      type: WorkspaceActions.browseReplHistoryDown.type,
      payload: { workspaceLocation: assessmentWorkspace }
    });
  });
});

describe(WorkspaceActions.browseReplHistoryUp.type, () => {
  it('generates correct action object', () => {
    const action = WorkspaceActions.browseReplHistoryUp(gradingWorkspace);
    expect(action).toEqual({
      type: WorkspaceActions.browseReplHistoryUp.type,
      payload: { workspaceLocation: gradingWorkspace }
    });
  });
});

describe(WorkspaceActions.changeExternalLibrary.type, () => {
  it('generates correct action object', () => {
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
});

describe(changeSideContentHeight.type, () => {
  it('generates correct action object', () => {
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
});

describe(WorkspaceActions.chapterSelect.type, () => {
  it('generates correct action object', () => {
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
});

describe(WorkspaceActions.externalLibrarySelect.type, () => {
  it('generates correct action object', () => {
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
});

describe(WorkspaceActions.toggleEditorAutorun.type, () => {
  it('generates correct action object', () => {
    const action = WorkspaceActions.toggleEditorAutorun(gradingWorkspace);
    expect(action).toEqual({
      type: WorkspaceActions.toggleEditorAutorun.type,
      payload: {
        workspaceLocation: gradingWorkspace
      }
    });
  });
});

describe(WorkspaceActions.beginClearContext.type, () => {
  it('generates correct action object', () => {
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
});

describe(WorkspaceActions.clearReplInput.type, () => {
  it('generates correct action object', () => {
    const action = WorkspaceActions.clearReplInput(assessmentWorkspace);
    expect(action).toEqual({
      type: WorkspaceActions.clearReplInput.type,
      payload: {
        workspaceLocation: assessmentWorkspace
      }
    });
  });
});

describe(WorkspaceActions.clearReplOutputLast.type, () => {
  it('generates correct action object', () => {
    const action = WorkspaceActions.clearReplOutputLast(assessmentWorkspace);
    expect(action).toEqual({
      type: WorkspaceActions.clearReplOutputLast.type,
      payload: {
        workspaceLocation: assessmentWorkspace
      }
    });
  });
});

describe(WorkspaceActions.clearReplOutput.type, () => {
  it('generates correct action object', () => {
    const action = WorkspaceActions.clearReplOutput(gradingWorkspace);
    expect(action).toEqual({
      type: WorkspaceActions.clearReplOutput.type,
      payload: {
        workspaceLocation: gradingWorkspace
      }
    });
  });
});

describe(WorkspaceActions.endClearContext.type, () => {
  it('generates correct action object', () => {
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
});

describe(WorkspaceActions.evalEditor.type, () => {
  it('generates correct action object', () => {
    const action = WorkspaceActions.evalEditor(assessmentWorkspace);
    expect(action).toEqual({
      type: WorkspaceActions.evalEditor.type,
      payload: {
        workspaceLocation: assessmentWorkspace
      }
    });
  });
});

describe(WorkspaceActions.evalRepl.type, () => {
  it('generates correct action object', () => {
    const action = WorkspaceActions.evalRepl(gradingWorkspace);
    expect(action).toEqual({
      type: WorkspaceActions.evalRepl.type,
      payload: {
        workspaceLocation: gradingWorkspace
      }
    });
  });
});

describe(WorkspaceActions.evalTestcase.type, () => {
  it('generates correct action object', () => {
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
});

describe(WorkspaceActions.toggleFolderMode.type, () => {
  it('generates correct action object', () => {
    const action = WorkspaceActions.toggleFolderMode(gradingWorkspace);
    expect(action).toEqual({
      type: WorkspaceActions.toggleFolderMode.type,
      payload: {
        workspaceLocation: gradingWorkspace
      }
    });
  });
});

describe(WorkspaceActions.setFolderMode.type, () => {
  it('generates correct action object', () => {
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
});

describe(WorkspaceActions.updateActiveEditorTabIndex.type, () => {
  it('generates correct action object', () => {
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
});

describe(WorkspaceActions.updateActiveEditorTab.type, () => {
  it('generates correct action object', () => {
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
});

describe(WorkspaceActions.updateEditorValue.type, () => {
  it('generates correct action object', () => {
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
});

describe(WorkspaceActions.setEditorBreakpoint.type, () => {
  it('generates correct action object', () => {
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
});

describe(WorkspaceActions.setEditorHighlightedLines.type, () => {
  it('generates correct action object', () => {
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
});

// TODO: Test setEditorHighlightedLinesControl
describe.todo(WorkspaceActions.setEditorHighlightedLinesControl.type);

describe(WorkspaceActions.moveCursor.type, () => {
  it('generates correct action object', () => {
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
});

describe(WorkspaceActions.addEditorTab.type, () => {
  it('generates correct action object', () => {
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
});
describe(WorkspaceActions.shiftEditorTab.type, () => {
  it('generates correct action object', () => {
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
});

describe(WorkspaceActions.removeEditorTab.type, () => {
  it('generates correct action object', () => {
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
});

describe(WorkspaceActions.removeEditorTabForFile.type, () => {
  it('generates correct action object', () => {
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
});

describe(WorkspaceActions.removeEditorTabsForDirectory.type, () => {
  it('generates correct action object', () => {
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
});

describe(WorkspaceActions.renameEditorTabForFile.type, () => {
  it('generates correct action object', () => {
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
});

describe(WorkspaceActions.renameEditorTabsForDirectory.type, () => {
  it('generates correct action object', () => {
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
});

describe(WorkspaceActions.updateReplValue.type, () => {
  it('generates correct action object', () => {
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
});

describe(WorkspaceActions.sendReplInputToOutput.type, () => {
  it('generates correct action object', () => {
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
});

describe(WorkspaceActions.resetTestcase.type, () => {
  it('generates correct action object', () => {
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
});

describe(WorkspaceActions.resetWorkspace.type, () => {
  it('generates correct default action object', () => {
    const action = WorkspaceActions.resetWorkspace(playgroundWorkspace);
    expect(action).toEqual({
      type: WorkspaceActions.resetWorkspace.type,
      payload: {
        workspaceLocation: playgroundWorkspace
      }
    });
  });
});

describe(WorkspaceActions.resetWorkspace.type, () => {
  it('generates correct action object with provided workspace', () => {
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
});

describe(WorkspaceActions.updateSubmissionsTableFilters.type, () => {
  it('generates correct action object', () => {
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
});

describe(WorkspaceActions.updateCurrentAssessmentId.type, () => {
  it('generates correct action object', () => {
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
});

describe(WorkspaceActions.updateCurrentSubmissionId.type, () => {
  it('generates correct action object', () => {
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
});

describe(WorkspaceActions.updateHasUnsavedChanges.type, () => {
  it('generates correct action object', () => {
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
});

describe(WorkspaceActions.navigateToDeclaration.type, () => {
  it('generates correct action object', () => {
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
});

describe(WorkspaceActions.changeSublanguage.type, () => {
  it('generates correct action object', () => {
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
});

describe(WorkspaceActions.updateSublanguage.type, () => {
  it('generates correct action object', () => {
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
});

describe(WorkspaceActions.toggleUsingSubst.type, () => {
  it('generates correct action object', () => {
    const action = WorkspaceActions.toggleUsingSubst(true, playgroundWorkspace);
    expect(action).toEqual({
      type: WorkspaceActions.toggleUsingSubst.type,
      payload: {
        workspaceLocation: playgroundWorkspace,
        usingSubst: true
      }
    });
  });
});

// TODO: Add toggleusingcse
describe.todo(WorkspaceActions.toggleUsingCse.type);
