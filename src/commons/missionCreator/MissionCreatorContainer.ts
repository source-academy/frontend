import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { updateAssessment } from 'src/commons/application/actions/SessionActions';

import MissionCreator, { DispatchProps } from './MissionCreatorComponent';

const mapStateToProps: MapStateToProps<{}, any, {}> = (state, ownProps) => ownProps;

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      newAssessment: updateAssessment
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MissionCreator);
