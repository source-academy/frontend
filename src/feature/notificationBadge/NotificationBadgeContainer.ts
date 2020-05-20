import { connect, Dispatch, MapDispatchToProps, MapStateToProps } from 'react-redux';

import { bindActionCreators } from 'redux';
import { acknowledgeNotifications } from '../../actions';
import NotificationBadge, {
  INotificationBadgeDispatchProps,
  INotificationBadgeStateProps
} from './NotificationBadgeComponent';
import { INotificationBadgeState } from './NotificationBadgeReducer';

const mapStateToProps: MapStateToProps<INotificationBadgeStateProps, {}, INotificationBadgeState> = state => ({
  notifications: state.session.notifications
});

const mapDispatchToProps: MapDispatchToProps<INotificationBadgeDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleAcknowledgeNotifications: acknowledgeNotifications
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NotificationBadge);
