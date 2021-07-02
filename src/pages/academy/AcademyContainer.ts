import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators } from 'redux';

import { fetchNotifications } from '../../commons/application/actions/SessionActions';
import { OverallState } from '../../commons/application/ApplicationTypes';
import Academy, { DispatchProps, StateProps } from './Academy';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  historyHelper: state.session.historyHelper,
  enableGame: state.session.enableGame,
  assessmentConfigurations: state.session.assessmentConfigurations
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = dispatch =>
  bindActionCreators(
    {
      handleFetchNotifications: fetchNotifications
    },
    dispatch
  );

const AcademyContainer = withRouter(connect(mapStateToProps, mapDispatchToProps)(Academy));

export default AcademyContainer;
