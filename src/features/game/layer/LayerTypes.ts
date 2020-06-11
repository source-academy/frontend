export enum Layer {
  Effects = 'Effects',
  Background = 'Background',
  Character = 'Character',
  UI = 'UI',
  Objects = 'Objects'
}

// Back to Front
export const defaultLayerSequence = [
  Layer.Background,
  Layer.Objects,
  Layer.Character,
  Layer.UI,
  Layer.Effects
];
