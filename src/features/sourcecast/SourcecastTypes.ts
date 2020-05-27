import { ExternalLibraryName } from 'src/commons/application/types/ExternalTypes';
import { Position } from 'src/commons/editor/EditorTypes';
import { WorkspaceState } from 'src/commons/workspace/WorkspaceTypes';

export type InputTypeShape = {
  chapterSelect: number;
  cursorPositionChange: Position;
  codeDelta: CodeDelta;
  externalLibrarySelect: ExternalLibraryName;
  keyboardCommand: KeyboardCommand;
  selectionRangeData: SelectionData;
};

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

// Refer: https://stackoverflow.com/questions/55758713/match-pair-for-keyof-and-valueof-an-interface
export type Input = keyof InputTypeShape extends infer K
  ? K extends keyof InputTypeShape
    ? { time: number; type: K; data: InputTypeShape[K] }
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

type SourcecastWorkspaceAttr = {
  readonly audioUrl: string;
  readonly codeDeltasToApply: CodeDelta[] | null;
  readonly currentPlayerTime: number;
  readonly description: string | null;
  readonly inputToApply: Input | null;
  readonly playbackData: PlaybackData;
  readonly playbackDuration: number;
  readonly playbackStatus: PlaybackStatus;
  readonly sourcecastIndex: SourcecastData[] | null;
  readonly title: string | null;
};
export type SourcecastWorkspaceState = SourcecastWorkspaceAttr & WorkspaceState;
