export enum RecordingType {
  cursorPosition = 'cursorPosition',
  code = 'code',
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
    cursorPosition: ICursorPosition;
  };
  data: Array<{
    type: RecordingType;
    time: number;
    delta: ICodeDelta | ICursorPosition;
  }>;
}
