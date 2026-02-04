import { createActions } from 'src/commons/redux/utils';

import { WorkspaceLocation } from '../../commons/workspace/WorkspaceTypes';
import { CodeDelta, Input, PlaybackData, PlaybackStatus } from './SourceRecorderTypes';

const SourceRecorderActions = createActions('sourceRecorder', {
  saveSourcecastData: (
    title: string,
    description: string,
    uid: string,
    audio: Blob,
    playbackData: PlaybackData,
    workspaceLocation: WorkspaceLocation
  ) => ({
    title,
    description,
    uid,
    audio,
    audioUrl: window.URL.createObjectURL(audio),
    playbackData,
    workspaceLocation
  }),
  setCurrentPlayerTime: (playerTime: number, workspaceLocation: WorkspaceLocation) => ({
    playerTime,
    workspaceLocation
  }),
  setCodeDeltasToApply: (deltas: CodeDelta[], workspaceLocation: WorkspaceLocation) => ({
    deltas,
    workspaceLocation
  }),
  setInputToApply: (inputToApply: Input, workspaceLocation: WorkspaceLocation) => ({
    inputToApply,
    workspaceLocation
  }),
  setSourcecastData: (
    title: string,
    description: string,
    uid: string,
    audioUrl: string,
    playbackData: PlaybackData,
    workspaceLocation: WorkspaceLocation
  ) => ({ title, description, uid, audioUrl, playbackData, workspaceLocation }),
  setSourcecastDuration: (duration: number, workspaceLocation: WorkspaceLocation) => ({
    duration,
    workspaceLocation
  }),
  setSourcecastStatus: (playbackStatus: PlaybackStatus, workspaceLocation: WorkspaceLocation) => ({
    playbackStatus,
    workspaceLocation
  })
});

// For compatibility with existing code (reducer)
export const {
  saveSourcecastData,
  setCurrentPlayerTime,
  setCodeDeltasToApply,
  setInputToApply,
  setSourcecastData,
  setSourcecastDuration,
  setSourcecastStatus
} = SourceRecorderActions;

// For compatibility with existing code (actions helper)
export default SourceRecorderActions;
