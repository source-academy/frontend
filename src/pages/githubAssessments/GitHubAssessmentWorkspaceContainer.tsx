import { Chapter, Variant } from 'js-slang/dist/types';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../../commons/application/ApplicationTypes';
import {
  chapterSelect,
  clearReplOutput,
  evalEditor,
  evalRepl,
  updateEditorValue,
  updateHasUnsavedChanges,
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
      handleChapterSelect: (chapter: Chapter) =>
        chapterSelect(chapter, Variant.DEFAULT, workspaceLocation),
      handleEditorEval: () => evalEditor(workspaceLocation),
      handleEditorValueChange: (val: string) => updateEditorValue(val, workspaceLocation),
      handleReplEval: () => evalRepl(workspaceLocation),
      handleReplOutputClear: () => clearReplOutput(workspaceLocation),
      handleUpdateHasUnsavedChanges: (hasUnsavedChanges: boolean) =>
        updateHasUnsavedChanges(workspaceLocation, hasUnsavedChanges),
      handleUpdateWorkspace: (options: Partial<WorkspaceState>) =>
        updateWorkspace(workspaceLocation, options)
    },
    dispatch
  );

const GitHubAssessmentWorkspaceContainer = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(MissionEditor)
);

export default GitHubAssessmentWorkspaceContainer;
