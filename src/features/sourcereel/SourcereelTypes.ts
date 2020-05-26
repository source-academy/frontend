import { WorkspaceState } from 'src/commons/application/ApplicationTypes';
import {
    PlaybackData,
    RecordingStatus,
} from 'src/features/sourcecast/SourcecastTypes';

type SourcereelWorkspaceAttr = {
    readonly playbackData: PlaybackData;
    readonly recordingStatus: RecordingStatus;
    readonly timeElapsedBeforePause: number;
    readonly timeResumed: number;
};
export type SourcereelWorkspaceState = SourcereelWorkspaceAttr & WorkspaceState;