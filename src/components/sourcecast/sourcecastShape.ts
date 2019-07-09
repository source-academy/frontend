export enum InputType {
  cursorPositionChange = 'cursorPositionChange',
  codeDelta = 'codeDelta',
  keyboardCommand = 'keyboardCommand',
  selectionRangeData = 'selectionRangeData'
}

export enum KeyboardCommand {
  run = 'run'
}

export enum RecordingStatus {
  notStarted = 'notStarted',
  recording = 'recording',
  paused = 'paused',
  finished = 'finished'
}

export enum PlaybackStatus {
  notStarted = 'notStarted',
  playing = 'recording',
  paused = 'paused',
  finished = 'finished'
}

export interface ICodeDelta {
  start: IPosition;
  end: IPosition;
  action: string;
  lines: string[];
}

export interface ISelectionRange {
  start: IPosition;
  end: IPosition;
}

export interface ISelectionData {
  range: ISelectionRange;
  isBackwards: boolean;
}

export interface IPosition {
  row: number;
  column: number;
}

export interface IInput {
  type: InputType;
  time: number;
  data: InputData;
}

export interface IPlaybackData {
  init: {
    editorValue: string;
  };
  inputs: IInput[];
}

export type InputData = ISelectionData | ICodeDelta | IPosition | KeyboardCommand;

export interface ISourcecastData {
  name: string;
  description: string;
  inserted_at: string;
  updated_at: string;
  audio: string;
  deltas: string;
  id: number;
  uploader: {
    id: number;
    name: string;
  };
  url: string;
}
