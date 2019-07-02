import { connect, Dispatch, MapDispatchToProps } from 'react-redux';

import { bindActionCreators } from 'redux';
import { acknowledgeNotification } from '../../actions';
import NotificationBadge, { DispatchProps } from '../../components/notification/NotificationBadge';

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleAcknowledgeNotification: acknowledgeNotification
    },
    dispatch
  );

export default connect(
  null,
  mapDispatchToProps
)(NotificationBadge);
