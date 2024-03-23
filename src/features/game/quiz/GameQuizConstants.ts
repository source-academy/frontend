import { DialogueLine, DialogueObject } from "../dialogue/GameDialogueTypes";

export const defaultReaction = {
  correct: ['You are right.'],
  wrong: ['Wrong answer...']
};

const resultLine : DialogueLine = {
  line : "good job",
}

const resultLine2 : DialogueLine = {
  line : "Need improvement. Some questions are wrong. ",
}

export const allCorrect : DialogueObject = new Map([
  ["all correct", [resultLine]]
]); 

export const ImproveMent : DialogueObject = new Map([
  ["improvement", [resultLine2]]
]); 