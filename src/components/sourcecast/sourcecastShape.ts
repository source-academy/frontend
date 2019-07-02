export enum DeltaType {
  cursorPositionChange = 'cursorPositionChange',
  codeDelta = 'codeDelta'
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
    data: ICodeDelta | IPosition;
  }>;
}
