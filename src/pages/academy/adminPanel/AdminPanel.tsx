import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';

import { Button, Divider, H1, Intent, Tab, Tabs } from '@blueprintjs/core';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { StoriesRole } from 'src/commons/application/ApplicationTypes';
import { useSession, useTypedSelector } from 'src/commons/utils/Hooks';
import AcademyActions from 'src/features/academy/AcademyActions';
import StoriesActions from 'src/features/stories/StoriesActions';

import SessionActions from '../../../commons/application/actions/SessionActions';
import { UpdateCourseConfiguration } from '../../../commons/application/types/SessionTypes';
import ContentDisplay from '../../../commons/ContentDisplay';
import AddStoriesUserPanel from './subcomponents/AddStoriesUserPanel';
import AddUserPanel from './subcomponents/AddUserPanel';
import AssessmentConfigPanel, {
  ImperativeAssessmentConfigPanel
} from './subcomponents/assessmentConfigPanel/AssessmentConfigPanel';
import CourseConfigPanel from './subcomponents/CourseConfigPanel';
import StoriesUserConfigPanel from './subcomponents/storiesUserConfigPanel/StoriesUserConfigPanel';
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
  const stories = useTypedSelector(state => state.stories);

  useEffect(() => {
    dispatch(SessionActions.fetchCourseConfig());
    dispatch(SessionActions.fetchAssessmentConfigs());
    dispatch(SessionActions.fetchAdminPanelCourseRegistrations());
  }, [dispatch]);

  useEffect(() => {
    if (session.enableStories) {
      dispatch(StoriesActions.fetchAdminPanelStoriesUsers());
    }
  }, [dispatch, session.enableStories]);

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

  const storiesUserConfigPanelProps = {
    userId: stories.userId,
    storiesUsers: stories.storiesUsers,
    handleUpdateStoriesUserRole: (id: number, role: StoriesRole) =>
      dispatch(SessionActions.updateStoriesUserRole(id, role)),
    handleDeleteStoriesUserFromUserGroup: (id: number) =>
      dispatch(SessionActions.deleteStoriesUserUserGroups(id))
  };

  // Handler to submit changes to Course Configration and Assessment Configuration to the backend.
  // Changes made to users are handled separately.
  const submitHandler = useCallback(() => {
    if (hasChangesCourseConfig) {
      dispatch(SessionActions.updateCourseConfig(courseConfiguration));
      setHasChangesCourseConfig(false);
    }
    const tableState = tableRef.current?.getData() ?? [];
    const currentConfigs = session.assessmentConfigurations ?? [];
    const currentIds = new Set(tableState.map(config => config.assessmentConfigId));
    const configsToDelete = currentConfigs.filter(
      config => !currentIds.has(config.assessmentConfigId)
    );
    configsToDelete.forEach(config => dispatch(SessionActions.deleteAssessmentConfig(config)));
    if (hasChangesAssessmentConfig) {
      dispatch(SessionActions.updateAssessmentConfigs(tableState));
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
                dispatch(SessionActions.updateUserRole(courseRegId, role))
              }
              handleDeleteUserFromCourse={(courseRegId: number) =>
                dispatch(SessionActions.deleteUserCourseRegistration(courseRegId))
              }
            />
          }
        />
        <Tab
          id="stories-users"
          title="Stories Users"
          panel={<StoriesUserConfigPanel {...storiesUserConfigPanelProps} />}
        />
        <Tab
          id="add-users"
          title="Add Users"
          panel={
            <AddUserPanel
              handleAddNewUsersToCourse={(users, provider) =>
                dispatch(AcademyActions.addNewUsersToCourse(users, provider))
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
                dispatch(AcademyActions.addNewStoriesUsersToCourse(users, provider))
              }
            />
          }
        />
      </Tabs>
    </div>
  );

  return <ContentDisplay display={data} fullWidth={false} />;
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = AdminPanel;
Component.displayName = 'AdminPanel';

export default AdminPanel;
