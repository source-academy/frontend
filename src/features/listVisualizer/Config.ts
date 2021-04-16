/**
 * Represents the config used to draw the drawings.
 */
export const Config = {
  StrokeWidth: 2,
  Stroke: 'white',
  Fill: 'white',
  
  BoxWidth: 45,
  BoxHeight: 30,
  BoxSpacingX: 50,
  BoxSpacingY: 60,
  
  DistanceX: 45 / 2, // Half of box width
  DistanceY: 60,
  CircleRadiusLarge: 15,
  CircleRadiusSmall: 4,

  ArrowSpaceHorizontal: 13, // The horizontal spacing the backward arrow head is from the end point
  ArrowSpaceVertical: 5, // The vertical spacing the backward arrow head is from the target box; to prevent overlapping with the target box
  ArrowPointerSize: 5,
  ArrowMarginTop: 15,
  ArrowMarginBottom: 15,
  ArrowMarginHorizontal: 15,

  MaxTextLength: 20,
};
