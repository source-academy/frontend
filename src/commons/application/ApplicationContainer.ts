import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';
import { createCourse } from 'src/features/academy/AcademyActions';

import { logOut } from './actions/CommonsActions';
import {
  fetchUserAndCourse,
  loginGitHub,
  logoutGitHub,
  updateCourseResearchAgreement
} from './actions/SessionActions';
import Application, { DispatchProps, StateProps } from './Application';
import { OverallState } from './ApplicationTypes';

/**
 * Provides the title of the application for display.
 * An object with the relevant properties must be
 * returned instead of an object of type @type {IApplicationProps},
 * as the routing properties of @type {RouteComponentProps} are
 * provided using the withRouter() method below.
 */
const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  role: state.session.role,
  name: state.session.name,
  courses: state.session.courses,
  courseId: state.session.courseId,
  courseShortName: state.session.courseShortName,
  enableAchievements: state.session.enableAchievements,
  enableSourcecast: state.session.enableSourcecast,
  assessmentConfigurations: state.session.assessmentConfigurations,
  agreedToResearch: state.session.agreedToResearch
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleLogOut: logOut,
      handleGitHubLogIn: loginGitHub,
      handleGitHubLogOut: logoutGitHub,
      fetchUserAndCourse: fetchUserAndCourse,
      handleCreateCourse: createCourse,
      updateCourseResearchAgreement: updateCourseResearchAgreement
    },
    dispatch
  );

const ApplicationContainer = withRouter(connect(mapStateToProps, mapDispatchToProps)(Application));

export default ApplicationContainer;
