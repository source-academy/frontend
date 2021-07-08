import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { addNewUsersToCourse } from 'src/features/academy/AcademyActions';

import {
  deleteAssessmentConfig,
  deleteUserCourseRegistration,
  fetchAdminPanelCourseRegistrations,
  fetchAssessmentConfigs,
  fetchCourseConfig,
  setAssessmentConfigurations,
  updateAssessmentConfigs,
  updateCourseConfig,
  updateUserRole
} from '../../../commons/application/actions/SessionActions';
import { OverallState } from '../../../commons/application/ApplicationTypes';
import AdminPanel, { DispatchProps, StateProps } from './AdminPanel';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  courseRegId: state.session.courseRegId,
  courseName: state.session.courseName,
  courseShortName: state.session.courseShortName,
  viewable: state.session.viewable,
  enableGame: state.session.enableGame,
  enableAchievements: state.session.enableAchievements,
  enableSourcecast: state.session.enableSourcecast,
  sourceChapter: state.session.sourceChapter,
  sourceVariant: state.session.sourceVariant,
  moduleHelpText: state.session.moduleHelpText,
  assessmentConfigurations: state.session.assessmentConfigurations,
  userCourseRegistrations: state.session.userCourseRegistrations
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleFetchCourseConfiguration: fetchCourseConfig,
      handleFetchAssessmentConfigs: fetchAssessmentConfigs,
      handleFetchUserCourseRegistrations: fetchAdminPanelCourseRegistrations,
      handleUpdateCourseConfig: updateCourseConfig,
      handleUpdateAssessmentConfigs: updateAssessmentConfigs,
      setAssessmentConfigurations: setAssessmentConfigurations,
      handleDeleteAssessmentConfig: deleteAssessmentConfig,
      handleUpdateUserRole: updateUserRole,
      handleDeleteUserFromCourse: deleteUserCourseRegistration,
      handleAddNewUsersToCourse: addNewUsersToCourse
    },
    dispatch
  );

const AdminPanelContainer = connect(mapStateToProps, mapDispatchToProps)(AdminPanel);

export default AdminPanelContainer;
