import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';

import { bindActionCreators, Dispatch } from 'redux';
import { acknowledgeNotifications } from 'src/commons/actions/SessionActions';
// TODO: Import from commons
import { IState } from 'src/reducers/states';
import NotificationBadge, {
  INotificationBadgeDispatchProps,
  INotificationBadgeStateProps
} from './NotificationBadgeComponent';

const mapStateToProps: MapStateToProps<INotificationBadgeStateProps, {}, IState> = state => ({
  notifications: state.session.notifications
});

const mapDispatchToProps: MapDispatchToProps<INotificationBadgeDispatchProps, {}> = (dispatch: Dispatch) =>
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
