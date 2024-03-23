import { DialogueObject } from '../dialogue/GameDialogueTypes';

export type Quiz = {
  questions: Question[];
};

export type Question = {
  question: string;
  answer: Number;
  options: Option[];
};

export type Option = {
  text: string;
  reaction: DialogueObject;
};

export type QuizResult = {
  numberOfQuestions: number;
  allCorrect : boolean;
}