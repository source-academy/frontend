/** configs for dimensions */
export const Config = Object.freeze({
  CanvasMinHeight: 800,
  CanvasMinWidth: 800,
  CanvasPaddingX: 30,
  CanvasPaddingY: 30,

  LevelPaddingX: 10,
  LevelPaddingY: 10,

  FrameMinWidth: 100,
  FramePaddingX: 20,
  FramePaddingY: 30,
  FrameMarginX: 30,
  FrameMarginY: 10,
  FrameCornerRadius: 3,

  FnRadius: 15,
  FnInnerRadius: 3,
  FnTooltipOpacity: 0.3,

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
  ArrowCornerRadius: 40,

  MaxExportWidth: 20000,
  MaxExportHeight: 12000,

  // Canvas background color
  BgColor: '#2c3e50',
  PrintBgColor: '#fff',

  // Colors of all text
  TextColor: '#999',
  TextColorFaded: '#5b6773',
  PrintTextColor: '#333',
  PrintTextColorFaded: '#ccc',

  // Colors of arrows and borders
  StrokeColor: '#999',
  StrokeColorFaded: '#5b6773',
  PrintStrokeColor: '#777',
  PrintStrokeColorFaded: '#ccc',

  // Colors of different states
  ActiveColor: '#030fff',
  PrintActiveColor: '#3d5afe',
  DangerColor: '#ff1744',
  PrintDangerColor: '#f44336',
  HoverColor: '#25c225',
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
