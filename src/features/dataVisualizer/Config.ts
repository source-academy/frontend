/**
 * Represents the config used to draw the drawings.
 */
export const Config = {
  StrokeWidth: 2,
  Stroke: 'white',
  Fill: 'white',

  BoxWidth: 45,
  BoxMinWidth: 15, // Set to half of BoxHeight for empty arrays following CseMachineConfig
  BoxHeight: 30,
  BoxSpacingX: 50,
  BoxSpacingY: 60,

  DistanceX: 45 / 2, // Half of box width
  DistanceY: 60,
  CircleRadiusLarge: 15,
  CircleRadiusSmall: 4,

  ArrowPointerOffsetHorizontal: 13, // Pixels to offset the arrow head by
  ArrowPointerOffsetVertical: -5, // Pixels to offset the arrow head by
  ArrowPointerSize: 5,
  ArrowMarginTop: 15,
  ArrowMarginBottom: 15,
  ArrowMarginHorizontal: 15,

  MaxTextLength: 20
};
