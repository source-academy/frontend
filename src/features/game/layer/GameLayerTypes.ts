export enum Layer {
  Effects = 'Effects',
  Background = 'Background',
  Character = 'Character',
  Speaker = 'Speaker',
  Dialogue = 'Dialogue',
  UI = 'UI',
  Objects = 'Objects'
}

// Back to Front
export const defaultLayerSequence = [
  Layer.Background,
  Layer.Objects,
  Layer.Character,
  Layer.Speaker,
  Layer.Dialogue,
  Layer.UI,
  Layer.Effects
];
