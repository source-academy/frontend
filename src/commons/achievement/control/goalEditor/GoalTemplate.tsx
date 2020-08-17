import { GoalDefinition, GoalMeta, GoalType } from 'src/features/achievement/AchievementTypes';

export const metaTemplate = (type: GoalType) => {
  switch (type) {
    case GoalType.ASSESSMENT:
      return {
        type: GoalType.ASSESSMENT,
        assessmentNumber: '',
        requiredCompletionFrac: 0
      } as GoalMeta;
    case GoalType.BINARY:
      return {
        type: GoalType.BINARY,
        condition: false,
        maxXp: 0
      } as GoalMeta;
    case GoalType.MANUAL:
      return {
        type: GoalType.MANUAL,
        maxXp: 0
      } as GoalMeta;
    default:
      return {} as GoalMeta;
  }
};

export const goalTemplate: GoalDefinition = {
  id: 0,
  text: 'Goal Text Here',
  meta: metaTemplate(GoalType.MANUAL)
};
