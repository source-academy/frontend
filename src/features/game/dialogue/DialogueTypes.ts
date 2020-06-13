import { ItemId, SpeakerDetail } from '../commons/CommonsTypes';

type PartName = string;
type Line = string;

export type Dialogue = {
  title: string;
  content: DialogueObject;
};

export type DialogueObject = Map<PartName, Line[]>;

export type LineChangeFn = (message: string) => void;
export type SpeakerChangeFn = (speakerDetail: SpeakerDetail | null) => void;

export type DialogueString = string;
export const emptyDialogueMap = new Map<ItemId, Dialogue>();
