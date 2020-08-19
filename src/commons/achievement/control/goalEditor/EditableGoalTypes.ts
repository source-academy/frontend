import { GoalDefinition, GoalMeta } from 'src/features/achievement/AchievementTypes';

export enum ActionType {
  CHANGE_META = 'CHANGE_META',
  CHANGE_TEXT = 'CHANGE_TEXT',
  DELETE_GOAL = 'DELETE_GOAL',
  DISCARD_CHANGES = 'DISCARD_CHANGES',
  SAVE_CHANGES = 'SAVE_CHANGES'
}

export type Action =
  | {
      type: ActionType.CHANGE_META;
      payload: GoalMeta;
    }
  | {
      type: ActionType.CHANGE_TEXT;
      payload: string;
    }
  | {
      type: ActionType.DELETE_GOAL;
    }
  | {
      type: ActionType.DISCARD_CHANGES;
      payload: GoalDefinition;
    }
  | {
      type: ActionType.SAVE_CHANGES;
    };

export type State = {
  editableGoal: GoalDefinition;
  isDirty: boolean;
};
