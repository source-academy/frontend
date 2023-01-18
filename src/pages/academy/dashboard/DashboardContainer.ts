import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../../../commons/application/ApplicationTypes';
import Dashboard from './Dashboard';

const mapStateToProps: MapStateToProps<{}, {}, OverallState> = state => ({});

const mapDispatchToProps: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) =>
  bindActionCreators({}, dispatch);

const DashboardContainer = connect(mapStateToProps, mapDispatchToProps)(Dashboard);

export default DashboardContainer;
