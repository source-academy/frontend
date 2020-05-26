import { ExternalLibraryName } from 'src/commons/application/types/ExternalTypes';

export interface IInputTypeShape {
  chapterSelect: number;
  cursorPositionChange: Position;
  codeDelta: CodeDelta;
  externalLibrarySelect: ExternalLibraryName;
  keyboardCommand: KeyboardCommand;
  selectionRangeData: SelectionData;
}

export enum KeyboardCommand {
  run = 'run'
}

export enum PlaybackStatus {
  playing = 'playing',
  paused = 'paused'
}

export type CodeDelta = {
  start: Position;
  end: Position;
  action: string;
  lines: string[];
};

export type SelectionRange = {
  start: Position;
  end: Position;
};

export type SelectionData = {
  range: SelectionRange;
  isBackwards: boolean;
};

export type Position = {
  row: number;
  column: number;
};

// Refer: https://stackoverflow.com/questions/55758713/match-pair-for-keyof-and-valueof-an-interface
export type Input = keyof IInputTypeShape extends infer K
  ? K extends keyof IInputTypeShape
    ? { time: number; type: K; data: IInputTypeShape[K] }
    : never
  : never;

export type PlaybackData = {
  init: {
    chapter: number;
    externalLibrary: ExternalLibraryName;
    editorValue: string;
  };
  inputs: Input[];
};

export type SourcecastData = {
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
};

export enum RecordingStatus {
  notStarted = 'notStarted',
  recording = 'recording',
  paused = 'paused',
  finished = 'finished'
}
