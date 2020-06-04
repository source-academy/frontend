import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';

// TODO: Import from commons
import { fetchAssessmentOverviews, submitAssessment } from '../../actions/session';
// TODO: Import from commons
import { IState, Role } from '../../reducers/states';
import MissionControl, { IMissionControlDispatchProps, IMissionControlStateProps } from './MissionControlComponent';

const mapStateToProps: MapStateToProps<IMissionControlStateProps, {}, IState> = (state, props) => {
  const stateProps: IMissionControlStateProps = {
    isStudent: state.session.role ? state.session.role === Role.Student : true
  };
  return stateProps;
};

const mapDispatchToProps: MapDispatchToProps<IMissionControlDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleAssessmentOverviewFetch: fetchAssessmentOverviews,
      handleSubmitAssessment: submitAssessment
    },
    dispatch
  );

const MissionControlContainer = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(MissionControl)
);

export default MissionControlContainer;
