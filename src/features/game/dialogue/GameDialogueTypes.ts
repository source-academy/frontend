import { ActionCondition, IGameActionable } from '../action/GameActionTypes';
import { SpeakerDetail } from '../character/GameCharacterTypes';

/**
 * The label for one part/section of the dialogue
 * Parts can be used to play one part of the dialogue after another.
 */
export type PartName = string;

/**
 * Choice option that is shown on a prompt button
 */
export type Choice = string;

/**
 * A line in the dialogue which can be augmented with actions, gotos and prompts.
 * @param line - the spoken text for this line
 * @param speakerDetail - change in speaker for this line if any
 * @param goto - which part of the dialogue to go to after this line.
 * @param prompt - a user prompt that can trigger a different dialogue part
 * based on user choice
 */
export type DialogueLine = IGameActionable & {
  line: string;
  speakerDetail?: SpeakerDetail | null;
  goto?: {
    conditions: ActionCondition[];
    part: PartName;
    altPart: PartName | null;
  };
  prompt?: Prompt;
};

/**
 * A dialogue line containing only the speaker name and the line itself.
 * This is primarily used for storing minimal information in the dialogue storage.
 * @param speaker - the name of the speaker
 * @param line - the spoken text for this line
 */
export type DialogueStorageLine = {
  speaker: string;
  line: string;
};

export type Dialogue = {
  title: string;
  content: DialogueObject;
};

/**
 * A prompt pop-up with a title and choices.
 * @param promptTitle - a line or question to provide context for prompt
 * @param choices - possible options the user can select and associated
 * gotos
 */
export type Prompt = {
  promptTitle: string;
  choices: [Choice, PartName][];
};

export type DialogueObject = Map<PartName, DialogueLine[]>;
