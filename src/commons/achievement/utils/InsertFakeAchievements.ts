import moment from 'moment';

import {
  cardBackgroundUrl,
  coverImageUrl
} from '../../../features/achievement/AchievementConstants';
import { GoalType } from '../../../features/achievement/AchievementTypes';
import { AssessmentOverview } from '../../assessment/AssessmentTypes';
import AchievementInferencer from './AchievementInferencer';
import { isExpired, isReleased } from './DateHelper';

function insertFakeAchievements(
  assessmentOverviews: AssessmentOverview[],
  inferencer: AchievementInferencer
) {
  const sortedOverviews = [...assessmentOverviews].sort((overview1, overview2) =>
    moment(overview1.closeAt).diff(moment(overview2.closeAt))
  );
  const length = assessmentOverviews.length;

  const completedMissionUuids: string[] = [];
  const completedQuestUuids: string[] = [];
  const completedPathUuids: string[] = [];
  const completedContestUuids: string[] = [];

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
        xp:
          assessmentOverview.gradingStatus === 'graded' || !assessmentOverview.isManuallyGraded
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
      if (assessmentOverview.gradingStatus === 'graded' || !assessmentOverview.isManuallyGraded) {
        switch (assessmentOverview.type) {
          case 'Missions':
            completedMissionUuids.push(idString);
            break;
          case 'Quests':
            completedQuestUuids.push(idString);
            break;
          case 'Path':
            completedPathUuids.push(idString);
            break;
          case 'Contests':
            completedContestUuids.push(idString);
            break;
          default:
            break;
        }
      }
    }
  });

  // the dropdowns appear below the incomplete assessments, in the order missions, quests, path, contests
  // will not appear if there are no completed assessments of that type
  completedMissionUuids.length > 0 &&
    inferencer.insertFakeAchievement({
      uuid: '000',
      title: 'Completed Missions',
      xp: 0,
      isVariableXp: false,
      deadline: undefined,
      release: undefined,
      isTask: true,
      position: -4,
      prerequisiteUuids: completedMissionUuids,
      goalUuids: [],
      cardBackground: `${cardBackgroundUrl}/default.png`,
      view: {
        coverImage: `${coverImageUrl}/default.png`,
        description: 'Your completed missions are listed here!',
        completionText: ''
      }
    });

  completedQuestUuids.length > 0 &&
    inferencer.insertFakeAchievement({
      uuid: '001',
      title: 'Completed Quests',
      xp: 0,
      isVariableXp: false,
      deadline: undefined,
      release: undefined,
      isTask: true,
      position: -3,
      prerequisiteUuids: completedQuestUuids,
      goalUuids: [],
      cardBackground: `${cardBackgroundUrl}/default.png`,
      view: {
        coverImage: `${coverImageUrl}/default.png`,
        description: 'Your completed quests are listed here!',
        completionText: ''
      }
    });

  completedPathUuids.length > 0 &&
    inferencer.insertFakeAchievement({
      uuid: '002',
      title: 'Completed Paths',
      xp: 0,
      isVariableXp: false,
      deadline: undefined,
      release: undefined,
      isTask: true,
      position: -2,
      prerequisiteUuids: completedPathUuids,
      goalUuids: [],
      cardBackground: `${cardBackgroundUrl}/default.png`,
      view: {
        coverImage: `${coverImageUrl}/default.png`,
        description: 'Your completed paths are listed here!',
        completionText: ''
      }
    });

  completedContestUuids.length > 0 &&
    inferencer.insertFakeAchievement({
      uuid: '003',
      title: 'Completed Contests',
      xp: 0,
      isVariableXp: false,
      deadline: undefined,
      release: undefined,
      isTask: true,
      position: -1,
      prerequisiteUuids: completedMissionUuids,
      goalUuids: [],
      cardBackground: `${cardBackgroundUrl}/default.png`,
      view: {
        coverImage: `${coverImageUrl}/default.png`,
        description: 'Your completed contests are listed here!',
        completionText: ''
      }
    });
}

export default insertFakeAchievements;
