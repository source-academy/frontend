import { Reducer } from 'redux';
import { ISourcereelWorkspace } from './states';

import {
  IAction,
  RECORD_EDITOR_INIT_VALUE,
  RECORD_INPUT,
  SAVE_SOURCECAST_DATA,
  TIMER_PAUSE,
  TIMER_RESET,
  TIMER_RESUME,
  TIMER_START,
  TIMER_STOP
} from '../actions/actionTypes';
import { RecordingStatus } from '../components/sourcecast/sourcecastShape';

export const reducer: Reducer<ISourcereelWorkspace> = (
  state: ISourcereelWorkspace,
  action: IAction
) => {
  switch (action.type) {
    case RECORD_EDITOR_INIT_VALUE:
      return {
        ...state,
        playbackData: {
          init: {
            editorValue: action.payload.editorValue
          },
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
    case SAVE_SOURCECAST_DATA:
      return {
        ...state,
        title: action.payload.title,
        description: action.payload.description,
        audioUrl: action.payload.audioUrl,
        playbackData: action.payload.playbackData
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
