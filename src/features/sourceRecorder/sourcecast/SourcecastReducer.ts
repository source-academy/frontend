import { createReducer } from '@reduxjs/toolkit';
import { defaultWorkspaceManager } from 'src/commons/application/ApplicationTypes';

import {
  saveSourcecastData,
  setCodeDeltasToApply,
  setCurrentPlayerTime,
  setInputToApply,
  setSourcecastData,
  setSourcecastDuration,
  setSourcecastStatus
} from '../SourceRecorderActions';
import { updateSourcecastIndex } from './SourcecastActions';

export const SourcecastReducer = createReducer(defaultWorkspaceManager.sourcecast, builder => {
  builder
    .addCase(saveSourcecastData, (state, action) => {
      state.title = action.payload.title;
      state.description = action.payload.description;
      state.uid = action.payload.uid;
      state.audioUrl = action.payload.audioUrl;
      state.playbackData = action.payload.playbackData;
    })
    .addCase(setCurrentPlayerTime, (state, action) => {
      state.currentPlayerTime = action.payload.playerTime;
    })
    .addCase(setCodeDeltasToApply, (state, action) => {
      state.codeDeltasToApply = action.payload.deltas;
    })
    .addCase(setInputToApply, (state, action) => {
      state.inputToApply = action.payload.inputToApply;
    })
    .addCase(setSourcecastData, (state, action) => {
      state.title = action.payload.title;
      state.description = action.payload.description;
      state.uid = action.payload.uid;
      state.audioUrl = action.payload.audioUrl;
      state.playbackData = action.payload.playbackData;
    })
    .addCase(setSourcecastDuration, (state, action) => {
      state.playbackDuration = action.payload.duration;
    })
    .addCase(setSourcecastStatus, (state, action) => {
      state.playbackStatus = action.payload.playbackStatus;
    })
    .addCase(updateSourcecastIndex, (state, action) => {
      state.sourcecastIndex = action.payload.index;
    });
});
