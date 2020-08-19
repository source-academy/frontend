import {
  AchievementAbility,
  AchievementItem,
  AchievementView
} from 'src/features/achievement/AchievementTypes';

export enum ActionType {
  CHANGE_ABILITY = 'CHANGE_ABILITY',
  CHANGE_CARD_BACKGROUND = 'CHANGE_CARD_BACKGROUND',
  CHANGE_DEADLINE = 'CHANGE_DEADLINE',
  CHANGE_GOAL_IDS = 'CHANGE_GOAL_IDS',
  CHANGE_POSITION = 'CHANGE_POSITION',
  CHANGE_PREREQUISITE_IDS = 'CHANGE_PREREQUISITE_IDS',
  CHANGE_RELEASE = 'CHANGE_RELEASE',
  CHANGE_TITLE = 'CHANGE_TITLE',
  CHANGE_VIEW = 'CHANGE_VIEW',
  DELETE_ACHIEVEMENT = 'DELETE_ACHIEVEMENT',
  DISCARD_CHANGES = 'DISCARD_CHANGES',
  SAVE_CHANGES = 'SAVE_CHANGES'
}

export type Action =
  | {
      type: ActionType.CHANGE_ABILITY;
      payload: AchievementAbility;
    }
  | {
      type: ActionType.CHANGE_CARD_BACKGROUND;
      payload: string;
    }
  | {
      type: ActionType.CHANGE_DEADLINE;
      payload: Date | undefined;
    }
  | {
      type: ActionType.CHANGE_GOAL_IDS;
      payload: number[];
    }
  | {
      type: ActionType.CHANGE_POSITION;
      payload: number;
    }
  | {
      type: ActionType.CHANGE_PREREQUISITE_IDS;
      payload: number[];
    }
  | {
      type: ActionType.CHANGE_RELEASE;
      payload: Date | undefined;
    }
  | {
      type: ActionType.CHANGE_TITLE;
      payload: string;
    }
  | {
      type: ActionType.CHANGE_VIEW;
      payload: AchievementView;
    }
  | {
      type: ActionType.DELETE_ACHIEVEMENT;
    }
  | {
      type: ActionType.DISCARD_CHANGES;
      payload: AchievementItem;
    }
  | {
      type: ActionType.SAVE_CHANGES;
    };

export type State = {
  editableAchievement: AchievementItem;
  isDirty: boolean;
};
