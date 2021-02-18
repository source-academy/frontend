import { IGameActionable } from '../action/GameActionTypes';
import { SpeakerDetail } from '../character/GameCharacterTypes';

/**
 * @typedef {string} PartName - the label for one part/section of the dialogue
 * Parts can be used to play one part of the dialogue after another.
 */
export type PartName = string;

/**
 * @typedef DialogueLine - a line in the dialogue which can be augmented with actions and gotos
 * @param line - the spoken text for this line
 * @param speakerDetail - change in speaker for this line if any
 * @param goto - which part of the dialogue to go to after this line.
 */
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
