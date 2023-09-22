import { PayloadAction } from '@reduxjs/toolkit'
import { Chapter } from "js-slang/dist/types";
import { Input, PlaybackData, RecordingStatus } from "src/features/sourceRecorder/SourceRecorderTypes";

import { ExternalLibraryName } from "../../application/types/ExternalTypes";
import { createWorkspaceSlice, getDefaultWorkspaceState,WorkspaceState } from "./WorkspaceRedux";

export type SourcereelWorkspaceState = {
  readonly playbackData: PlaybackData;
  readonly recordingStatus: RecordingStatus;
  readonly timeElapsedBeforePause: number;
  readonly timeResumed: number;
} & WorkspaceState

export const defaultSourcereel: SourcereelWorkspaceState = {
  ...getDefaultWorkspaceState(),
  playbackData: {
    init: {
      editorValue: '',
      chapter: Chapter.SOURCE_1,
      externalLibrary: ExternalLibraryName.NONE
    },
    inputs: []
  },
  recordingStatus: RecordingStatus.notStarted,
  timeElapsedBeforePause: 0,
  timeResumed: 0
}

export const { actions: sourcereelActions, reducer: sourcereelReducer } = createWorkspaceSlice('sourcereel', defaultSourcereel, {
  recordInit(state, { payload }: PayloadAction<PlaybackData['init']>) {
    state.playbackData = {
      init: payload,
      inputs: []
    }
  },
  recordInput(state, { payload }: PayloadAction<Input>) {
    state.playbackData.inputs.push(payload)
  },
  resetInputs(state, { payload }: PayloadAction<Input[]>) {
    state.playbackData.inputs = payload
  },
  timerPause(state, { payload }: PayloadAction<number>) {
    state.recordingStatus = RecordingStatus.paused
    state.timeElapsedBeforePause = state.timeElapsedBeforePause + payload - state.timeResumed
  },
  timerReset(state) {
    state.recordingStatus = RecordingStatus.notStarted
    state.timeElapsedBeforePause = 0
    state.timeResumed = 0
  },
  timerResume: {
    prepare: (timeNow: number, timeBefore: number) => ({ payload: { timeNow, timeBefore }}),
    reducer(state, { payload: { timeNow, timeBefore } }: PayloadAction<Record<'timeNow' | 'timeBefore', number>>) {
      state.recordingStatus = RecordingStatus.recording
      state.timeElapsedBeforePause = timeBefore >= 0 ? timeBefore : state.timeElapsedBeforePause
      state.timeResumed = timeNow
    }
  }
})
