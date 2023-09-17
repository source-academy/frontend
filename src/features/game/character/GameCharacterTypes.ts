import { AssetKey, GamePosition, ItemId } from 'src/features/game/commons/CommonTypes';

export type SpeakerDetail = {
  speakerId: ItemId;
  expression: string;
  speakerPosition: GamePosition;
};

export type Character = {
  id: ItemId;
  name: string;
  expressions: Map<string, AssetKey>;
  defaultExpression: string;
  defaultPosition: GamePosition;
  scale: number;
};
