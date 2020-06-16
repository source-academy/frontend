import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../../../commons/application/ApplicationTypes';
import { fetchGroupGradingSummary } from '../../../features/dashboard/DashboardActions';
import Dashboard, { DispatchProps, StateProps } from './Dashboard';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  gradingSummary: state.dashboard.gradingSummary
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleFetchGradingSummary: fetchGroupGradingSummary
    },
    dispatch
  );

const DashboardContainer = connect(mapStateToProps, mapDispatchToProps)(Dashboard);

export default DashboardContainer;
