import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { updateAssessment } from '../application/actions/SessionActions';
import MissionCreator, { DispatchProps } from './MissionCreator';

const mapStateToProps: MapStateToProps<{}, any, {}> = (state, ownProps) => ownProps;

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      newAssessment: updateAssessment
    },
    dispatch
  );

const MissionCreatorContainer = connect(mapStateToProps, mapDispatchToProps)(MissionCreator);

export default MissionCreatorContainer;
