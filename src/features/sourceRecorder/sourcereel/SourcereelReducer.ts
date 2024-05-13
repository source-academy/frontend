import { createReducer } from '@reduxjs/toolkit';
import { defaultWorkspaceManager } from 'src/commons/application/ApplicationTypes';

import { RecordingStatus } from '../SourceRecorderTypes';
import SourcereelActions from './SourcereelActions';

export const SourcereelReducer = createReducer(defaultWorkspaceManager.sourcereel, builder => {
  builder
    .addCase(SourcereelActions.recordInit, (state, action) => {
      state.playbackData.init = action.payload.initData;
      state.playbackData.inputs = [];
    })
    .addCase(SourcereelActions.recordInput, (state, action) => {
      state.playbackData.inputs.push(action.payload.input);
    })
    .addCase(SourcereelActions.resetInputs, (state, action) => {
      state.playbackData.inputs = action.payload.inputs;
    })
    .addCase(SourcereelActions.timerPause, (state, action) => {
      state.recordingStatus = RecordingStatus.paused;
      state.timeElapsedBeforePause += action.payload.timeNow - state.timeResumed;
    })
    .addCase(SourcereelActions.timerReset, (state, action) => {
      state.recordingStatus = RecordingStatus.notStarted;
      state.timeElapsedBeforePause = 0;
      state.timeResumed = 0;
    })
    .addCase(SourcereelActions.timerResume, (state, action) => {
      state.recordingStatus = RecordingStatus.recording;
      state.timeElapsedBeforePause =
        action.payload.timeBefore >= 0 ? action.payload.timeBefore : state.timeElapsedBeforePause;
      state.timeResumed = action.payload.timeNow;
    })
    .addCase(SourcereelActions.timerStart, (state, action) => {
      state.recordingStatus = RecordingStatus.recording;
      state.timeElapsedBeforePause = 0;
      state.timeResumed = action.payload.timeNow;
    })
    .addCase(SourcereelActions.timerStop, (state, action) => {
      state.recordingStatus = RecordingStatus.finished;
      state.timeElapsedBeforePause = 0;
      state.timeResumed = 0;
    });
});
