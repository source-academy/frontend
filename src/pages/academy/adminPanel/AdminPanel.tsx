import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';

import { Button, Divider, H1, Intent, Tab, Tabs } from '@blueprintjs/core';
import { cloneDeep } from 'lodash';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Role } from 'src/commons/application/ApplicationTypes';
import { useTypedSelector } from 'src/commons/utils/Hooks';
import {
  addNewStoriesUsersToCourse,
  addNewUsersToCourse
} from 'src/features/academy/AcademyActions';

import {
  deleteAssessmentConfig,
  deleteUserCourseRegistration,
  fetchAdminPanelCourseRegistrations,
  fetchAssessmentConfigs,
  fetchCourseConfig,
  fetchNotificationConfigs,
  setAssessmentConfigurations,
  updateAssessmentConfigs,
  updateCourseConfig,
  updateUserRole
} from '../../../commons/application/actions/SessionActions';
import { UpdateCourseConfiguration } from '../../../commons/application/types/SessionTypes';
import { AssessmentConfiguration } from '../../../commons/assessment/AssessmentTypes';
import ContentDisplay from '../../../commons/ContentDisplay';
import AddStoriesUserPanel, { NameUsernameRole } from './subcomponents/AddStoriesUserPanel';
import AddUserPanel, { UsernameRoleGroup } from './subcomponents/AddUserPanel';
import AssessmentConfigPanel from './subcomponents/assessmentConfigPanel/AssessmentConfigPanel';
import CourseConfigPanel from './subcomponents/CourseConfigPanel';
import NotificationConfigPanel from './subcomponents/NotificationConfigPanel';
import UserConfigPanel from './subcomponents/userConfigPanel/UserConfigPanel';

