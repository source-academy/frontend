export interface IInputTypeShape {
  cursorPositionChange: IPosition;
  codeDelta: ICodeDelta;
  keyboardCommand: KeyboardCommand;
  selectionRangeData: ISelectionData;
}

export enum KeyboardCommand {
  run = 'run'
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

// Refer: https://stackoverflow.com/questions/55758713/match-pair-for-keyof-and-valueof-an-interface
export type Input = keyof IInputTypeShape extends infer K
  ? K extends keyof IInputTypeShape
    ? { time: number; type: K; data: IInputTypeShape[K] }
    : never
  : never;

export interface IPlaybackData {
  init: {
    editorValue: string;
  };
  inputs: Input[];
}

export interface ISourcecastData {
  title: string;
  description: string;
  inserted_at: string;
  updated_at: string;
  playbackData: string;
  id: number;
  uploader: {
    id: number;
    name: string;
  };
  url: string;
}

export enum RecordingStatus {
  notStarted = 'notStarted',
  recording = 'recording',
  paused = 'paused',
  finished = 'finished'
}
