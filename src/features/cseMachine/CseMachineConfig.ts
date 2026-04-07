/** configs for dimensions */
export const Config = Object.freeze({
  CanvasMinHeight: 800,
  CanvasMinWidth: 800,
  CanvasPaddingX: 30,
  CanvasPaddingY: 30,

  LevelPaddingX: 10,
  LevelPaddingY: 10,

  FrameMinWidth: 100,
  // default width according to global text width (216) * 2 + padding (20) * 2
  FrameDefaultWidth: 472,
  FramePaddingX: 20,
  FramePaddingY: 30,
  FrameMinGapX: 80,
  FrameMarginX: 50,
  FrameMarginY: 10,
  FrameCornerRadius: 3,

  ArrayVerticalOffset: 20,

  FnRadius: 15,
  FnInnerRadius: 3,
  FnTooltipOpacity: 0.5,
  FnTooltipTextPadding: 5,
  FnDescriptionMaxWidth: 150,
  FnDescriptionMaxHeight: 60,
  FnDescriptionRevealOffsetY: 8,

  DataMinWidth: 20,
  DataUnitWidth: 40,
  DataUnitHeight: 40,
  DataCornerRadius: 3,
  DataHitStrokeWidth: 5,

  TextPaddingX: 10,
  TextPaddingY: 30,
  TextMargin: 5,
  TextMinWidth: 30,
  FontFamily: 'monospace, monospace',
  FontSize: 15,
  FontStyle: 'normal',
  FontVariant: 'normal',

  ArrowHeadSize: 10,
  ArrowStrokeWidth: 1,
  ArrowHitStrokeWidth: 5,
  ArrowHoveredStrokeWidth: 2,
  ArrowHoveredHeadSize: 15,
  ArrowCornerRadius: 20,
  ArrowMinCornerRadius: 5,
  ArrowSmallBendRadiusScale: 1,

  MaxExportWidth: 20000,
  MaxExportHeight: 12000,

  MinTerminalSegmentLength: 30,
  ArrowPostFrameStraightLength: 20,
  // Canvas background color
  BgColor: '#2c3e50',
  PrintBgColor: '#fff',

  // Colors of all text
  TextColor: '#999',
  TextColorFaded: '#455',
  PrintTextColor: '#333',
  PrintTextColorFaded: '#ccc',

  // Colors of arrows and borders
  StrokeColor: '#999',
  StrokeColorFaded: '#455',
  PrintStrokeColor: '#777',
  PrintStrokeColorFaded: '#ccc',
  ArrowHighlightedColor: '#ffffff',
  ArrowDeadHighlightedColor: '#787777',

  // Colors of different states
  ActiveColor: '#030fff',
  PrintActiveColor: '#3d5afe',
  DangerColor: '#ff1744',
  PrintDangerColor: '#f44336',
  HoverColor: '#25c225',
  HoverDeadColor: '#127a12',
  PrintHoverColor: '#0dbf0d',

  // Colors for text hover background
  // Note that these are also applied with an opacity when drawn
  HoverBgColor: '#000',
  PrintHoverBgColor: '#bbb',

  ConstantColon: ':= ',
  VariableColon: ': ',
  Ellipsis: '…',

  UnassignedData: '',
  GlobalFrameDefaultText: ':::pre-declared names::',
  GlobalEnvId: '-1'
});

export const ShapeDefaultProps = Object.freeze({
  preventDefault: false
});
