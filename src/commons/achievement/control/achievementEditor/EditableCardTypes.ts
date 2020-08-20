import {
  AchievementAbility,
  AchievementItem,
  AchievementView
} from 'src/features/achievement/AchievementTypes';

export enum EditableCardActionType {
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

export type EditableCardAction =
  | {
      type: EditableCardActionType.CHANGE_ABILITY;
      payload: AchievementAbility;
    }
  | {
      type: EditableCardActionType.CHANGE_CARD_BACKGROUND;
      payload: string;
    }
  | {
      type: EditableCardActionType.CHANGE_DEADLINE;
      payload: Date | undefined;
    }
  | {
      type: EditableCardActionType.CHANGE_GOAL_IDS;
      payload: number[];
    }
  | {
      type: EditableCardActionType.CHANGE_POSITION;
      payload: number;
    }
  | {
      type: EditableCardActionType.CHANGE_PREREQUISITE_IDS;
      payload: number[];
    }
  | {
      type: EditableCardActionType.CHANGE_RELEASE;
      payload: Date | undefined;
    }
  | {
      type: EditableCardActionType.CHANGE_TITLE;
      payload: string;
    }
  | {
      type: EditableCardActionType.CHANGE_VIEW;
      payload: AchievementView;
    }
  | {
      type: EditableCardActionType.DELETE_ACHIEVEMENT;
    }
  | {
      type: EditableCardActionType.DISCARD_CHANGES;
      payload: AchievementItem;
    }
  | {
      type: EditableCardActionType.SAVE_CHANGES;
    };

export type EditableCardState = {
  editableAchievement: AchievementItem;
  isDirty: boolean;
};
