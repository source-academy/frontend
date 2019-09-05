import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
  beginDebuggerPause,
  beginInterruptExecution,
  browseReplHistoryDown,
  browseReplHistoryUp,
  changeEditorHeight,
  changeEditorWidth,
  changeSideContentHeight,
  chapterSelect,
  clearReplOutput,
  debuggerReset,
  debuggerResume,
  evalEditor,
  evalRepl,
  evalTestcase,
  fetchAssessment,
  fetchGrading,
  setEditorBreakpoint,
  updateActiveTab,
  updateEditorValue,
  updateHasUnsavedChanges,
  updateReplValue,
  WorkspaceLocation,
  WorkspaceLocations
} from '../../../actions';
import {
  beginClearContext,
  resetWorkspace,
  updateCurrentSubmissionId
} from '../../../actions/workspaces';
import GradingWorkspace, {
  DispatchProps,
  OwnProps,
  StateProps
} from '../../../components/academy/grading/GradingWorkspace';
import { Library } from '../../../components/assessment/assessmentShape';
import { IState, IWorkspaceState, SideContentType } from '../../../reducers/states';

const workspaceLocation: WorkspaceLocation = WorkspaceLocations.grading;

const mapStateToProps: MapStateToProps<StateProps, OwnProps, IState> = (state, props) => {
  return {
    assessment: state.session.assessments.get(props.assessmentId),
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
    output: state.workspaces.grading.output,
    replValue: state.workspaces.grading.replValue,
    sideContentHeight: state.workspaces.grading.sideContentHeight,
    storedAssessmentId: state.workspaces.grading.currentAssessment,
    storedSubmissionId: state.workspaces.grading.currentSubmission,
    storedQuestionId: state.workspaces.grading.currentQuestion
  };
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators<DispatchProps>(
    {
      handleAssessmentFetch: fetchAssessment,
      handleActiveTabChange: (activeTab: SideContentType) =>
        updateActiveTab(activeTab, workspaceLocation),
      handleBrowseHistoryDown: () => browseReplHistoryDown(workspaceLocation),
      handleBrowseHistoryUp: () => browseReplHistoryUp(workspaceLocation),
      handleChapterSelect: (chapter: any, changeEvent: any) =>
        chapterSelect(chapter, workspaceLocation),
      handleClearContext: (library: Library) => beginClearContext(library, workspaceLocation),
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
      handleResetWorkspace: (options: Partial<IWorkspaceState>) =>
        resetWorkspace(workspaceLocation, options),
      handleSideContentHeightChange: (heightChange: number) =>
        changeSideContentHeight(heightChange, workspaceLocation),
      handleTestcaseEval: (testcaseId: number) => evalTestcase(workspaceLocation, testcaseId),
      handleUpdateCurrentSubmissionId: updateCurrentSubmissionId,
      handleUpdateHasUnsavedChanges: (unsavedChanges: boolean) =>
        updateHasUnsavedChanges(workspaceLocation, unsavedChanges),
      handleDebuggerPause: () => beginDebuggerPause(workspaceLocation),
      handleDebuggerResume: () => debuggerResume(workspaceLocation),
      handleDebuggerReset: () => debuggerReset(workspaceLocation)
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GradingWorkspace);
