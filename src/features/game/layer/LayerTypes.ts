export enum LayerType {
  Effects = 'Effects',
  Background = 'Background',
  Character = 'Character',
  Objects = 'Objects'
}

export const defaultLayerSequence = [
  LayerType.Background,
  LayerType.Objects,
  LayerType.Character,
  LayerType.Effects
];
