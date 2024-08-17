import { SpeakerDetail } from '../character/GameCharacterTypes';
import { DialogueObject } from '../dialogue/GameDialogueTypes';

export type Quiz = {
  questions: Question[];
};

export type Question = {
  question: string;
  prompt?: string;
  speaker: SpeakerDetail;
  answer: number;
  options: Option[];
};

export type Option = {
  text: string;
  reaction?: DialogueObject;
};
