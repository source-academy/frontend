import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';

import { loginGitHub, logoutGitHub } from '../../commons/application/actions/SessionActions';
import { OverallState } from '../../commons/application/ApplicationTypes';
import { Position } from '../../commons/editor/EditorTypes';
import {
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
  runAllTestcases,
  setEditorBreakpoint,
  updateEditorValue,
  updateHasUnsavedChanges,
  updateReplValue,
  updateWorkspace
} from '../../commons/workspace/WorkspaceActions';
import { WorkspaceLocation, WorkspaceState } from '../../commons/workspace/WorkspaceTypes';
import MissionEditor, { DispatchProps, StateProps } from './GitHubAssessmentWorkspace';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => {
  return {
    editorPrepend: state.workspaces.githubAssessment.editorPrepend,
    editorValue: state.workspaces.githubAssessment.editorValue,
    editorPostpend: state.workspaces.githubAssessment.editorPostpend,
    editorTestcases: state.workspaces.githubAssessment.editorTestcases,
    editorHeight: state.workspaces.githubAssessment.editorHeight,
    editorWidth: state.workspaces.githubAssessment.editorWidth,
    breakpoints: state.workspaces.githubAssessment.breakpoints,
    highlightedLines: state.workspaces.githubAssessment.highlightedLines,
    hasUnsavedChanges: state.workspaces.githubAssessment.hasUnsavedChanges,
    isRunning: state.workspaces.githubAssessment.isRunning,
    isDebugging: state.workspaces.githubAssessment.isDebugging,
    enableDebugging: state.workspaces.githubAssessment.enableDebugging,
    newCursorPosition: state.workspaces.githubAssessment.newCursorPosition,
    output: state.workspaces.githubAssessment.output,
    replValue: state.workspaces.githubAssessment.replValue,
    sideContentHeight: state.workspaces.githubAssessment.sideContentHeight,
    sourceChapter: state.workspaces.githubAssessment.context.chapter
  };
};

const workspaceLocation: WorkspaceLocation = 'githubAssessment';

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleBrowseHistoryDown: () => browseReplHistoryDown(workspaceLocation),
      handleBrowseHistoryUp: () => browseReplHistoryUp(workspaceLocation),
      handleChapterSelect: (chapter: number) =>
        chapterSelect(chapter, 'default', workspaceLocation),
      handleDeclarationNavigate: (cursorPosition: Position) =>
        navigateToDeclaration(workspaceLocation, cursorPosition),
      handleEditorEval: () => evalEditor(workspaceLocation),
      handleEditorValueChange: (val: string) => updateEditorValue(val, workspaceLocation),
      handleEditorHeightChange: (height: number) => changeEditorHeight(height, workspaceLocation),
      handleEditorWidthChange: (widthChange: number) =>
        changeEditorWidth(widthChange.toString(), workspaceLocation),
      handleEditorUpdateBreakpoints: (breakpoints: string[]) =>
        setEditorBreakpoint(breakpoints, workspaceLocation),
      handleReplEval: () => evalRepl(workspaceLocation),
      handleReplOutputClear: () => clearReplOutput(workspaceLocation),
      handleReplValueChange: (newValue: string) => updateReplValue(newValue, workspaceLocation),
      handleSideContentHeightChange: (heightChange: number) =>
        changeSideContentHeight(heightChange, workspaceLocation),
      handleTestcaseEval: (testcaseId: number) => evalTestcase(workspaceLocation, testcaseId),
      handleRunAllTestcases: () => runAllTestcases(workspaceLocation),
      handleUpdateHasUnsavedChanges: (hasUnsavedChanges: boolean) =>
        updateHasUnsavedChanges(workspaceLocation, hasUnsavedChanges),
      handleUpdateWorkspace: (options: Partial<WorkspaceState>) =>
        updateWorkspace(workspaceLocation, options),
      handlePromptAutocomplete: (row: number, col: number, callback: any) =>
        promptAutocomplete(workspaceLocation, row, col, callback),
      handleGitHubLogIn: loginGitHub,
      handleGitHubLogOut: logoutGitHub
    },
    dispatch
  );

const GitHubAssessmentWorkspaceContainer = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(MissionEditor)
);

export default GitHubAssessmentWorkspaceContainer;
