import { PayloadAction } from "@reduxjs/toolkit";
import { CodeDelta, Input, PlaybackData, PlaybackStatus, SourcecastData } from "src/features/sourceRecorder/SourceRecorderTypes";

import { createActions } from "../../utils";
import { createPlaygroundSlice } from "../playground/PlaygroundBase";
import { defaultSourcecast } from "../WorkspaceReduxTypes";

const sagaActions = createActions('sourcecast', {
  fetchSourcecastIndex: 0,
})

const { actions: reducerActions, reducer: sourcecastReducer } = createPlaygroundSlice('sourcecast', defaultSourcecast, {
  saveSourcecastData: {
    prepare: (
      title: string,
      description: string,
      uid: string,
      audio: Blob,
      playbackData: PlaybackData,
    ) => ({
      payload: {
        title,
        description,
        uid,
        audio,
        audioUrl: window.URL.createObjectURL(audio),
        playbackData,
      }
    }),
    reducer(state, { payload }: PayloadAction<{
      title: string,
      description: string,
      uid: string,
      audio: Blob,
      audioUrl: string, // window.URL.createObjectURL(audio),
      playbackData: PlaybackData,
    }>) {
      state.audioUrl = payload.audioUrl
      state.description = payload.description
      state.title = payload.title
      state.playbackData = payload.playbackData
    }
  },
  setCurrentPlayerTime(state, { payload }: PayloadAction<number>) {
    state.currentPlayerTime = payload
  },
  setCodeDeltasToApply(state, { payload }: PayloadAction<CodeDelta[]>) {
    state.codeDeltasToApply = payload
  },
  setInputToApply(state, { payload }: PayloadAction<Input>) {
    state.inputToApply = payload
  },
  setSourcecastData: {
    prepare: (
      title: string,
      description: string,
      uid: string,
      audioUrl: string,
      playbackData: PlaybackData,
    ) => ({ payload: {
      title,
      description,
      uid,
      audioUrl,
      playbackData
    }}),
    reducer(state, { payload }: PayloadAction<{
      title: string,
      description: string,
      uid: string,
      audioUrl: string,
      playbackData: PlaybackData,
    }>) {
      state.title = payload.title
      state.description = payload.description
      state.uid = payload.uid
      state.audioUrl = payload.audioUrl
      state.playbackData = payload.playbackData
    }
  },
  setSourcecastPlaybackDuration(state, { payload }: PayloadAction<number>) {
    state.playbackDuration = payload
  },
  setSourcecastPlaybackStatus(state, { payload }: PayloadAction<PlaybackStatus>) {
    state.playbackStatus = payload
  },
  updateSourcecastIndex(state, { payload }: PayloadAction<SourcecastData[]>) {
    state.sourcecastIndex = payload
  }
})

export const sourcecastActions = {
  ...sagaActions,
  ...reducerActions,
}

export { sourcecastReducer }
