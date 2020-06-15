import { SpeakerDetail } from '../character/GameCharacterTypes';
import { IGameActionable } from '../action/GameActionTypes';

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
