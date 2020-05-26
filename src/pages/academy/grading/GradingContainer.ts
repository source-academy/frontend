import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
  acknowledgeNotifications,
  fetchGradingOverviews,
  unsubmitSubmission
} from 'src/commons/application/actions/SessionActions';
import { IState } from 'src/reducers/states';
import Grading, { DispatchProps, StateProps } from './GradingComponent';

const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => ({
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
