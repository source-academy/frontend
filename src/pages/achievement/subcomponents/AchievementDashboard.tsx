import { IconNames } from '@blueprintjs/icons';
import { useEffect, useReducer, useState } from 'react';
import { Role } from 'src/commons/application/ApplicationTypes';
import { AssessmentOverview } from 'src/commons/assessment/AssessmentTypes';

import AchievementFilter from '../../../commons/achievement/AchievementFilter';
import AchievementManualEditor from '../../../commons/achievement/AchievementManualEditor';
import AchievementOverview from '../../../commons/achievement/AchievementOverview';
import AchievementTask from '../../../commons/achievement/AchievementTask';
import AchievementView from '../../../commons/achievement/AchievementView';
import AchievementInferencer from '../../../commons/achievement/utils/AchievementInferencer';
import insertFakeAchievements from '../../../commons/achievement/utils/InsertFakeAchievements';
import Constants from '../../../commons/utils/Constants';
import { showSuccessMessage } from '../../../commons/utils/NotificationsHelper';
import { AchievementContext } from '../../../features/achievement/AchievementConstants';
import {
  AchievementUser,
  FilterStatus,
  GoalProgress,
  GoalType
} from '../../../features/achievement/AchievementTypes';

export type DispatchProps = {
  fetchAssessmentOverviews: () => void;
  getAchievements: () => void;
  getOwnGoals: () => void;
  getUsers: () => void;
  updateGoalProgress: (studentId: number, progress: GoalProgress) => void;
};

export type StateProps = {
  group: string | null;
  inferencer: AchievementInferencer;
  id?: number;
  name?: string;
  role?: Role;
  assessmentOverviews?: AssessmentOverview[];
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

function Dashboard(props: DispatchProps & StateProps) {
  const {
    getAchievements,
    getOwnGoals,
    getUsers,
    updateGoalProgress,
    fetchAssessmentOverviews,
    id,
    group,
    inferencer,
    name,
    role,
    assessmentOverviews,
    users
  } = props;

  /**
   * Fetch the latest achievements and goals from backend when the page is rendered
   */
  useEffect(() => {
    if (Constants.useAchievementBackend) {
      getOwnGoals();
      getAchievements();
    }
  }, [getAchievements, getOwnGoals]);

  const [, forceUpdate] = useReducer(x => x + 1, 0);

  if (name && role && !assessmentOverviews) {
    // If assessment overviews are not loaded, fetch them
    fetchAssessmentOverviews();
  }

  // one goal for submit, one goal for graded
  assessmentOverviews?.forEach(assessmentOverview =>
    insertFakeAchievements(assessmentOverview, inferencer)
  );

  const filterState = useState<FilterStatus>(FilterStatus.ALL);
  const [filterStatus] = filterState;

  /**
   * Marks the achievement uuid that is currently on focus (selected)
   * If an achievement is focused, the cards glow and dashboard displays the AchievementView
   */
  const focusState = useState<string>('');
  const [focusUuid] = focusState;

  const completedCount = inferencer.getAllCompletedAchievements().length;
  const xp = inferencer.getTotalXp();
  const goals = inferencer.getAllGoals();

  // Computes goal progress for achievement and xp goals
  let changed = false;
  goals.forEach(goal => {
    if (!id) {
      return;
    }
    let update = false;
    if (goal.meta.type === GoalType.ACHIEVEMENTS) {
      update = goal.count !== completedCount;
      goal.count = completedCount;
    }
    if (goal.meta.type === GoalType.XP) {
      update = goal.count !== xp;
      goal.count = xp;
    }
    if (!goal.completed && goal.count >= goal.targetCount) {
      goal.completed = true;
      const parentAchievements = inferencer.getAchievementsByGoal(goal.uuid);
      parentAchievements.forEach(uuid => {
        const achievement = inferencer.getAchievement(uuid);
        console.log(achievement);
        if (inferencer.isInvalidAchievement(achievement)) {
          return;
        }
        if (inferencer.isCompleted(achievement)) {
          showSuccessMessage('Completed acheivement: ' + achievement.title);
        }
      });
    }
    changed = changed || update;
    if (update) {
      const progress: GoalProgress = {
        uuid: goal.uuid,
        count: goal.count,
        targetCount: goal.targetCount,
        completed: goal.completed
      };
      updateGoalProgress(id, progress);
    }
  });
  if (changed) {
    setTimeout(forceUpdate, 1000);
  }

  return (
    <AchievementContext.Provider value={inferencer}>
      <div className="AchievementDashboard">
        <AchievementOverview name={name || 'User'} studio={group || 'Staff'} />
        {(role && role !== Role.Student) && (
          <AchievementManualEditor
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
              inferencer.listSortedReleasedTaskUuids(),
              filterStatus,
              focusState
            )}
          </ul>

          <div className="view-container">
            <AchievementView focusUuid={focusUuid} />
          </div>
        </div>
      </div>
    </AchievementContext.Provider>
  );
}

export default Dashboard;
