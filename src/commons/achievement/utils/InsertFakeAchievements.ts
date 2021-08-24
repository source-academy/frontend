import moment from 'moment';

import {
  cardBackgroundUrl,
  coverImageUrl
} from '../../../features/achievement/AchievementConstants';
import { GoalType } from '../../../features/achievement/AchievementTypes';
import { AssessmentConfiguration, AssessmentOverview } from '../../assessment/AssessmentTypes';
import AchievementInferencer from './AchievementInferencer';
import { isExpired, isReleased } from './DateHelper';

function assessmentCompleted(assessmentOverview: AssessmentOverview): boolean {
  return (
    assessmentOverview.gradingStatus === 'graded' ||
    (!assessmentOverview.isManuallyGraded && assessmentOverview.status === 'submitted')
  );
}

function insertFakeAchievements(
  assessmentOverviews: AssessmentOverview[],
  assessmentConfigs: AssessmentConfiguration[],
  inferencer: AchievementInferencer
) {
  const sortedOverviews = [...assessmentOverviews].sort((overview1, overview2) =>
    moment(overview1.closeAt).diff(moment(overview2.closeAt))
  );
  const length = assessmentOverviews.length;

  const assessmentTypes = assessmentConfigs.map(config => config.type);

  const categorisedUuids: string[][] = assessmentTypes.map(_ => []);

  sortedOverviews.forEach((assessmentOverview, idx) => {
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
          text: `Submitted ${assessmentOverview.title}`,
          achievementUuids: [idString],
          meta: {
            type: GoalType.ASSESSMENT,
            assessmentNumber: assessmentOverview.id,
            requiredCompletionFrac: 0
          }
        },
        assessmentOverview.status === 'submitted'
      );

      // goal for assessment grading
      if (assessmentOverview.isManuallyGraded) {
        inferencer.insertFakeGoalDefinition(
          {
            uuid: idString + '1',
            text: `Graded ${assessmentOverview.title}`,
            achievementUuids: [idString],
            meta: {
              type: GoalType.ASSESSMENT,
              assessmentNumber: assessmentOverview.id,
              requiredCompletionFrac: 0
            }
          },
          assessmentOverview.gradingStatus === 'graded'
        );
      }

      inferencer.insertFakeAchievement({
        uuid: idString,
        title: assessmentOverview.title,
        xp: assessmentCompleted(assessmentOverview)
          ? assessmentOverview.xp
          : assessmentOverview.maxXp,
        isVariableXp: false,
        deadline: new Date(assessmentOverview.closeAt),
        release: new Date(assessmentOverview.openAt),
        isTask:
          assessmentOverview.isPublished === undefined ? false : assessmentOverview.isPublished,
        position: idx - length - 100, // assessment closest to expiring on top
        prerequisiteUuids: [],
        goalUuids: !assessmentOverview.isManuallyGraded
          ? [idString + '0']
          : [idString + '0', idString + '1'], // need to create a mock completed goal to reference to be considered complete
        cardBackground: `${cardBackgroundUrl}/default.png`,
        view: {
          coverImage: assessmentOverview.coverImage,
          description: assessmentOverview.shortSummary,
          completionText: `XP: ${assessmentOverview.xp} / ${assessmentOverview.maxXp}`
        }
      });

      // if completed, add the uuid into the appropriate array
      if (assessmentCompleted(assessmentOverview)) {
        assessmentTypes.forEach((type, idx) => {
          if (type === assessmentOverview.type) {
            categorisedUuids[idx].push(idString);
          }
        });
      }
    }
  });

  // the dropdowns appear below the incomplete assessments, in the order missions, quests, path, contests
  // will not appear if there are no completed assessments of that type
  categorisedUuids.forEach((uuids, idx) => {
    const assessmentType = assessmentTypes[idx];
    uuids.length > 0 &&
      inferencer.insertFakeAchievement({
        uuid: assessmentType,
        title: 'Completed ' + assessmentType,
        xp: 0,
        isVariableXp: false,
        deadline: undefined,
        release: undefined,
        isTask: true,
        position: -1 - idx, // negative number to ensure that they stay on top
        prerequisiteUuids: uuids,
        goalUuids: [],
        cardBackground: `${cardBackgroundUrl}/default.png`,
        view: {
          coverImage: `${coverImageUrl}/default.png`,
          description: 'Your completed ' + assessmentType + ' are listed here!',
          completionText: ''
        }
      });
  });
}

export default insertFakeAchievements;
