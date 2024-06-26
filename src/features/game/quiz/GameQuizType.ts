import { SpeakerDetail } from '../character/GameCharacterTypes';
import { DialogueObject } from '../dialogue/GameDialogueTypes';

export type Quiz = {
  questions: Question[];
};

export type Question = {
  question: string;
  speaker: SpeakerDetail;
  answer: Number;
  options: Option[];
};

export type Option = {
  text: string;
  reaction?: DialogueObject;
};
