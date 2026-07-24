import { Button, Divider, H1, Intent, Tab, Tabs } from '@blueprintjs/core';
import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useSession } from 'src/commons/utils/Hooks';
import AcademyActions from 'src/features/academy/AcademyActions';

import SessionActions from '../../../commons/application/actions/SessionActions';
import type { UpdateCourseConfiguration } from '../../../commons/application/types/SessionTypes';
import type { AssessmentConfiguration } from '../../../commons/assessment/AssessmentTypes';
import ContentDisplay from '../../../commons/ContentDisplay';
import AddUserPanel from '../../../features/adminPanel/subcomponents/AddUserPanel';
import AssessmentConfigPanel from '../../../features/adminPanel/subcomponents/assessmentConfigPanel/AssessmentConfigPanel';
import CourseConfigPanel from '../../../features/adminPanel/subcomponents/CourseConfigPanel';
import PixelbotConfigPanel from '../../../features/adminPanel/subcomponents/PixelbotConfigPanel';
import UserConfigPanel from '../../../features/adminPanel/subcomponents/userConfigPanel/UserConfigPanel';

const defaultCourseConfig: UpdateCourseConfiguration = {
  courseName: '',
  courseShortName: '',
  viewable: true,
  enableGame: true,
  enableAchievements: true,
  enableOverallLeaderboard: true,
  enableContestLeaderboard: true,
  topLeaderboardDisplay: 100,
  topContestLeaderboardDisplay: 10,
  enableLlmGrading: false,
  enableLouisChatbot: false,
  moduleHelpText: '',
  llmApiKey: '',
  llmModel: '',
  llmApiUrl: '',
  llmCourseLevelPrompt: '',
  louisChatbotPrompt: '',
  pixelbotRoutingPrompt: '',
  pixelbotAnswerPrompt: '',
  feedbackUrl: '',
};

function AdminPanel() {
  const [hasChangesCourseConfig, setHasChangesCourseConfig] = useState(false);
  const [hasChangesAssessmentConfig, setHasChangesAssessmentConfig] = useState(false);
  const [courseConfiguration, setCourseConfiguration] = useState(defaultCourseConfig);
  // Lifted from AssessmentConfigPanel: we own the configs state, derive
  // `hasChangesAssessmentConfig` inside the panel, and dispatch on save.
  const [assessmentConfigs, setAssessmentConfigs] = useState<AssessmentConfiguration[]>([]);

  const dispatch = useAppDispatch();
  const session = useSession();

  useEffect(() => {
    dispatch(SessionActions.fetchCourseConfig());
    dispatch(SessionActions.fetchAssessmentConfigs());
    dispatch(SessionActions.fetchAdminPanelCourseRegistrations());
  }, [dispatch]);

  useEffect(() => {
    setCourseConfiguration({
      courseName: session.courseName,
      courseShortName: session.courseShortName,
      viewable: session.viewable,
      enableGame: session.enableGame,
      enableAchievements: session.enableAchievements,
      enableOverallLeaderboard: session.enableOverallLeaderboard,
      enableContestLeaderboard: session.enableContestLeaderboard,
      topLeaderboardDisplay: session.topLeaderboardDisplay,
      topContestLeaderboardDisplay: session.topContestLeaderboardDisplay,
      enableLlmGrading: session.enableLlmGrading,
      enableLouisChatbot: session.enableLouisChatbot,
      moduleHelpText: session.moduleHelpText,
      llmModel: session.llmModel,
      llmApiUrl: session.llmApiUrl,
      llmCourseLevelPrompt: session.llmCourseLevelPrompt,
      louisChatbotPrompt: session.louisChatbotPrompt,
      pixelbotRoutingPrompt: session.pixelbotRoutingPrompt,
      pixelbotAnswerPrompt: session.pixelbotAnswerPrompt,
      feedbackUrl: session.feedbackUrl,
    });
  }, [
    session.courseName,
    session.courseShortName,
    session.enableAchievements,
    session.enableOverallLeaderboard,
    session.enableContestLeaderboard,
    session.topLeaderboardDisplay,
    session.topContestLeaderboardDisplay,
    session.enableGame,
    session.enableLlmGrading,
    session.enableLouisChatbot,
    session.moduleHelpText,
    session.louisChatbotPrompt,
    session.viewable,
    session.llmModel,
    session.llmApiUrl,
    session.llmCourseLevelPrompt,
    session.pixelbotRoutingPrompt,
    session.pixelbotAnswerPrompt,
    session.feedbackUrl,
  ]);

  // Re-sync local state whenever the backend's assessment configs change
  // (initial fetch, save round-trip, or another admin edited the same course).
  useEffect(() => {
    setAssessmentConfigs(session.assessmentConfigurations ?? []);
  }, [session.assessmentConfigurations]);

  const courseConfigPanelProps = {
    courseConfiguration: courseConfiguration,
    setCourseConfiguration: (courseConfig: UpdateCourseConfiguration) => {
      setCourseConfiguration(courseConfig);
      setHasChangesCourseConfig(true);
    },
  };

  // Handler to submit changes to Course Configuration and Assessment Configuration to the backend.
  // Changes made to users are handled separately.
  const submitHandler = useCallback(() => {
    if (hasChangesCourseConfig) {
      dispatch(SessionActions.updateCourseConfig(courseConfiguration));
      setHasChangesCourseConfig(false);
    }
    const currentConfigs = session.assessmentConfigurations ?? [];
    const currentIds = new Set(assessmentConfigs.map(config => config.assessmentConfigId));
    const configsToDelete = currentConfigs.filter(
      config => !currentIds.has(config.assessmentConfigId),
    );
    configsToDelete.forEach(config => dispatch(SessionActions.deleteAssessmentConfig(config)));
    if (hasChangesAssessmentConfig) {
      // New rows carry a negative transient id assigned client-side; the
      // backend treats `assessmentConfigId: -1` as "create" (see the course
      // creation flow in BackendSaga) and returns real ids on the next
      // fetchAssessmentConfigs round-trip, which re-syncs `assessmentConfigs`.
      dispatch(SessionActions.updateAssessmentConfigs(assessmentConfigs));
      setHasChangesAssessmentConfig(false);
    }
  }, [
    assessmentConfigs,
    courseConfiguration,
    dispatch,
    hasChangesAssessmentConfig,
    hasChangesCourseConfig,
    session.assessmentConfigurations,
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
                configs={assessmentConfigs}
                onChange={setAssessmentConfigs}
                initialConfigs={session.assessmentConfigurations ?? []}
                onHasChangesChange={setHasChangesAssessmentConfig}
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
          id="pixelbot-settings"
          title="Pixelbot Settings"
          panel={
            <PixelbotConfigPanel
              {...courseConfigPanelProps}
              onSave={(config: UpdateCourseConfiguration) =>
                dispatch(SessionActions.updateCourseConfig(config))
              }
            />
          }
        />
      </Tabs>
    </div>
  );

  return <ContentDisplay display={data} fullWidth={false} />;
}

export const Component = AdminPanel;
