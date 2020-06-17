export enum Layer {
  Effects,
  Background,
  Character,
  Speaker,
  PopUp,
  Dialogue,
  DialogueLabel,
  UI,
  Objects,
  BBox
}

// Back to Front
export const defaultLayerSequence = [
  Layer.Background,
  Layer.Objects,
  Layer.BBox,
  Layer.Character,
  Layer.Speaker,
  Layer.PopUp,
  Layer.Dialogue,
  Layer.DialogueLabel,
  Layer.UI,
  Layer.Effects
];
