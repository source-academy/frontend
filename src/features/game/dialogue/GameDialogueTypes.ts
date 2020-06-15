import { GameAction } from '../action/GameActionTypes';
import { SpeakerDetail } from '../character/GameCharacterTypes';

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
export type DialogueString = string;
