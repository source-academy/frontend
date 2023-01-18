import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../application/ApplicationTypes';
import NotificationBadge from './NotificationBadge';

const mapStateToProps: MapStateToProps<{}, {}, OverallState> = state => ({});

const mapDispatchToProps: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) =>
  bindActionCreators({}, dispatch);

const NotificationBadgeContainer = connect(mapStateToProps, mapDispatchToProps)(NotificationBadge);

export default NotificationBadgeContainer;
