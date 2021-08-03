import {
  cardBackgroundUrl,
  coverImageUrl
} from '../../../features/achievement/AchievementConstants';
import { AchievementAbility, GoalType } from '../../../features/achievement/AchievementTypes';
import { AssessmentOverview } from '../../assessment/AssessmentTypes';
import AchievementInferencer from './AchievementInferencer';
import { isExpired, isReleased } from './DateHelper';

function insertFakeAchievements(
  assessmentOverview: AssessmentOverview,
  inferencer: AchievementInferencer
) {
  // Reduce clutter for achievements that cannot be earned at that point
  if (
    !isReleased(new Date(assessmentOverview.openAt)) ||
    (isExpired(new Date(assessmentOverview.closeAt)) && assessmentOverview.status !== 'submitted')
  ) {
    return;
  }
  const idString = assessmentOverview.id.toString();
  if (!inferencer.hasAchievement(idString)) {
    // Goal for assessment submission
    inferencer.insertFakeGoalDefinition(
      {
        uuid: idString + '0',
        text: `Submitted ${assessmentOverview.type}`,
        achievementUuids: [idString],
        meta: {
          type: GoalType.ASSESSMENT,
          assessmentNumber: assessmentOverview.id,
          requiredCompletionFrac: 0
        }
      },
      assessmentOverview.status === 'submitted'
    );
    // Goal for assessment grading
    inferencer.insertFakeGoalDefinition(
      {
        uuid: idString + '1',
        text: `Graded ${assessmentOverview.type}`,
        achievementUuids: [idString],
        meta: {
          type: GoalType.ASSESSMENT,
          assessmentNumber: assessmentOverview.id,
          requiredCompletionFrac: 0
        }
      },
      assessmentOverview.gradingStatus === 'graded'
    );
    // Would like a goal for early submission, but that seems to be hard to get from the overview
    inferencer.insertFakeAchievement({
      uuid: idString,
      title: assessmentOverview.title,
      ability:
        assessmentOverview.type === 'Missions' || assessmentOverview.type === 'Paths'
          ? AchievementAbility.CORE
          : AchievementAbility.EFFORT,
      xp:
        assessmentOverview.gradingStatus === 'graded'
          ? assessmentOverview.xp
          : assessmentOverview.maxXp,
      isVariableXp: false,
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
        completionText: `XP: ${assessmentOverview.xp} / ${assessmentOverview.maxXp}`
      }
    });
  }
}

export default insertFakeAchievements;
