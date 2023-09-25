import { PayloadAction } from '@reduxjs/toolkit';
import {
  Input,
  PlaybackData,
  RecordingStatus
} from 'src/features/sourceRecorder/SourceRecorderTypes';

import { createActions } from '../../utils';
import { createPlaygroundSlice } from '../playground/PlaygroundBase';
import { defaultSourcereel } from '../WorkspaceReduxTypes';

const sagaActions = createActions('sourcereel', {
  deleteSourcecastEntry: (id: number) => id
});

const { actions: reducerActions, reducer: sourcereelReducer } = createPlaygroundSlice(
  'sourcereel',
  defaultSourcereel,
  {
    recordInit(state, { payload }: PayloadAction<PlaybackData['init']>) {
      state.playbackData = {
        init: payload,
        inputs: []
      };
    },
    recordInput(state, { payload }: PayloadAction<Input>) {
      state.playbackData.inputs.push(payload);
    },
    resetInputs(state, { payload }: PayloadAction<Input[]>) {
      state.playbackData.inputs = payload;
    },
    timerPause: {
      prepare: () => ({ payload: Date.now() }),
      reducer(state, { payload }: PayloadAction<number>) {
        state.recordingStatus = RecordingStatus.paused;
        state.timeElapsedBeforePause = state.timeElapsedBeforePause + payload - state.timeResumed;
      }
    },
    timerReset(state) {
      state.recordingStatus = RecordingStatus.notStarted;
      state.timeElapsedBeforePause = 0;
      state.timeResumed = 0;
    },
    timerResume: {
      prepare: (timeBefore: number) => ({ payload: { timeNow: Date.now(), timeBefore } }),
      reducer(
        state,
        {
          payload: { timeNow, timeBefore }
        }: PayloadAction<Record<'timeNow' | 'timeBefore', number>>
      ) {
        state.recordingStatus = RecordingStatus.recording;
        state.timeElapsedBeforePause = timeBefore >= 0 ? timeBefore : state.timeElapsedBeforePause;
        state.timeResumed = timeNow;
      }
    },
    timerStart: {
      prepare: () => ({ payload: Date.now() }),
      reducer(state, { payload: timeNow }: PayloadAction<number>) {
        state.recordingStatus = RecordingStatus.recording;
        state.timeElapsedBeforePause = 0;
        state.timeResumed = timeNow;
      }
    },
    timerStop(state) {
      state.recordingStatus = RecordingStatus.finished;
      state.timeElapsedBeforePause = 0;
      state.timeResumed = 0;
    }
  }
);

export const sourcereelActions = {
  ...reducerActions,
  ...sagaActions
};

export { sourcereelReducer };
