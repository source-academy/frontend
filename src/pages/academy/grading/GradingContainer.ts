import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
  acknowledgeNotifications,
  fetchGradingOverviews,
  unsubmitSubmission
} from '../../../commons/application/actions/SessionActions';
import { OverallState } from '../../../commons/application/ApplicationTypes';
import Grading, { DispatchProps, StateProps } from './GradingComponent';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  gradingOverviews: state.session.gradingOverviews,
  group: state.session.group,
  notifications: state.session.notifications,
  role: state.session.role
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleAcknowledgeNotifications: acknowledgeNotifications,
      handleFetchGradingOverviews: fetchGradingOverviews,
      handleUnsubmitSubmission: unsubmitSubmission
    },
    dispatch
  );

const GradingContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Grading);

export default GradingContainer;
