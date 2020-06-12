import { DialogueId } from '../commons/CommonsTypes';

type Lines = string;
type PartName = string;

export type Dialogue = {
  title: string;
  content: DialogueObject;
};

export type DialogueObject = Map<PartName, Lines[]>;

type Speaker = string;
type Expression = string;
export type SpeakerDetail = [Speaker, Expression];
export type DialogueString = string;

export const emptyDialogueMap = new Map<DialogueId, Dialogue>();
