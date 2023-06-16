import { IconNames } from '@blueprintjs/icons';
import React, { useEffect, useState } from 'react';
import { Role } from 'src/commons/application/ApplicationTypes';
import {
  AssessmentConfiguration,
  AssessmentOverview
} from 'src/commons/assessment/AssessmentTypes';

import AchievementFilter from '../../../commons/achievement/AchievementFilter';
import AchievementManualEditor from '../../../commons/achievement/AchievementManualEditor';
import AchievementOverview from '../../../commons/achievement/AchievementOverview';
import AchievementTask from '../../../commons/achievement/AchievementTask';
import AchievementView from '../../../commons/achievement/AchievementView';
import AchievementInferencer from '../../../commons/achievement/utils/AchievementInferencer';
import insertFakeAchievements from '../../../commons/achievement/utils/InsertFakeAchievements';
import { AchievementContext } from '../../../features/achievement/AchievementConstants';
import {
  AchievementUser,
  FilterStatus,
  GoalProgress
} from '../../../features/achievement/AchievementTypes';

export type DispatchProps = {
  fetchAssessmentOverviews: () => void;
  getAchievements: () => void;
  getGoals: (studentCourseRegId: number) => void;
  getOwnGoals: () => void;
  getUserAssessmentOverviews: (studentCourseRegId: number) => void;
  getUsers: () => void;
  updateGoalProgress: (studentCourseRegId: number, progress: GoalProgress) => void;
};

export type StateProps = {
  group: string | null;
  inferencer: AchievementInferencer;
  id?: number;
  name?: string;
  role?: Role;
  assessmentConfigs?: AssessmentConfiguration[];
  assessmentOverviews?: AssessmentOverview[];
  achievementAssessmentOverviews: AssessmentOverview[];
  users: AchievementUser[];
};

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

type DashboardProps = DispatchProps & StateProps;

const Dashboard: React.FC<DashboardProps> = props => {
  const {
    getAchievements,
    getOwnGoals,
    getGoals,
    getUserAssessmentOverviews,
    getUsers,
    updateGoalProgress,
    fetchAssessmentOverviews,
    group,
    inferencer,
    name,
    role,
    assessmentConfigs,
    assessmentOverviews,
    achievementAssessmentOverviews,
    users
  } = props;

  // default nothing selected
  const userIdState = useState<AchievementUser | undefined>(undefined);
  const [selectedUser] = userIdState;

  /**
   * Fetch the latest achievements and goals from backend when the page is rendered
   */
  useEffect(() => {
    selectedUser ? getGoals(selectedUser.courseRegId) : getOwnGoals();

    selectedUser
      ? getUserAssessmentOverviews(selectedUser.courseRegId)
      : fetchAssessmentOverviews();

    getAchievements();
  }, [
    selectedUser,
    getAchievements,
    getGoals,
    getOwnGoals,
    getUserAssessmentOverviews,
    fetchAssessmentOverviews
  ]);

  const userAssessmentOverviews = selectedUser
    ? achievementAssessmentOverviews
    : assessmentOverviews;

  // Inserts assessment achievements for each assessment retrieved
  // Note that assessmentConfigs is updated when the page loads (see Application.tsx)
  userAssessmentOverviews &&
    assessmentConfigs &&
    insertFakeAchievements(userAssessmentOverviews, assessmentConfigs, inferencer);

  const filterState = useState<FilterStatus>(FilterStatus.ALL);
  const [filterStatus] = filterState;

  /**
   * Marks the achievement uuid that is currently on focus (selected)
   * If an achievement is focused, the cards glow and dashboard displays the AchievementView
   */
  const focusState = useState<string>('');
  const [focusUuid, setFocusUuid] = focusState;

  const hiddenState = useState<boolean>(false);
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
            getUsers={getUsers}
            updateGoalProgress={updateGoalProgress}
          />
        )}

        <div className="achievement-main">
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

export default Dashboard;
