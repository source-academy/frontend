import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../application/ApplicationTypes';
import EditingWorkspace, { DispatchProps, OwnProps, StateProps } from './EditingWorkspace';

const mapStateToProps: MapStateToProps<StateProps, OwnProps, OverallState> = (state, props) => {
  return {};
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators({}, dispatch);

const EditingWorkspaceContainer = connect(mapStateToProps, mapDispatchToProps)(EditingWorkspace);

export default EditingWorkspaceContainer;
