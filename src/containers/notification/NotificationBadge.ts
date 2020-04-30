import { connect, Dispatch, MapDispatchToProps, MapStateToProps } from 'react-redux';

import { bindActionCreators } from 'redux';
import { acknowledgeNotifications } from '../../actions';
import NotificationBadge, {
  DispatchProps,
  StateProps
} from '../../components/notification/NotificationBadge';
import { IState } from '../../reducers/states';

const mapStateToProps: MapStateToProps<StateProps, {}, IState> = state => ({
  notifications: state.session.notifications
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
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
