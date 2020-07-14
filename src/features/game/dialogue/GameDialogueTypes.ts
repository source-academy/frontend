import { IGameActionable } from '../action/GameActionTypes';
import { SpeakerDetail } from '../character/GameCharacterTypes';

export type PartName = string;

export type DialogueLine = IGameActionable & {
  line: string;
  speakerDetail?: SpeakerDetail | null;
  goto?: PartName;
};

export type Dialogue = {
  title: string;
  content: DialogueObject;
};

export type DialogueObject = Map<PartName, DialogueLine[]>;
export type DialogueString = string;
