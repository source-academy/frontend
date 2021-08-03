import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';
import { OverallState } from 'src/commons/application/ApplicationTypes';

import { fetchAssessmentOverviews } from '../../commons/application/actions/SessionActions';
import MissionControl, { DispatchProps, StateProps } from './MissionControl';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  assessmentTypes: state.session.assessmentConfigurations?.map(e => e.type) || []
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators({ handleAssessmentOverviewFetch: fetchAssessmentOverviews }, dispatch);

const MissionControlContainer = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(MissionControl)
);

export default MissionControlContainer;
