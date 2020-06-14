import { ItemId, SpeakerDetail } from '../commons/CommonsTypes';
import { GameAction } from '../action/GameActionTypes';

export type PartName = string;

export type DialogueLine = {
  line: string;
  speakerDetail?: SpeakerDetail | null;
  actions?: GameAction[];
  goto?: PartName;
};

export type Dialogue = {
  title: string;
  content: DialogueObject;
  startPart: PartName;
};

export type DialogueObject = Map<PartName, DialogueLine[]>;

export type LineChangeFn = (message: string) => void;
export type SpeakerChangeFn = (speakerDetail: SpeakerDetail | null) => void;

export type DialogueString = string;
export const emptyDialogueMap = new Map<ItemId, Dialogue>();
