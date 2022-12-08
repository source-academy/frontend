import { Chapter, Variant } from 'js-slang/dist/types';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators, DeepPartial, Dispatch } from 'redux';

import { loginGitHub, logoutGitHub } from '../../commons/application/actions/SessionActions';
import { OverallState } from '../../commons/application/ApplicationTypes';
import { Position } from '../../commons/editor/EditorTypes';
import {
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
    activeEditorTabIndex: state.workspaces.githubAssessment.activeEditorTabIndex,
    editorTabs: state.workspaces.githubAssessment.editorTabs,
    editorTestcases: state.workspaces.githubAssessment.editorTestcases,
    breakpoints: state.workspaces.githubAssessment.breakpoints,
    hasUnsavedChanges: state.workspaces.githubAssessment.hasUnsavedChanges,
    isRunning: state.workspaces.githubAssessment.isRunning,
    isDebugging: state.workspaces.githubAssessment.isDebugging,
    enableDebugging: state.workspaces.githubAssessment.enableDebugging,
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
      handleChapterSelect: (chapter: Chapter) =>
        chapterSelect(chapter, Variant.DEFAULT, workspaceLocation),
      handleDeclarationNavigate: (cursorPosition: Position) =>
        navigateToDeclaration(workspaceLocation, cursorPosition),
      handleEditorEval: () => evalEditor(workspaceLocation),
      handleEditorValueChange: (val: string) => updateEditorValue(val, workspaceLocation),
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
      handleUpdateWorkspace: (options: DeepPartial<WorkspaceState>) =>
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
