import { IconNames } from '@blueprintjs/icons';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Role } from 'src/commons/application/ApplicationTypes';
import { useResponsive, useSession, useTypedSelector } from 'src/commons/utils/Hooks';

import AchievementFilter from '../../../commons/achievement/AchievementFilter';
import AchievementManualEditor from '../../../commons/achievement/AchievementManualEditor';
import AchievementOverview from '../../../commons/achievement/AchievementOverview';
import AchievementTask from '../../../commons/achievement/AchievementTask';
import AchievementView from '../../../commons/achievement/AchievementView';
import AchievementInferencer from '../../../commons/achievement/utils/AchievementInferencer';
import insertFakeAchievements from '../../../commons/achievement/utils/InsertFakeAchievements';
import SessionActions from '../../../commons/application/actions/SessionActions';
import AchievementActions from '../../../features/achievement/AchievementActions';
import { AchievementContext } from '../../../features/achievement/AchievementConstants';
import {
  AchievementUser,
  FilterStatus,
  GoalProgress
} from '../../../features/achievement/AchievementTypes';

/**
 * Generates <AchievementTask /> components
 *
 * @param taskUuids an array of achievementUuid
 * @param filterStatus the dashboard filter status
 * @param focusState the focused achievement state
 */
export const generateAchievementTasks = (
  taskUuids: string[],
  filterStatus: FilterStatus,
  focusState: [string, any]
) =>
  taskUuids.map(taskUuid => (
    <AchievementTask
      key={taskUuid}
      uuid={taskUuid}
      filterStatus={filterStatus}
      focusState={focusState}
    />
  ));

const AchievementDashboard: React.FC = () => {
  // default nothing selected
  const userIdState = useState<AchievementUser | undefined>(undefined);
  const [selectedUser] = userIdState;
  const { isMobileBreakpoint } = useResponsive();

  const {
    group,
    name,
    role,
    assessmentOverviews,
    assessmentConfigurations: assessmentConfigs
  } = useSession();

  const { assessmentOverviews: achievementAssessmentOverviews, users } = useTypedSelector(
    state => state.achievement
  );
  const inferencer = useTypedSelector(
    state => new AchievementInferencer(state.achievement.achievements, state.achievement.goals)
  );

  const dispatch = useDispatch();
  const {
    handleFetchAssessmentOverviews,
    handleGetAchievements,
    handleGetGoals,
    handleGetOwnGoals,
    handleGetUserAssessmentOverviews,
    handleGetUsers,
    handleUpdateGoalProgress
  } = useMemo(() => {
    return {
      handleFetchAssessmentOverviews: () => dispatch(SessionActions.fetchAssessmentOverviews()),
      handleGetAchievements: () => dispatch(AchievementActions.getAchievements()),
      handleGetGoals: (studentCourseRegId: number) =>
        dispatch(AchievementActions.getGoals(studentCourseRegId)),
      handleGetOwnGoals: () => dispatch(AchievementActions.getOwnGoals()),
      handleGetUserAssessmentOverviews: (studentCourseRegId: number) =>
        dispatch(AchievementActions.getUserAssessmentOverviews(studentCourseRegId)),
      handleGetUsers: () => dispatch(AchievementActions.getUsers()),
      handleUpdateGoalProgress: (studentCourseRegId: number, progress: GoalProgress) =>
        dispatch(AchievementActions.updateGoalProgress(studentCourseRegId, progress))
    };
  }, [dispatch]);

  /**
   * Fetch the latest achievements and goals from backend when the page is rendered
   */
  useEffect(() => {
    if (selectedUser) {
      handleGetGoals(selectedUser.courseRegId);
    } else {
      handleGetOwnGoals();
    }

    if (selectedUser) {
      handleGetUserAssessmentOverviews(selectedUser.courseRegId);
    } else {
      handleFetchAssessmentOverviews();
    }

    handleGetAchievements();
  }, [
    handleFetchAssessmentOverviews,
    handleGetAchievements,
    handleGetGoals,
    handleGetOwnGoals,
    handleGetUserAssessmentOverviews,
    selectedUser
  ]);

  const userAssessmentOverviews = selectedUser
    ? achievementAssessmentOverviews
    : assessmentOverviews;

  // Inserts assessment achievements for each assessment retrieved
  // Note that assessmentConfigs is updated when the page loads (see Application.tsx)
  if (userAssessmentOverviews && assessmentConfigs) {
    insertFakeAchievements(userAssessmentOverviews, assessmentConfigs, inferencer);
  }

  const filterState = useState<FilterStatus>(FilterStatus.ALL);
  const [filterStatus] = filterState;

  /**
   * Marks the achievement uuid that is currently on focus (selected)
   * If an achievement is focused, the cards glow and dashboard displays the AchievementView
   */
  const focusState = useState('');
  const [focusUuid, setFocusUuid] = focusState;

  const hiddenState = useState(false);
  const [seeHidden] = hiddenState;

  // Resets AchievementView when the selected user changes
  useEffect(() => {
    setFocusUuid('');
  }, [selectedUser, setFocusUuid]);

  return (
    <AchievementContext.Provider value={inferencer}>
      <div className="AchievementDashboard">
        <AchievementOverview
          name={selectedUser ? selectedUser.name || selectedUser.username : name || 'User'}
          userState={userIdState}
        />
        {role && role !== Role.Student && (
          <AchievementManualEditor
            userState={userIdState}
            hiddenState={hiddenState}
            studio={group || 'Staff'}
            users={users}
            getUsers={handleGetUsers}
            updateGoalProgress={handleUpdateGoalProgress}
          />
        )}
        <div className={isMobileBreakpoint ? 'achievement-main-mobile' : 'achievement-main'}>
          <div className="filter-container">
            <AchievementFilter
              filterState={filterState}
              icon={IconNames.GLOBE}
              ownStatus={FilterStatus.ALL}
            />
            <AchievementFilter
              filterState={filterState}
              icon={IconNames.LOCATE}
              ownStatus={FilterStatus.ACTIVE}
            />
            <AchievementFilter
              filterState={filterState}
              icon={IconNames.ENDORSED}
              ownStatus={FilterStatus.COMPLETED}
            />
          </div>

          <ul className="task-container">
            {generateAchievementTasks(
              role === Role.Student || !seeHidden
                ? inferencer.listSortedReleasedTaskUuids()
                : inferencer.listAllSortedAchievementUuids(),
              filterStatus,
              focusState
            )}
          </ul>

          <div className="view-container">
            <AchievementView focusUuid={focusUuid} userState={userIdState} />
          </div>
        </div>
      </div>
    </AchievementContext.Provider>
  );
};

export default AchievementDashboard;
