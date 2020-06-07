import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { acknowledgeNotifications } from '../application/actions/SessionActions';
import { OverallState } from '../application/ApplicationTypes';
import NotificationBadge, { DispatchProps, StateProps } from './NotificationBadge';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  notifications: state.session.notifications
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleAcknowledgeNotifications: acknowledgeNotifications
    },
    dispatch
  );

const NotificationBadgeContainer = connect(mapStateToProps, mapDispatchToProps)(NotificationBadge);

export default NotificationBadgeContainer;
