export enum DeltaType {
  cursorPositionChange = 'cursorPositionChange',
  codeDelta = 'codeDelta',
  selectionRangeChange = 'selectionRangeChange'
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

export interface IPosition {
  row: number;
  column: number;
}

export interface IPlaybackData {
  init: {
    editorValue: string;
  };
  deltas: Array<{
    type: DeltaType;
    time: number;
    data: DeltaData;
  }>;
}

export type DeltaData = ISelectionRange | ICodeDelta | IPosition;

export interface ISourcecastData {
  name: string;
  description: string;
  inserted_at: string;
  updated_at: string;
  audio: string;
  deltas: string;
  id: number;
  uploader_id: number;
  url: string;
}
