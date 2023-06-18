import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { submitAnswer } from '../application/actions/SessionActions';
import { OverallState } from '../application/ApplicationTypes';
import {
  evalRepl,
  setEditorBreakpoint,
  updateEditorValue,
  updateHasUnsavedChanges
} from '../workspace/WorkspaceActions';
import { WorkspaceLocation } from '../workspace/WorkspaceTypes';
import AssessmentWorkspace, { DispatchProps, OwnProps, StateProps } from './AssessmentWorkspace';

const mapStateToProps: MapStateToProps<StateProps, OwnProps, OverallState> = (state, props) => {
  return {
    courseId: state.session.courseId,
    assessment: state.session.assessments.get(props.assessmentId)
  };
};

const workspaceLocation: WorkspaceLocation = 'assessment';

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleEditorValueChange: (editorTabIndex: number, newEditorValue: string) =>
        updateEditorValue(workspaceLocation, editorTabIndex, newEditorValue),
      handleEditorUpdateBreakpoints: (editorTabIndex: number, newBreakpoints: string[]) =>
        setEditorBreakpoint(workspaceLocation, editorTabIndex, newBreakpoints),
      handleReplEval: () => evalRepl(workspaceLocation),
      handleSave: submitAnswer,
      handleUpdateHasUnsavedChanges: (hasUnsavedChanges: boolean) =>
        updateHasUnsavedChanges(workspaceLocation, hasUnsavedChanges)
    },
    dispatch
  );

const AssessmentWorkspaceContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AssessmentWorkspace);

export default AssessmentWorkspaceContainer;
