type Lines = string;

export type DialogueObject = {
  [partName: string]: Lines[];
};

type Speaker = string;
type Expression = string;
export type SpeakerDetail = [Speaker, Expression];
export type DialogueString = string;
