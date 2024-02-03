import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../../../commons/application/ApplicationTypes';
import AchievementDashboard, { StateProps } from './AchievementDashboard';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({});

const mapDispatchToProps: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) =>
  bindActionCreators({}, dispatch);

const DashboardContainer = connect(mapStateToProps, mapDispatchToProps)(AchievementDashboard);

export default DashboardContainer;
