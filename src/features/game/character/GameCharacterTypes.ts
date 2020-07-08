import { AssetKey, ItemId } from '../commons/CommonTypes';

export type SpeakerDetail = {
  speakerId: ItemId;
  expression: string;
  speakerPosition: CharacterPosition;
};

export type Character = {
  id: ItemId;
  name: string;
  expressions: Map<string, AssetKey>;
  defaultExpression: string;
  defaultPosition: CharacterPosition;
};

export enum CharacterPosition {
  Left = 'Left',
  Middle = 'Middle',
  Right = 'Right'
}
