import { Reducer } from 'redux';
import { ActionType } from 'typesafe-actions';
import { ISourcereelWorkspace } from './states';

import * as actions from '../actions';
import {
  RECORD_INIT,
  RECORD_INPUT,
  RESET_INPUTS,
  TIMER_PAUSE,
  TIMER_RESET,
  TIMER_RESUME,
  TIMER_START,
  TIMER_STOP
} from '../actions/actionTypes';
import { RecordingStatus } from '../components/sourcecast/sourcecastShape';

export const reducer: Reducer<ISourcereelWorkspace> = (
  state: ISourcereelWorkspace,
  action: ActionType<typeof actions>
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
    case RESET_INPUTS:
      return {
        ...state,
        playbackData: {
          ...state.playbackData,
          inputs: action.payload.inputs
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
        timeElapsedBeforePause:
          action.payload.timeBefore >= 0 ? action.payload.timeBefore : state.timeElapsedBeforePause,
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
