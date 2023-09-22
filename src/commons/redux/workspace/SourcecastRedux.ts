import { PayloadAction } from "@reduxjs/toolkit";
import { Chapter } from "js-slang/dist/types";
import { CodeDelta, Input, PlaybackData, PlaybackStatus, SourcecastData } from "src/features/sourceRecorder/SourceRecorderTypes";

import { ExternalLibraryName } from "../../application/types/ExternalTypes";
import { createWorkspaceSlice, getDefaultWorkspaceState,WorkspaceState } from "./WorkspaceRedux";

export type SourcecastWorkspaceState = WorkspaceState & {
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
}

export const defaultSourcecast: SourcecastWorkspaceState = {
  ...getDefaultWorkspaceState(),
  audioUrl: '',
  codeDeltasToApply: null,
  currentPlayerTime: 0,
  description: null,
  inputToApply: null,
  playbackData: {
    init: {
      editorValue: '',
      chapter: Chapter.SOURCE_1,
      externalLibrary: ExternalLibraryName.NONE
    },
    inputs: []
  },
  playbackDuration: 0,
  playbackStatus: PlaybackStatus.paused,
  sourcecastIndex: null,
  title: null,
  uid: null
}

export const { actions: sourcecastActions, reducer: sourcecastReducer } = createWorkspaceSlice('sourcecast', defaultSourcecast, {
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
