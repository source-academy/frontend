import { WorkspaceState } from '../../../commons/workspace/WorkspaceTypes';
import {
  CodeDelta,
  Input,
  PlaybackData,
  PlaybackStatus,
  SourcecastData
} from '../SourceRecorderTypes';

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
  readonly uid: string | null;
};
export type SourcecastWorkspaceState = SourcecastWorkspaceAttr & WorkspaceState;
