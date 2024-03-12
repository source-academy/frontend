/** configs for dimensions */
export enum Config {
  CanvasMinHeight = 800,
  CanvasMinWidth = 800,
  CanvasPaddingX = 30,
  CanvasPaddingY = 30,

  LevelPaddingX = 10,
  LevelPaddingY = 10,

  FrameMinWidth = 100,
  FramePaddingX = 20,
  FramePaddingY = 30,
  FrameMarginX = 60,
  FrameMarginY = 100,
  FrameCornerRadius = 3,

  FnRadius = 15,
  FnInnerRadius = 3,
  FnTooltipOpacity = 0.6,

  DataMinWidth = 20,
  DataUnitWidth = 40,
  DataUnitPaddingY = 40,
  DataUnitPaddingX = 50,
  DataUnitHeight = 40,
  DataCornerRadius = 3,
  DataHitStrokeWidth = 5,
  DataGroupMaxDist = 500,

  TextPaddingX = 10,
  TextPaddingY = 20,
  TextMargin = 5,
  TextMinWidth = 30,
  FontFamily = 'monospace, monospace',
  FontSize = 15,
  FontStyle = 'normal',
  FontVariant = 'normal',

  HoveredColor = '#32CD32',

  ArrowHeadSize = 10,
  ArrowStrokeWidth = 1,
  ArrowHitStrokeWidth = 5,
  ArrowHoveredStrokeWidth = 2,
  ArrowUnhoveredOpacity = 0.8,
  ArrowCornerRadius = 10,
  ArrowMinHeight = 100,
  ArrowNumLanes = 5,
  ArrowLaneInterval = 1, // lane for next arrow = previous lane + lane interval % num lanes.
  FrameArrowStrokeWidth = 2,
  FrameArrowHoveredStrokeWidth = 2.5,
  MaxExportWidth = 20000,
  MaxExportHeight = 12000,

  SA_WHITE = '#999999',
  SA_BLUE = '#2c3e50',
  PRINT_BACKGROUND = 'white',

  ConstantColon = ':= ',
  VariableColon = ': ',
  Ellipsis = '…',

  UnassignedData = '',
  GlobalFrameDefaultText = ':::pre-declared names::',
  GlobalEnvId = '-1'
}

export const ShapeDefaultProps = {
  preventDefault: false
};
