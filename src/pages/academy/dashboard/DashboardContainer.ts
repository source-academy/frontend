import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { fetchGradingOverviews } from '../../../commons/application/actions/SessionActions';
import { OverallState } from '../../../commons/application/ApplicationTypes';
import { fetchGroupOverviews } from '../../../features/dashboard/DashboardActions';
import Dashboard, { DispatchProps, StateProps } from './Dashboard';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  gradingOverviews: state.session.gradingOverviews ? state.session.gradingOverviews : [],
  groupOverviews: state.dashboard.groupOverviews
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleFetchGradingOverviews: fetchGradingOverviews,
      handleFetchGroupOverviews: fetchGroupOverviews
    },
    dispatch
  );

const DashboardContainer = connect(mapStateToProps, mapDispatchToProps)(Dashboard);

export default DashboardContainer;
