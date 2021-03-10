import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../application/ApplicationTypes';
import GitHubOverlay, { DispatchProps, OwnProps, StateProps } from './GitHubOverlay';

const mapStateToProps: MapStateToProps<StateProps, OwnProps, OverallState> = (state, props) => {
  return {};
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators({}, dispatch);

const GitHubOverlayContainer = connect(mapStateToProps, mapDispatchToProps)(GitHubOverlay);

export default GitHubOverlayContainer;
