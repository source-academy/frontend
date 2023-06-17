import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

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
    grading: state.session.gradings.get(props.submissionId),
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
      handlePromptAutocomplete: (row: number, col: number, callback: any) =>
        promptAutocomplete(workspaceLocation, row, col, callback)
    },
    dispatch
  );

const GradingWorkspaceContainer = connect(mapStateToProps, mapDispatchToProps)(GradingWorkspace);

export default GradingWorkspaceContainer;
