import { connect, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { OverallState } from 'src/commons/application/ApplicationTypes';

import MissionControl, { StateProps } from './MissionControl';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  assessmentTypes: state.session.assessmentConfigurations?.map(e => e.type) || []
});

const MissionControlContainer = withRouter(connect(mapStateToProps)(MissionControl));

export default MissionControlContainer;
