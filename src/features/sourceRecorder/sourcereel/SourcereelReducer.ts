import { createReducer } from '@reduxjs/toolkit';
import { defaultWorkspaceManager } from 'src/commons/application/ApplicationTypes';

import { RecordingStatus } from '../SourceRecorderTypes';
import {
  recordInit,
  recordInput,
  resetInputs,
  timerPause,
  timerReset,
  timerResume,
  timerStart,
  timerStop
} from './SourcereelActions';

export const SourcereelReducer = createReducer(defaultWorkspaceManager.sourcereel, builder => {
  builder
    .addCase(recordInit, (state, action) => {
      state.playbackData.init = action.payload.initData;
      state.playbackData.inputs = [];
    })
    .addCase(recordInput, (state, action) => {
      state.playbackData.inputs.push(action.payload.input);
    })
    .addCase(resetInputs, (state, action) => {
      state.playbackData.inputs = action.payload.inputs;
    })
    .addCase(timerPause, (state, action) => {
      state.recordingStatus = RecordingStatus.paused;
      state.timeElapsedBeforePause += action.payload.timeNow - state.timeResumed;
    })
    .addCase(timerReset, (state, action) => {
      state.recordingStatus = RecordingStatus.notStarted;
      state.timeElapsedBeforePause = 0;
      state.timeResumed = 0;
    })
    .addCase(timerResume, (state, action) => {
      state.recordingStatus = RecordingStatus.recording;
      state.timeElapsedBeforePause =
        action.payload.timeBefore >= 0 ? action.payload.timeBefore : state.timeElapsedBeforePause;
      state.timeResumed = action.payload.timeNow;
    })
    .addCase(timerStart, (state, action) => {
      state.recordingStatus = RecordingStatus.recording;
      state.timeElapsedBeforePause = 0;
      state.timeResumed = action.payload.timeNow;
    })
    .addCase(timerStop, (state, action) => {
      state.recordingStatus = RecordingStatus.finished;
      state.timeElapsedBeforePause = 0;
      state.timeResumed = 0;
    });
});
