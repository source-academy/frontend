import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';

import { logOut } from './actions/CommonsActions';
import { loginGitHub, logoutGitHub } from './actions/SessionActions';
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
  title: state.application.title,
  role: state.session.role,
  name: state.session.name,
  enableAchievements: state.session.courseConfiguration?.enableAchievements
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    { handleLogOut: logOut, handleGitHubLogIn: loginGitHub, handleGitHubLogOut: logoutGitHub },
    dispatch
  );

const ApplicationContainer = withRouter(connect(mapStateToProps, mapDispatchToProps)(Application));

export default ApplicationContainer;
