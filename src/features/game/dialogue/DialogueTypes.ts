import { ItemId } from '../commons/CommonsTypes';

type Lines = string;
type PartName = string;

export type Dialogue = {
  title: string;
  content: DialogueObject;
};

export type DialogueObject = Map<PartName, Lines[]>;

export type DialogueString = string;
export const emptyDialogueMap = new Map<ItemId, Dialogue>();

type Speaker = string;
type Expression = string;
export type SpeakerDetail = [Speaker, Expression];

export type LineChangeFn = (message: string) => void;
export type SpeakerChangeFn = (speakerDetail: SpeakerDetail | null) => void;
