import {
  AchievementGoal,
  GoalDefinition,
  GoalMeta,
  GoalProgress,
  GoalType
} from 'src/features/achievement/AchievementTypes';

export const metaTemplate = (type: GoalType): GoalMeta => {
  switch (type) {
    case GoalType.ASSESSMENT:
      return {
        type: GoalType.ASSESSMENT,
        assessmentNumber: '',
        requiredCompletionFrac: 0
      };
    case GoalType.BINARY:
      return {
        type: GoalType.BINARY,
        condition: false,
        maxXp: 0
      };
    case GoalType.MANUAL:
      return {
        type: GoalType.MANUAL,
        maxXp: 0
      };
  }
};

export const goalDefinitionTemplate: GoalDefinition = {
  uuid: -1,
  text: 'Goal Text Here',
  meta: metaTemplate(GoalType.MANUAL)
};

const goalProgressTemplate: GoalProgress = {
  uuid: -1,
  xp: 0,
  maxXp: 0,
  completed: false
};

export const goalTemplate: AchievementGoal = {
  ...goalDefinitionTemplate,
  ...goalProgressTemplate
};
