export enum ControlStashConfig {
  ControlPosX = 20,
  ControlPosY = 5,
  StashPosX = 140,
  StashPosY = 5,

  ControlItemWidth = 120,
  ControlItemTextPadding = 10,
  ControlItemCornerRadius = 5,
  ControlMaxTextWidth = 95,
  ControlMaxTextHeight = 125,
  StashMaxTextWidth = ControlMaxTextWidth,
  StashItemHeight = 15,
  StashItemTextPadding = ControlItemTextPadding,
  StashMaxTextHeight = 30,
  StashItemCornerRadius = ControlItemCornerRadius,

  ShowMoreButtonWidth = 80,
  ShowMoreButtonHeight = 15,
  ShowMoreButtonX = 40,
  ShowMoreButtonY = 25,

  TooltipOpacity = 0.7,
  TooltipMargin = 5,
  TooltipPadding = 5,

  FontFamily = 'monospace, monospace',
  FontSize = 15,
  FontStyle = 'normal',
  FontVariant = 'normal',
  FontStyleHeader = 'bold',
  FontSizeHeader = 18,

  SA_WHITE = '#999999',
  SA_BLUE = '#2c3e50',
  PRINT_BACKGROUND = 'white',
  STASH_DANGER_ITEM = '#ff0000'
}

export const ShapeDefaultProps = {
  preventDefault: false
};
