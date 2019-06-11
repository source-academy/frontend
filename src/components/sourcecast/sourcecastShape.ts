export enum RecordingType {
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

export interface IDelta {
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

export interface IPlaybackData {
  init: string;
  data: Array<{
    time: number;
    delta: IDelta;
  }>;
}
