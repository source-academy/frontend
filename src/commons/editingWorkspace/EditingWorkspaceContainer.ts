import { Chapter, Variant } from 'js-slang/dist/types';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
  beginDebuggerPause,
  beginInterruptExecution,
  debuggerReset,
  debuggerResume
} from '../application/actions/InterpreterActions';
import { submitAnswer } from '../application/actions/SessionActions';
import { OverallState } from '../application/ApplicationTypes';
import { Library } from '../assessment/AssessmentTypes';
import { Position } from '../editor/EditorTypes';
import {
  beginClearContext,
  browseReplHistoryDown,
  browseReplHistoryUp,
  changeSideContentHeight,
  chapterSelect,
  clearReplOutput,
  evalEditor,
  evalRepl,
  evalTestcase,
  navigateToDeclaration,
  promptAutocomplete,
  resetWorkspace,
  setEditorBreakpoint,
  updateCurrentAssessmentId,
  updateEditorValue,
  updateHasUnsavedChanges,
  updateReplValue,
  updateWorkspace
} from '../workspace/WorkspaceActions';
import { WorkspaceLocation, WorkspaceState } from '../workspace/WorkspaceTypes';
import EditingWorkspace, { DispatchProps, OwnProps, StateProps } from './EditingWorkspace';

const mapStateToProps: MapStateToProps<StateProps, OwnProps, OverallState> = (state, props) => {
  return {
    hasUnsavedChanges: state.workspaces.assessment.hasUnsavedChanges,
    isRunning: state.workspaces.assessment.isRunning,
    isDebugging: state.workspaces.assessment.isDebugging,
    enableDebugging: state.workspaces.assessment.enableDebugging,
    output: state.workspaces.assessment.output,
    replValue: state.workspaces.assessment.replValue,
    sideContentHeight: state.workspaces.assessment.sideContentHeight,
    storedAssessmentId: state.workspaces.assessment.currentAssessment,
    storedQuestionId: state.workspaces.assessment.currentQuestion
  };
};

const workspaceLocation: WorkspaceLocation = 'assessment';

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleBrowseHistoryDown: () => browseReplHistoryDown(workspaceLocation),
      handleBrowseHistoryUp: () => browseReplHistoryUp(workspaceLocation),
      handleChapterSelect: (chapter: Chapter, changeEvent: any) =>
        chapterSelect(chapter, Variant.DEFAULT, workspaceLocation),
      handleClearContext: (library: Library, shouldInitLibrary: boolean) =>
        beginClearContext(workspaceLocation, library, shouldInitLibrary),
      handleDeclarationNavigate: (cursorPosition: Position) =>
        navigateToDeclaration(workspaceLocation, cursorPosition),
      handleEditorEval: () => evalEditor(workspaceLocation),
      handleEditorValueChange: (editorTabIndex: number, newEditorValue: string) =>
        updateEditorValue(workspaceLocation, editorTabIndex, newEditorValue),
      handleEditorUpdateBreakpoints: (editorTabIndex: number, newBreakpoints: string[]) =>
        setEditorBreakpoint(workspaceLocation, editorTabIndex, newBreakpoints),
      handleInterruptEval: () => beginInterruptExecution(workspaceLocation),
      handleReplEval: () => evalRepl(workspaceLocation),
      handleReplOutputClear: () => clearReplOutput(workspaceLocation),
      handleReplValueChange: (newValue: string) => updateReplValue(newValue, workspaceLocation),
      handleResetWorkspace: (options: Partial<WorkspaceState>) =>
        resetWorkspace(workspaceLocation, options),
      handleUpdateWorkspace: (options: Partial<WorkspaceState>) =>
        updateWorkspace(workspaceLocation, options),
      handleSave: submitAnswer,
      handleSideContentHeightChange: (heightChange: number) =>
        changeSideContentHeight(heightChange, workspaceLocation),
      handleTestcaseEval: (testcaseId: number) => evalTestcase(workspaceLocation, testcaseId),
      handleUpdateHasUnsavedChanges: (hasUnsavedChanges: boolean) =>
        updateHasUnsavedChanges(workspaceLocation, hasUnsavedChanges),
      handleUpdateCurrentAssessmentId: updateCurrentAssessmentId,
      handleDebuggerPause: () => beginDebuggerPause(workspaceLocation),
      handleDebuggerResume: () => debuggerResume(workspaceLocation),
      handleDebuggerReset: () => debuggerReset(workspaceLocation),
      handlePromptAutocomplete: (row: number, col: number, callback: any) =>
        promptAutocomplete(workspaceLocation, row, col, callback)
    },
    dispatch
  );

const EditingWorkspaceContainer = connect(mapStateToProps, mapDispatchToProps)(EditingWorkspace);

export default EditingWorkspaceContainer;
