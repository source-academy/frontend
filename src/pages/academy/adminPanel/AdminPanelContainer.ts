import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../../../commons/application/ApplicationTypes';
import AdminPanel, { StateProps } from './AdminPanel';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  courseRegId: state.session.courseRegId,
  courseName: state.session.courseName,
  courseShortName: state.session.courseShortName,
  viewable: state.session.viewable,
  enableGame: state.session.enableGame,
  enableAchievements: state.session.enableAchievements,
  enableSourcecast: state.session.enableSourcecast,
  moduleHelpText: state.session.moduleHelpText,
  assessmentConfigurations: state.session.assessmentConfigurations,
  userCourseRegistrations: state.session.userCourseRegistrations
});

const mapDispatchToProps: MapDispatchToProps<{}, {}> = (dispatch: Dispatch) =>
  bindActionCreators({}, dispatch);

const AdminPanelContainer = connect(mapStateToProps, mapDispatchToProps)(AdminPanel);

export default AdminPanelContainer;
