export enum Layer {
  Effects,
  Background,
  Character,
  Speaker,
  PopUp,
  Dialogue,
  SpeakerBox,
  UI,
  Objects,
  BBox,
  Escape,
  Selector,
  Collectibles
}

// Back to Front
export const defaultLayerSequence = [
  Layer.Background,
  Layer.Selector,
  Layer.Collectibles,
  Layer.Objects,
  Layer.BBox,
  Layer.Character,
  Layer.Speaker,
  Layer.PopUp,
  Layer.Dialogue,
  Layer.SpeakerBox,
  Layer.UI,
  Layer.Effects,
  Layer.Escape
];
