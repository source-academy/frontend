import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

// TODO: Import from commons
import { fetchGradingOverviews } from 'src/commons/actions/SessionActions';
import { fetchGroupOverviews } from 'src/features/dashboard/DashboardActions';
import { IState } from 'src/reducers/states';
import Dashboard, { IDashboardDispatchProps, IDashboardStateProps } from './DashboardComponent';

const mapStateToProps: MapStateToProps<IDashboardStateProps, {}, IState> = state => ({
  gradingOverviews: state.session.gradingOverviews ? state.session.gradingOverviews : [],
  groupOverviews: state.dashboard.groupOverviews
});

const mapDispatchToProps: MapDispatchToProps<IDashboardDispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleFetchGradingOverviews: fetchGradingOverviews,
      handleFetchGroupOverviews: fetchGroupOverviews
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);
