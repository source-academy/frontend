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
  Dashboard,
  WorkerMessage
}

// Back to Front
export const defaultLayerSequence = [
  Layer.Background,
  Layer.Selector,
  Layer.Objects,
  Layer.BBox,
  Layer.Character,
  Layer.Speaker,
  Layer.PopUp,
  Layer.Dialogue,
  Layer.SpeakerBox,
  Layer.Effects,
  Layer.Dashboard,
  Layer.Escape,
  Layer.UI,
  Layer.WorkerMessage
];
