import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../../../commons/application/ApplicationTypes';
import AdminPanel from './AdminPanel';

const mapStateToProps: MapStateToProps<{}, {}, OverallState> = state => ({});

const mapDispatchToProps: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) =>
  bindActionCreators({}, dispatch);

const AdminPanelContainer = connect(mapStateToProps, mapDispatchToProps)(AdminPanel);

export default AdminPanelContainer;
