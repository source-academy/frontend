import { connect, Dispatch, MapDispatchToProps } from 'react-redux';

import { bindActionCreators } from 'redux';
import { acknowledgeNotifications } from '../../actions';
import NotificationBadgeWithPopover, {
  DispatchProps
} from '../../components/notification/NotificationBadgeWithPopover';

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleAcknowledgeNotifications: acknowledgeNotifications
    },
    dispatch
  );

export default connect(
  null,
  mapDispatchToProps
)(NotificationBadgeWithPopover);
