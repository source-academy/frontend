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
import {
  beginClearContext,
  browseReplHistoryDown,
  browseReplHistoryUp,
  changeExecTime,
  changeSideContentHeight,
  clearReplOutput,
  evalEditor,
  evalRepl,
  evalTestcase,
  navigateToDeclaration,
  promptAutocomplete,
  removeEditorTab,
  resetWorkspace,
  runAllTestcases,
  sendReplInputToOutput,
  setEditorBreakpoint,
  updateActiveEditorTabIndex,
  updateCurrentSubmissionId,
  updateEditorValue,
  updateHasUnsavedChanges,
  updateReplValue
} from '../../../../commons/workspace/WorkspaceActions';
import { WorkspaceLocation, WorkspaceState } from '../../../../commons/workspace/WorkspaceTypes';
import GradingWorkspace, { DispatchProps, OwnProps, StateProps } from './GradingWorkspace';

const workspaceLocation: WorkspaceLocation = 'grading';

const mapStateToProps: MapStateToProps<StateProps, OwnProps, OverallState> = (state, props) => {
  return {
    autogradingResults: state.workspaces.grading.autogradingResults,
    isFolderModeEnabled: state.workspaces.grading.isFolderModeEnabled,
    activeEditorTabIndex: state.workspaces.grading.activeEditorTabIndex,
    editorTabs: state.workspaces.grading.editorTabs,
    editorTestcases: state.workspaces.grading.editorTestcases,
    grading: state.session.gradings.get(props.submissionId),
    hasUnsavedChanges: state.workspaces.grading.hasUnsavedChanges,
    isRunning: state.workspaces.grading.isRunning,
    isDebugging: state.workspaces.grading.isDebugging,
    enableDebugging: state.workspaces.grading.enableDebugging,
    output: state.workspaces.grading.output,
    replValue: state.workspaces.grading.replValue,
    sideContentHeight: state.workspaces.grading.sideContentHeight,
    storedSubmissionId: state.workspaces.grading.currentSubmission,
    storedQuestionId: state.workspaces.grading.currentQuestion,
    courseId: state.session.courseId
  };
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleBrowseHistoryDown: () => browseReplHistoryDown(workspaceLocation),
      handleBrowseHistoryUp: () => browseReplHistoryUp(workspaceLocation),
      handleClearContext: (library: Library, shouldInitLibrary: boolean) =>
        beginClearContext(workspaceLocation, library, shouldInitLibrary),
      handleDeclarationNavigate: (cursorPosition: Position) =>
        navigateToDeclaration(workspaceLocation, cursorPosition),
      handleEditorEval: () => evalEditor(workspaceLocation),
      handleSetActiveEditorTabIndex: (activeEditorTabIndex: number | null) =>
        updateActiveEditorTabIndex(workspaceLocation, activeEditorTabIndex),
      handleRemoveEditorTabByIndex: (editorTabIndex: number) =>
        removeEditorTab(workspaceLocation, editorTabIndex),
      handleEditorValueChange: (editorTabIndex: number, newEditorValue: string) =>
        updateEditorValue(workspaceLocation, 0, newEditorValue),
      handleEditorUpdateBreakpoints: (editorTabIndex: number, newBreakpoints: string[]) =>
        setEditorBreakpoint(workspaceLocation, editorTabIndex, newBreakpoints),
      handleGradingFetch: fetchGrading,
      handleInterruptEval: () => beginInterruptExecution(workspaceLocation),
      handleReplEval: () => evalRepl(workspaceLocation),
      handleReplOutputClear: () => clearReplOutput(workspaceLocation),
      handleReplValueChange: (newValue: string) => updateReplValue(newValue, workspaceLocation),
      handleSendReplInputToOutput: (code: string) => sendReplInputToOutput(code, workspaceLocation),
      handleResetWorkspace: (options: Partial<WorkspaceState>) =>
        resetWorkspace(workspaceLocation, options),
      handleChangeExecTime: (execTimeMs: number) => changeExecTime(execTimeMs, workspaceLocation),
      handleSideContentHeightChange: (heightChange: number) =>
        changeSideContentHeight(heightChange, workspaceLocation),
      handleTestcaseEval: (testcaseId: number) => evalTestcase(workspaceLocation, testcaseId),
      handleRunAllTestcases: () => runAllTestcases(workspaceLocation),
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

const GradingWorkspaceContainer = connect(mapStateToProps, mapDispatchToProps)(GradingWorkspace);

export default GradingWorkspaceContainer;
