import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
  acknowledgeNotifications,
  fetchGradingOverviews,
  unsubmitSubmission
} from '../../../actions/session';
import Grading, { IDispatchProps, IStateProps } from '../../../components/academy/grading';
import { IState } from '../../../reducers/states';

const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  gradingOverviews: state.session.gradingOverviews,
  group: state.session.group,
  notifications: state.session.notifications,
  role: state.session.role
});

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleAcknowledgeNotifications: acknowledgeNotifications,
      handleFetchGradingOverviews: fetchGradingOverviews,
      handleUnsubmitSubmission: unsubmitSubmission
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Grading);
