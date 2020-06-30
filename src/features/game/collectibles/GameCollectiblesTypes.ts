export enum CollectiblePage {
  Collectibles = 'Collectibles',
  Achievements = 'Achievements'
}

export type CollectibleProperty = {
  assetKey: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
};
