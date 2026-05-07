import type { Ace } from 'ace-builds';
import type { ExternalLibraryName } from 'src/commons/application/types/ExternalTypes';
import type { Position } from 'src/commons/editor/EditorTypes';
import type { SideContentType } from 'src/commons/sideContent/SideContentTypes';

export enum KeyboardCommand {
  run = 'run'
}

type InputTypeShape = {
  activeTabChange: SideContentType;
  chapterSelect: number;
  cursorPositionChange: Position;
  codeDelta: CodeDelta;
  externalLibrarySelect: ExternalLibraryName;
  forcePause: null;
  keyboardCommand: KeyboardCommand;
  selectionRangeData: SelectionData;
};

type SelectionData = {
  range: SelectionRange;
  isBackwards: boolean;
};

export type SelectionRange = Ace.Range;

export type CodeDelta = Ace.Delta;

// Refer: https://stackoverflow.com/questions/55758713/match-pair-for-keyof-and-valueof-an-interface
export type Input = keyof InputTypeShape extends infer K
  ? K extends keyof InputTypeShape
    ? { time: number; type: K; data: InputTypeShape[K] }
    : never
  : never;
