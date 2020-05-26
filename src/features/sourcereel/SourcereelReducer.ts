import { Reducer } from 'redux';
import { ISourcereelWorkspace } from 'src/commons/application/ApplicationTypes';

import {
  RECORD_INIT,
  RECORD_INPUT,
  TIMER_PAUSE,
  TIMER_RESET,
  TIMER_RESUME,
  TIMER_START,
  TIMER_STOP
} from 'src/commons/application/types/ActionTypes';
import { RecordingStatus } from 'src/features/sourcecast/SourcecastTypes';
import { SourceActionType } from 'src/utils/actionsHelper';

export const SourcereelReducer: Reducer<ISourcereelWorkspace> = (
  state: ISourcereelWorkspace,
  action: SourceActionType
) => {
  switch (action.type) {
    case RECORD_INIT:
      return {
        ...state,
        playbackData: {
          init: action.payload.initData,
          inputs: []
        }
      };
    case RECORD_INPUT:
      return {
        ...state,
        playbackData: {
          ...state.playbackData,
          inputs: [...state.playbackData.inputs, action.payload.input]
        }
      };
    case TIMER_PAUSE:
      return {
        ...state,
        recordingStatus: RecordingStatus.paused,
        timeElapsedBeforePause:
          state.timeElapsedBeforePause + action.payload.timeNow - state.timeResumed
      };
    case TIMER_RESET:
      return {
        ...state,
        recordingStatus: RecordingStatus.notStarted,
        timeElapsedBeforePause: 0,
        timeResumed: 0
      };
    case TIMER_RESUME:
      return {
        ...state,
        recordingStatus: RecordingStatus.recording,
        timeResumed: action.payload.timeNow
      };
    case TIMER_START:
      return {
        ...state,
        recordingStatus: RecordingStatus.recording,
        timeElapsedBeforePause: 0,
        timeResumed: action.payload.timeNow
      };
    case TIMER_STOP:
      return {
        ...state,
        recordingStatus: RecordingStatus.finished,
        timeElapsedBeforePause: 0,
        timeResumed: 0
      };
    default:
      return state;
  }
};
