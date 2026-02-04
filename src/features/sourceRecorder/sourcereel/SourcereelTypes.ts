import { WorkspaceState } from '../../../commons/workspace/WorkspaceTypes';
import { PlaybackData, RecordingStatus } from '../SourceRecorderTypes';

type SourcereelWorkspaceAttr = {
  readonly playbackData: PlaybackData;
  readonly recordingStatus: RecordingStatus;
  readonly timeElapsedBeforePause: number;
  readonly timeResumed: number;
};
export type SourcereelWorkspaceState = SourcereelWorkspaceAttr & WorkspaceState;
