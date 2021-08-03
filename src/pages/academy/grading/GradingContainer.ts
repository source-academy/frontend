import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
  acknowledgeNotifications,
  fetchGradingOverviews,
  reautogradeSubmission,
  unsubmitSubmission
} from '../../../commons/application/actions/SessionActions';
import { OverallState } from '../../../commons/application/ApplicationTypes';
import Grading, { DispatchProps, StateProps } from './Grading';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  gradingOverviews: state.session.gradingOverviews,
  courseRegId: state.session.courseRegId,
  notifications: state.session.notifications,
  role: state.session.role
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleAcknowledgeNotifications: acknowledgeNotifications,
      handleFetchGradingOverviews: fetchGradingOverviews,
      handleUnsubmitSubmission: unsubmitSubmission,
      handleReautogradeSubmission: reautogradeSubmission
    },
    dispatch
  );

const GradingContainer = connect(mapStateToProps, mapDispatchToProps)(Grading);

export default GradingContainer;
