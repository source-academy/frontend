import { AchievementItem, AchievementView } from 'src/features/achievement/AchievementTypes';

export enum EditableCardActionType {
  CHANGE_CARD_BACKGROUND = 'CHANGE_CARD_BACKGROUND',
  CHANGE_DEADLINE = 'CHANGE_DEADLINE',
  CHANGE_GOAL_UUIDS = 'CHANGE_GOAL_UUIDS',
  CHANGE_POSITION = 'CHANGE_POSITION',
  CHANGE_PREREQUISITE_UUIDS = 'CHANGE_PREREQUISITE_UUIDS',
  CHANGE_RELEASE = 'CHANGE_RELEASE',
  CHANGE_TITLE = 'CHANGE_TITLE',
  CHANGE_IS_VARIABLE_XP = 'CHANGE_VARIABLE_XP',
  CHANGE_VIEW = 'CHANGE_VIEW',
  CHANGE_XP = 'CHANGE_XP',
  DELETE_ACHIEVEMENT = 'DELETE_ACHIEVEMENT',
  DISCARD_CHANGES = 'DISCARD_CHANGES',
  SAVE_CHANGES = 'SAVE_CHANGES'
}

export type EditableCardAction =
  | {
      type: EditableCardActionType.CHANGE_CARD_BACKGROUND;
      payload: string;
    }
  | {
      type: EditableCardActionType.CHANGE_DEADLINE;
      payload: Date | undefined;
    }
  | {
      type: EditableCardActionType.CHANGE_GOAL_UUIDS;
      payload: string[];
    }
  | {
      type: EditableCardActionType.CHANGE_POSITION;
      payload: number;
    }
  | {
      type: EditableCardActionType.CHANGE_PREREQUISITE_UUIDS;
      payload: string[];
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
      type: EditableCardActionType.CHANGE_IS_VARIABLE_XP;
    }
  | {
      type: EditableCardActionType.CHANGE_VIEW;
      payload: AchievementView;
    }
  | {
      type: EditableCardActionType.CHANGE_XP;
      payload: number;
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
