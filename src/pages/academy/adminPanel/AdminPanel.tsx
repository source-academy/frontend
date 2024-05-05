import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';

import { Button, Divider, H1, Intent, Tab, Tabs } from '@blueprintjs/core';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSession } from 'src/commons/utils/Hooks';
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
  updateAssessmentConfigs,
  updateCourseConfig,
  updateUserRole
} from '../../../commons/application/actions/SessionActions';
import { UpdateCourseConfiguration } from '../../../commons/application/types/SessionTypes';
import ContentDisplay from '../../../commons/ContentDisplay';
import AddStoriesUserPanel from './subcomponents/AddStoriesUserPanel';
import AddUserPanel from './subcomponents/AddUserPanel';
import AssessmentConfigPanel, {
  ImperativeAssessmentConfigPanel
} from './subcomponents/assessmentConfigPanel/AssessmentConfigPanel';
import CourseConfigPanel from './subcomponents/CourseConfigPanel';
import NotificationConfigPanel from './subcomponents/NotificationConfigPanel';
import UserConfigPanel from './subcomponents/userConfigPanel/UserConfigPanel';

const defaultCourseConfig: UpdateCourseConfiguration = {
  courseName: '',
  courseShortName: '',
  viewable: true,
  enableGame: true,
  enableAchievements: true,
  enableSourcecast: true,
  enableStories: false,
  moduleHelpText: ''
};

const AdminPanel: React.FC = () => {
  const [hasChangesCourseConfig, setHasChangesCourseConfig] = useState(false);
  const [hasChangesAssessmentConfig, setHasChangesAssessmentConfig] = useState(false);
  const [courseConfiguration, setCourseConfiguration] = useState(defaultCourseConfig);

  const dispatch = useDispatch();
  const session = useSession();

  useEffect(() => {
    dispatch(fetchCourseConfig());
    dispatch(fetchAssessmentConfigs());
    dispatch(fetchAdminPanelCourseRegistrations());
    dispatch(fetchNotificationConfigs());
  }, [dispatch]);

  useEffect(() => {
    setCourseConfiguration({
      courseName: session.courseName,
      courseShortName: session.courseShortName,
      viewable: session.viewable,
      enableGame: session.enableGame,
      enableAchievements: session.enableAchievements,
      enableSourcecast: session.enableSourcecast,
      enableStories: session.enableStories,
      moduleHelpText: session.moduleHelpText
    });
  }, [
    session.assessmentConfigurations,
    session.courseName,
    session.courseShortName,
    session.enableAchievements,
    session.enableGame,
    session.enableSourcecast,
    session.enableStories,
    session.moduleHelpText,
    session.viewable
  ]);

  const tableRef = useRef<ImperativeAssessmentConfigPanel>(null);
  useEffect(() => {
    tableRef.current?.resetData();
  }, [session.assessmentConfigurations]);

  const courseConfigPanelProps = {
    courseConfiguration: courseConfiguration,
    setCourseConfiguration: (courseConfig: UpdateCourseConfiguration) => {
      setCourseConfiguration(courseConfig);
      setHasChangesCourseConfig(true);
    }
  };

  // Handler to submit changes to Course Configration and Assessment Configuration to the backend.
  // Changes made to users are handled separately.
  const submitHandler = useCallback(() => {
    if (hasChangesCourseConfig) {
      dispatch(updateCourseConfig(courseConfiguration));
      setHasChangesCourseConfig(false);
    }
    const tableState = tableRef.current?.getData() ?? [];
    const currentConfigs = session.assessmentConfigurations ?? [];
    const currentIds = new Set(tableState.map(config => config.assessmentConfigId));
    const configsToDelete = currentConfigs.filter(
      config => !currentIds.has(config.assessmentConfigId)
    );
    configsToDelete.forEach(config => dispatch(deleteAssessmentConfig(config)));
    if (hasChangesAssessmentConfig) {
      dispatch(updateAssessmentConfigs(tableState));
      setHasChangesAssessmentConfig(false);
    }
  }, [
    courseConfiguration,
    dispatch,
    hasChangesAssessmentConfig,
    hasChangesCourseConfig,
    session.assessmentConfigurations
  ]);

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
              <AssessmentConfigPanel
                ref={tableRef}
                initialConfigs={session.assessmentConfigurations ?? []}
                setHasChangesAssessmentConfig={setHasChangesAssessmentConfig}
              />
              <Button
                text="Save"
                disabled={!hasChangesCourseConfig && !hasChangesAssessmentConfig}
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
        <Tab
          id="users"
          title="Users"
          panel={
            <UserConfigPanel
              courseRegId={session.courseRegId}
              userCourseRegistrations={session.userCourseRegistrations}
              handleUpdateUserRole={(courseRegId, role) =>
                dispatch(updateUserRole(courseRegId, role))
              }
              handleDeleteUserFromCourse={(courseRegId: number) =>
                dispatch(deleteUserCourseRegistration(courseRegId))
              }
            />
          }
        />
        <Tab
          id="add-users"
          title="Add Users"
          panel={
            <AddUserPanel
              handleAddNewUsersToCourse={(users, provider) =>
                dispatch(addNewUsersToCourse(users, provider))
              }
            />
          }
        />
        <Tab
          id="add-stories-users"
          title="Add Stories Users"
          panel={
            <AddStoriesUserPanel
              handleAddNewUsersToCourse={(users, provider) =>
                dispatch(addNewStoriesUsersToCourse(users, provider))
              }
            />
          }
        />
        <Tab id="notification-config" title="Notifications" panel={<NotificationConfigPanel />} />
      </Tabs>
    </div>
  );

  return <ContentDisplay display={data} fullWidth={false} />;
};

export default AdminPanel;
