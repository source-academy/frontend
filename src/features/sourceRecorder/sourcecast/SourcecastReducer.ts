import { createReducer } from '@reduxjs/toolkit';
import { defaultWorkspaceManager } from 'src/commons/application/ApplicationTypes';

import * as SourceRecorderActions from '../SourceRecorderActions';
import { updateSourcecastIndex } from './SourcecastActions';

export const SourcecastReducer = createReducer(defaultWorkspaceManager.sourcecast, builder => {
  builder
    .addCase(SourceRecorderActions.saveSourcecastData, (state, action) => {
      state.title = action.payload.title;
      state.description = action.payload.description;
      state.uid = action.payload.uid;
      state.audioUrl = action.payload.audioUrl;
      state.playbackData = action.payload.playbackData;
    })
    .addCase(SourceRecorderActions.setCurrentPlayerTime, (state, action) => {
      state.currentPlayerTime = action.payload.playerTime;
    })
    .addCase(SourceRecorderActions.setCodeDeltasToApply, (state, action) => {
      state.codeDeltasToApply = action.payload.deltas;
    })
    .addCase(SourceRecorderActions.setInputToApply, (state, action) => {
      state.inputToApply = action.payload.inputToApply;
    })
    .addCase(SourceRecorderActions.setSourcecastData, (state, action) => {
      state.title = action.payload.title;
      state.description = action.payload.description;
      state.uid = action.payload.uid;
      state.audioUrl = action.payload.audioUrl;
      state.playbackData = action.payload.playbackData;
    })
    .addCase(SourceRecorderActions.setSourcecastDuration, (state, action) => {
      state.playbackDuration = action.payload.duration;
    })
    .addCase(SourceRecorderActions.setSourcecastStatus, (state, action) => {
      state.playbackStatus = action.payload.playbackStatus;
    })
    .addCase(updateSourcecastIndex, (state, action) => {
      state.sourcecastIndex = action.payload.index;
    });
});
