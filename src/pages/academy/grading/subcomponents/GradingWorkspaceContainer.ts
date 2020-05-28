import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
  beginDebuggerPause,
  beginInterruptExecution,
  debuggerReset,
  debuggerResume
} from '../../../../commons/application/actions/InterpreterActions';
import { fetchGrading } from '../../../../commons/application/actions/SessionActions';
import { OverallState } from '../../../../commons/application/ApplicationTypes';
import { Library } from '../../../../commons/assessment/AssessmentTypes';
import { Position } from '../../../../commons/editor/EditorTypes';
import { SideContentType } from '../../../../commons/sideContent/SideContentTypes';
import {
  beginClearContext,
  browseReplHistoryDown,
  browseReplHistoryUp,
  changeEditorHeight,
  changeEditorWidth,
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
  updateActiveTab,
  updateCurrentSubmissionId,
  updateEditorValue,
  updateHasUnsavedChanges,
  updateReplValue
} from '../../../../commons/workspace/WorkspaceActions';
import {
  WorkspaceLocation,
  WorkspaceLocations,
  WorkspaceState
} from '../../../../commons/workspace/WorkspaceTypes';

import GradingWorkspace, { DispatchProps, OwnProps, StateProps } from './GradingWorkspaceComponent';

const workspaceLocation: WorkspaceLocation = WorkspaceLocations.grading;

const mapStateToProps: MapStateToProps<StateProps, OwnProps, OverallState> = (state, props) => {
  return {
    autogradingResults: state.workspaces.grading.autogradingResults,
    editorPrepend: state.workspaces.grading.editorPrepend,
    editorValue: state.workspaces.grading.editorValue,
    editorPostpend: state.workspaces.grading.editorPostpend,
    editorTestcases: state.workspaces.grading.editorTestcases,
    editorHeight: state.workspaces.grading.editorHeight,
    editorWidth: state.workspaces.grading.editorWidth,
    breakpoints: state.workspaces.grading.breakpoints,
    highlightedLines: state.workspaces.grading.highlightedLines,
    grading: state.session.gradings.get(props.submissionId),
    hasUnsavedChanges: state.workspaces.grading.hasUnsavedChanges,
    isRunning: state.workspaces.grading.isRunning,
    isDebugging: state.workspaces.grading.isDebugging,
    enableDebugging: state.workspaces.grading.enableDebugging,
    newCursorPosition: state.workspaces.grading.newCursorPosition,
    output: state.workspaces.grading.output,
    replValue: state.workspaces.grading.replValue,
    sideContentHeight: state.workspaces.grading.sideContentHeight,
    storedSubmissionId: state.workspaces.grading.currentSubmission,
    storedQuestionId: state.workspaces.grading.currentQuestion
  };
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleActiveTabChange: (activeTab: SideContentType) =>
        updateActiveTab(activeTab, workspaceLocation),
      handleBrowseHistoryDown: () => browseReplHistoryDown(workspaceLocation),
      handleBrowseHistoryUp: () => browseReplHistoryUp(workspaceLocation),
      handleChapterSelect: (chapter: any, changeEvent: any) =>
        chapterSelect(chapter, 'default', workspaceLocation),
      handleClearContext: (library: Library) => beginClearContext(library, workspaceLocation),
      handleDeclarationNavigate: (cursorPosition: Position) =>
        navigateToDeclaration(workspaceLocation, cursorPosition),
      handleEditorEval: () => evalEditor(workspaceLocation),
      handleEditorValueChange: (val: string) => updateEditorValue(val, workspaceLocation),
      handleEditorHeightChange: (height: number) => changeEditorHeight(height, workspaceLocation),
      handleEditorWidthChange: (widthChange: number) =>
        changeEditorWidth(widthChange.toString(), workspaceLocation),
      handleEditorUpdateBreakpoints: (breakpoints: string[]) =>
        setEditorBreakpoint(breakpoints, workspaceLocation),
      handleGradingFetch: fetchGrading,
      handleInterruptEval: () => beginInterruptExecution(workspaceLocation),
      handleReplEval: () => evalRepl(workspaceLocation),
      handleReplOutputClear: () => clearReplOutput(workspaceLocation),
      handleReplValueChange: (newValue: string) => updateReplValue(newValue, workspaceLocation),
      handleResetWorkspace: (options: Partial<WorkspaceState>) =>
        resetWorkspace(workspaceLocation, options),
      handleSideContentHeightChange: (heightChange: number) =>
        changeSideContentHeight(heightChange, workspaceLocation),
      handleTestcaseEval: (testcaseId: number) => evalTestcase(workspaceLocation, testcaseId),
      handleUpdateCurrentSubmissionId: updateCurrentSubmissionId,
      handleUpdateHasUnsavedChanges: (unsavedChanges: boolean) =>
        updateHasUnsavedChanges(workspaceLocation, unsavedChanges),
      handleDebuggerPause: () => beginDebuggerPause(workspaceLocation),
      handleDebuggerResume: () => debuggerResume(workspaceLocation),
      handleDebuggerReset: () => debuggerReset(workspaceLocation),
      handlePromptAutocomplete: (row: number, col: number, callback: any) =>
        promptAutocomplete(workspaceLocation, row, col, callback)
    },
    dispatch
  );

const GradingWorkspaceContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GradingWorkspace);

export default GradingWorkspaceContainer;
