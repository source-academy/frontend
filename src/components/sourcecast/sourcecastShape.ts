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
  start: {
    row: number;
    column: number;
  };
  end: {
    row: number;
    column: number;
  };
  action: string;
  lines: string[];
}

export interface ICursorPosition {
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
    data: ICodeDelta | ICursorPosition;
  }>;
}
