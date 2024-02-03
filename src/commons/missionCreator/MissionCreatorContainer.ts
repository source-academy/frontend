import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import MissionCreator from './MissionCreator';

const mapStateToProps: MapStateToProps<{}, any, {}> = (state, ownProps) => ownProps;

const mapDispatchToProps: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) =>
  bindActionCreators({}, dispatch);

const MissionCreatorContainer = connect(mapStateToProps, mapDispatchToProps)(MissionCreator);

export default MissionCreatorContainer;
