import {
  AchievementGoal,
  EventType,
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
        assessmentNumber: 0,
        requiredCompletionFrac: 0
      };
    case GoalType.BINARY:
      return {
        type: GoalType.BINARY,
        condition: false,
        targetCount: 1
      };
    case GoalType.MANUAL:
      return {
        type: GoalType.MANUAL,
        targetCount: 1
      };
    case GoalType.EVENT:
      return {
        type: GoalType.EVENT,
        eventNames: [EventType.RUN_CODE],
        targetCount: 1,
        release: undefined,
        deadline: undefined,
        observeFrom: undefined,
        observeTo: undefined
      };
  }
};

export const goalDefinitionTemplate: GoalDefinition = {
  uuid: '',
  text: 'Goal Text Here',
  achievementUuids: [],
  meta: metaTemplate(GoalType.MANUAL)
};

const goalProgressTemplate: GoalProgress = {
  uuid: '',
  count: 0,
  targetCount: 1,
  completed: false
};

export const goalTemplate: AchievementGoal = {
  ...goalDefinitionTemplate,
  ...goalProgressTemplate
};
