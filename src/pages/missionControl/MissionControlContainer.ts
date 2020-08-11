import { connect, MapDispatchToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';

import { fetchAssessmentOverviews } from '../../commons/application/actions/SessionActions';
import MissionControl, { DispatchProps } from './MissionControl';

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators({ handleAssessmentOverviewFetch: fetchAssessmentOverviews }, dispatch);

const MissionControlContainer = withRouter(connect(null, mapDispatchToProps)(MissionControl));

export default MissionControlContainer;
