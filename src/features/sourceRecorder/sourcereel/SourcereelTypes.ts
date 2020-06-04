import { WorkspaceState } from '../../../commons/workspace/WorkspaceTypes';
import { PlaybackData, RecordingStatus } from '../SourceRecorderTypes';

export const DELETE_SOURCECAST_ENTRY = 'DELETE_SOURCECAST_ENTRY';
export const RECORD_INIT = 'RECORD_INIT';
export const RECORD_INPUT = 'RECORD_INPUT';
export const RESET_INPUTS = 'RESET_INPUTS';
export const TIMER_PAUSE = 'TIMER_PAUSE';
export const TIMER_RESET = 'TIMER_RESET';
export const TIMER_RESUME = 'TIMER_RESUME';
export const TIMER_START = 'TIMER_START';
export const TIMER_STOP = 'TIMER_STOP';

type SourcereelWorkspaceAttr = {
  readonly playbackData: PlaybackData;
  readonly recordingStatus: RecordingStatus;
  readonly timeElapsedBeforePause: number;
  readonly timeResumed: number;
};
export type SourcereelWorkspaceState = SourcereelWorkspaceAttr & WorkspaceState;
