import { GoalDefinition, GoalMeta } from 'src/features/achievement/AchievementTypes';

export enum EditableGoalActionType {
  CHANGE_META = 'CHANGE_META',
  CHANGE_TEXT = 'CHANGE_TEXT',
  DELETE_GOAL = 'DELETE_GOAL',
  DISCARD_CHANGES = 'DISCARD_CHANGES',
  SAVE_CHANGES = 'SAVE_CHANGES'
}

export type EditableGoalAction =
  | {
      type: EditableGoalActionType.CHANGE_META;
      payload: GoalMeta;
    }
  | {
      type: EditableGoalActionType.CHANGE_TEXT;
      payload: string;
    }
  | {
      type: EditableGoalActionType.DELETE_GOAL;
    }
  | {
      type: EditableGoalActionType.DISCARD_CHANGES;
      payload: GoalDefinition;
    }
  | {
      type: EditableGoalActionType.SAVE_CHANGES;
    };

export type EditableGoalState = {
  editableGoal: GoalDefinition;
  isDirty: boolean;
};
