import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../../../../commons/application/ApplicationTypes';
import GradingWorkspace, { DispatchProps, OwnProps, StateProps } from './GradingWorkspace';

const mapStateToProps: MapStateToProps<StateProps, OwnProps, OverallState> = (state, props) => {
  return {};
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators({}, dispatch);

const GradingWorkspaceContainer = connect(mapStateToProps, mapDispatchToProps)(GradingWorkspace);

export default GradingWorkspaceContainer;
