import { IconNames } from '@blueprintjs/icons';
import { useEffect, useState } from 'react';
import { Role } from 'src/commons/application/ApplicationTypes';
import { AssessmentOverview } from 'src/commons/assessment/AssessmentTypes';

import AchievementFilter from '../../../commons/achievement/AchievementFilter';
import AchievementManualEditor from '../../../commons/achievement/AchievementManualEditor';
import AchievementOverview from '../../../commons/achievement/AchievementOverview';
import AchievementTask from '../../../commons/achievement/AchievementTask';
import AchievementView from '../../../commons/achievement/AchievementView';
import AchievementInferencer from '../../../commons/achievement/utils/AchievementInferencer';
import Constants from '../../../commons/utils/Constants';
import { AchievementContext, cardBackgroundUrl, coverImageUrl } from '../../../features/achievement/AchievementConstants';
import { AchievementAbility, AchievementUser, FilterStatus, GoalProgress, GoalType } from '../../../features/achievement/AchievementTypes';

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
  const { getAchievements, getOwnGoals, getUsers, updateGoalProgress, fetchAssessmentOverviews,
      group, inferencer, name, role, assessmentOverviews, users } = props;

  /**
   * Fetch the latest achievements and goals from backend when the page is rendered
   */
  useEffect(() => {
    if (Constants.useAchievementBackend) {
      getOwnGoals();
      getAchievements();
    }
  }, [getAchievements, getOwnGoals]);

  if (name && role && !assessmentOverviews) {
    // If assessment overviews are not loaded, fetch them
    fetchAssessmentOverviews();
  }

  // one goal for submit, one goal for graded
  assessmentOverviews?.forEach(assessmentOverview => {
    const idString = assessmentOverview.id.toString();
    if (!inferencer.hasAchievement(idString)) {
      // Goal for assessment submission
      inferencer.insertFakeGoalDefinition(
        { uuid: idString + '0',
          text: `Submitted ${assessmentOverview.category.toLowerCase()}`,
          achievementUuids: [idString],
          meta: { 
            type: GoalType.ASSESSMENT, 
            assessmentNumber: assessmentOverview.id, 
            requiredCompletionFrac: 0
          }
        }, assessmentOverview.status === 'submitted'
      )
      // Goal for assessment grading
      inferencer.insertFakeGoalDefinition(
        { uuid: idString + '1',
          text: `Graded ${assessmentOverview.category.toLowerCase()}`,
          achievementUuids: [idString],
          meta: { 
            type: GoalType.ASSESSMENT, 
            assessmentNumber: assessmentOverview.id, 
            requiredCompletionFrac: 0
          }
        }, assessmentOverview.gradingStatus === 'graded'
      )
      // Would like a goal for early submission, but that seems to be hard to get from the overview
      inferencer.insertFakeAchievement(
        { uuid: idString,
          title: assessmentOverview.title,
          ability: assessmentOverview.category === 'Mission' || assessmentOverview.category === 'Path'
            ? AchievementAbility.CORE
            : AchievementAbility.EFFORT,
          xp: assessmentOverview.gradingStatus === 'graded' ? assessmentOverview.xp : assessmentOverview.maxXp, 
          deadline: new Date(assessmentOverview.closeAt),
          release: new Date(assessmentOverview.openAt),
          isTask: assessmentOverview.isPublished === undefined ? true : assessmentOverview.isPublished,
          position: -1, // always appears on top
          prerequisiteUuids: [], 
          goalUuids: [idString + '0', idString + '1'], // need to create a mock completed goal to reference to be considered complete
          cardBackground: `${cardBackgroundUrl}/default.png`,
          view: {
            coverImage: `${coverImageUrl}/default.png`,
            description: assessmentOverview.shortSummary,
            completionText: `Grade: ${assessmentOverview.grade} / ${assessmentOverview.maxGrade}`
          }
        }
      )
    }
  });

  const filterState = useState<FilterStatus>(FilterStatus.ALL);
  const [filterStatus] = filterState;

  /**
   * Marks the achievement uuid that is currently on focus (selected)
   * If an achievement is focused, the cards glow and dashboard displays the AchievementView
   */
  const focusState = useState<string>('');
  const [focusUuid] = focusState;

  return (
    <AchievementContext.Provider value={inferencer}>
      <div className="AchievementDashboard">
        <AchievementOverview name={name || 'User'} studio={group || 'Staff'} />
        {role !== Role.Student && (
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
            {generateAchievementTasks(inferencer.listSortedReleasedTaskUuids(), filterStatus, focusState)}
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
