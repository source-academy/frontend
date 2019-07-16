import { connect, Dispatch, MapDispatchToProps } from 'react-redux';

import { bindActionCreators } from 'redux';
import { acknowledgeNotifications } from '../../actions';
import NotificationBadge, { DispatchProps } from '../../components/notification/NotificationBadge';

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
)(NotificationBadge);
