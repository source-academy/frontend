import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';

import { bindActionCreators, Dispatch } from 'redux';
import { acknowledgeNotifications } from 'src/commons/application/actions/SessionActions';
// TODO: Import from commons
import { IState } from 'src/reducers/states';
import NotificationBadge, { DispatchProps, StateProps } from './NotificationBadgeComponent';

const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => ({
  notifications: state.session.notifications
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
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
