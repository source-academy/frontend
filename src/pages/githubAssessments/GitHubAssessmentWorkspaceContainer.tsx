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
    activeEditorTabIndex: state.workspaces.githubAssessment.activeEditorTabIndex,
    isDebugging: state.workspaces.githubAssessment.isDebugging,
    enableDebugging: state.workspaces.githubAssessment.enableDebugging,
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
      handleEditorValueChange: (editorTabIndex: number, newEditorValue: string) =>
        updateEditorValue(workspaceLocation, editorTabIndex, newEditorValue),
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
