import { Ace } from 'ace-builds/ace';
import { Chapter } from 'js-slang/dist/types';

import { ExternalLibraryName } from '../../commons/application/types/ExternalTypes';
import { Position } from '../../commons/editor/EditorTypes';
import { SideContentType } from '../../commons/sideContent/SideContentTypes';

export type InputTypeShape = {
  activeTabChange: SideContentType;
  chapterSelect: number;
  cursorPositionChange: Position;
  codeDelta: CodeDelta;
  externalLibrarySelect: ExternalLibraryName;
  forcePause: null;
  keyboardCommand: KeyboardCommand;
  selectionRangeData: SelectionData;
};

export enum KeyboardCommand {
  run = 'run'
}

export enum PlaybackStatus {
  forcedPaused = 'forcedPaused',
  playing = 'playing',
  paused = 'paused'
}

export type CodeDelta = Ace.Delta;

export type SelectionRange = Ace.Range;

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
    chapter: Chapter;
    externalLibrary: ExternalLibraryName;
    editorValue: string;
  };
  inputs: Input[];
};

export type SourcecastData = {
  title: string;
  description: string;
  uid: string;
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