const AdminPanel: React.FC = () => {
  const [hasChangesCourseConfig, setHasChangesCourseConfig] = React.useState(false);
  const [hasChangesAssessmentConfig, setHasChangesAssessmentConfig] = React.useState(false);

  const [courseConfiguration, setCourseConfiguration] = React.useState<UpdateCourseConfiguration>({
    courseName: '',
    courseShortName: '',
    viewable: true,
    enableGame: true,
    enableAchievements: true,
    enableSourcecast: true,
    moduleHelpText: ''
  });

  const dispatch = useDispatch();

  const session = useTypedSelector(state => state.session);

  /**
   * Mutable ref to track the assessment configuration form state instead of useState. This is
   * because ag-grid does not update the cellRendererParams whenever there is an update in rowData,
   * leading to a stale closure problem where the handlers in AssessmentConfigPanel capture the old
   * value of assessmentConfig.
   *
   * Also, useState causes a flicker in ag-grid during rerenders. Thus we use this mutable ref and
   * ag-grid's API to update cell values instead.
   */
  const assessmentConfig = React.useRef(session.assessmentConfigurations);

  // Tracks the assessment configurations to be deleted in the backend when the save button is clicked
  const [assessmentConfigsToDelete, setAssessmentConfigsToDelete] = React.useState<
    AssessmentConfiguration[]
  >([]);

  React.useEffect(() => {
    dispatch(fetchCourseConfig());
    dispatch(fetchAssessmentConfigs());
    dispatch(fetchAdminPanelCourseRegistrations());
    dispatch(fetchNotificationConfigs());
  }, [dispatch]);

  // After updated configs have been loaded from the backend, put them into local React state
  React.useEffect(() => {
    setCourseConfiguration({
      courseName: session.courseName,
      courseShortName: session.courseShortName,
      viewable: session.viewable,
      enableGame: session.enableGame,
      enableAchievements: session.enableAchievements,
      enableSourcecast: session.enableSourcecast,
      moduleHelpText: session.moduleHelpText
    });

    // IMPT: To prevent mutation of props
    assessmentConfig.current = cloneDeep(session.assessmentConfigurations);
  }, [session]);

  const courseConfigPanelProps = {
    courseConfiguration: courseConfiguration,
    setCourseConfiguration: (courseConfig: UpdateCourseConfiguration) => {
      setCourseConfiguration(courseConfig);
      setHasChangesCourseConfig(true);
    }
  };

  const assessmentConfigPanelProps = React.useMemo(() => {
    return {
      // Would have been loaded by the useEffect above
      assessmentConfig: assessmentConfig as React.MutableRefObject<AssessmentConfiguration[]>,
      setAssessmentConfig: (val: AssessmentConfiguration[]) => {
        assessmentConfig.current = val;
        setHasChangesAssessmentConfig(true);
      },
      setAssessmentConfigsToDelete: (deletedElement: AssessmentConfiguration) => {
        // If it is not a newly created row that is yet to be persisted in the backend
        if (deletedElement.assessmentConfigId !== -1) {
          const temp = [...assessmentConfigsToDelete];
          temp.push(deletedElement);
          setAssessmentConfigsToDelete(temp);
        }
      },
      setHasChangesAssessmentConfig: setHasChangesAssessmentConfig
    };
  }, [assessmentConfigsToDelete]);

  const userConfigPanelProps = {
    courseRegId: session.courseRegId,
    userCourseRegistrations: session.userCourseRegistrations,
    handleUpdateUserRole: (courseRegId: number, role: Role) =>
      dispatch(updateUserRole(courseRegId, role)),
    handleDeleteUserFromCourse: (courseRegId: number) =>
      dispatch(deleteUserCourseRegistration(courseRegId))
  };

  const addUserPanelProps = {
    handleAddNewUsersToCourse: (users: UsernameRoleGroup[], provider: string) =>
      dispatch(addNewUsersToCourse(users, provider))
  };

  const addStoriesUserPanelProps = {
    handleAddNewUsersToCourse: (users: NameUsernameRole[], provider: string) =>
      dispatch(addNewStoriesUsersToCourse(users, provider))
  };

  // Handler to submit changes to Course Configration and Assessment Configuration to the backend.
  // Changes made to users are handled separately.
  const submitHandler = () => {
    if (hasChangesCourseConfig) {
      dispatch(updateCourseConfig(courseConfiguration));
      setHasChangesCourseConfig(false);
    }
    if (assessmentConfigsToDelete.length > 0) {
      assessmentConfigsToDelete.forEach(assessmentConfig => {
        dispatch(deleteAssessmentConfig(assessmentConfig));
      });
      setAssessmentConfigsToDelete([]);
    }
    if (hasChangesAssessmentConfig) {
      // Reset the store first so that old props do not propagate down and cause a flicker
      dispatch(setAssessmentConfigurations([]));

      // assessmentConfig.current will exist after the first load
      dispatch(updateAssessmentConfigs(assessmentConfig.current!));
      setHasChangesAssessmentConfig(false);
    }
  };

  const data = (
    <div className="admin-panel">
      <H1>Admin Panel</H1>
      {/* renderActiveTabPanelOnly to handle large courses with many entries in ag-grid */}
      <Tabs id="admin-panel" renderActiveTabPanelOnly>
        <Tab
          id="configuration"
          title="Configuration"
          panel={
            <>
              <CourseConfigPanel {...courseConfigPanelProps} />
              <Divider />
              <AssessmentConfigPanel {...assessmentConfigPanelProps} />
              <Button
                text="Save"
                style={{ marginTop: '15px' }}
                intent={
                  hasChangesCourseConfig || hasChangesAssessmentConfig
                    ? Intent.WARNING
                    : Intent.NONE
                }
                onClick={submitHandler}
              />
            </>
          }
        />
        <Tab id="users" title="Users" panel={<UserConfigPanel {...userConfigPanelProps} />} />
        <Tab id="add-users" title="Add Users" panel={<AddUserPanel {...addUserPanelProps} />} />
        <Tab
          id="add-stories-users"
          title="Add Stories Users"
          panel={<AddStoriesUserPanel {...addStoriesUserPanelProps} />}
        />
        <Tab id="notification-config" title="Notifications" panel={<NotificationConfigPanel />} />
      </Tabs>
    </div>
  );

  return <ContentDisplay loadContentDispatch={() => {}} display={data} fullWidth={false} />;
};

export default AdminPanel;
