import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../../../../commons/application/ApplicationTypes';
import { WorkspaceLocation } from '../../../../commons/workspace/WorkspaceTypes';
import GradingWorkspace, { DispatchProps, OwnProps, StateProps } from './GradingWorkspace';

const workspaceLocation: WorkspaceLocation = 'grading';

const mapStateToProps: MapStateToProps<StateProps, OwnProps, OverallState> = (state, props) => {
  return {
    grading: state.session.gradings.get(props.submissionId),
    courseId: state.session.courseId
  };
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators({}, dispatch);

const GradingWorkspaceContainer = connect(mapStateToProps, mapDispatchToProps)(GradingWorkspace);

export default GradingWorkspaceContainer;
