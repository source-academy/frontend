export enum Layer {
  Effects = 'Effects',
  Background = 'Background',
  Character = 'Character',
  Speaker = 'Speaker',
  Dialogue = 'Dialogue',
  DialogueLabel = 'DialogueLabel',
  UI = 'UI',
  Objects = 'Objects',
  BBox = 'BBox'
}

// Back to Front
export const defaultLayerSequence = [
  Layer.Background,
  Layer.Objects,
  Layer.BBox,
  Layer.Character,
  Layer.Speaker,
  Layer.Dialogue,
  Layer.DialogueLabel,
  Layer.UI,
  Layer.Effects
];
