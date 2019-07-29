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
} from '../../actions/actionTypes';
import {
  ICodeDelta,
  Input,
  IPlaybackData,
  RecordingStatus
} from '../../components/sourcecast/sourcecastShape';
import { reducer } from '../sourcereel';
import { defaultWorkspaceManager } from '../states';

function generateAction(type: string, payload: any = {}): IAction {
  return {
    type,
    payload
  };
}

describe('RECORD_EDITOR_INIT_VALUE', () => {
  test('records editorInitValue correctly', () => {
    const editorValue = 'test init value';
    const action: IAction = generateAction(RECORD_EDITOR_INIT_VALUE, { editorValue });
    const result = reducer(defaultWorkspaceManager.sourcereel, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcereel,
      playbackData: {
        ...defaultWorkspaceManager.sourcereel.playbackData,
        init: {
          ...defaultWorkspaceManager.sourcereel.playbackData.init,
          editorValue
        }
      }
    });
  });
});

describe('RECORD_INPUT', () => {
  test('records input correctly', () => {
    const delta: ICodeDelta = {
      start: {
        row: 0,
        column: 1
      },
      end: {
        row: 0,
        column: 2
      },
      action: 'insert',
      lines: ['a']
    };

    const input: Input = {
      time: 0,
      type: 'codeDelta',
      data: delta
    };

    const action: IAction = generateAction(RECORD_INPUT, { input });
    const result = reducer(defaultWorkspaceManager.sourcereel, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcereel,
      playbackData: {
        ...defaultWorkspaceManager.sourcereel.playbackData,
        inputs: [...defaultWorkspaceManager.sourcereel.playbackData.inputs, input]
      }
    });
  });
});

describe('SAVE_SOURCECAST_DATA', () => {
  test('saves sourcecastData correctly', () => {
    const codeDelta: ICodeDelta = {
      start: {
        row: 0,
        column: 1
      },
      end: {
        row: 0,
        column: 2
      },
      action: 'insert',
      lines: ['a']
    };
    const input: Input = {
      time: 1,
      type: 'codeDelta',
      data: codeDelta
    };
    const playbackData: IPlaybackData = {
      init: {
        editorValue: ''
      },
      inputs: [input]
    };

    const payload = {
      title: 'Test Title',
      description: 'Test Description',
      audioUrl: 'someUrl.com',
      playbackData
    };

    const action: IAction = generateAction(SAVE_SOURCECAST_DATA, payload);
    const result = reducer(defaultWorkspaceManager.sourcereel, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcereel,
      ...payload
    });
  });
});

describe('TIMER_PAUSE', () => {
  test('pauses timer correctly', () => {
    const timeNow = 123456;
    const action: IAction = generateAction(TIMER_PAUSE, { timeNow });
    const result = reducer(defaultWorkspaceManager.sourcereel, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcereel,
      recordingStatus: RecordingStatus.paused,
      timeElapsedBeforePause:
        defaultWorkspaceManager.sourcereel.timeElapsedBeforePause +
        timeNow -
        defaultWorkspaceManager.sourcereel.timeResumed
    });
  });
});

describe('TIMER_RESET', () => {
  test('pauses timer correctly', () => {
    const action: IAction = generateAction(TIMER_RESET, {});
    const result = reducer(defaultWorkspaceManager.sourcereel, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcereel,
      recordingStatus: RecordingStatus.notStarted,
      timeElapsedBeforePause: 0,
      timeResumed: 0
    });
  });
});

describe('TIMER_RESUME', () => {
  test('pauses timer correctly', () => {
    const timeNow = 123456;
    const action: IAction = generateAction(TIMER_RESUME, { timeNow });
    const result = reducer(defaultWorkspaceManager.sourcereel, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcereel,
      recordingStatus: RecordingStatus.recording,
      timeResumed: timeNow
    });
  });
});

describe('TIMER_START', () => {
  test('pauses timer correctly', () => {
    const timeNow = 123456;
    const action: IAction = generateAction(TIMER_START, { timeNow });
    const result = reducer(defaultWorkspaceManager.sourcereel, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcereel,
      recordingStatus: RecordingStatus.recording,
      timeResumed: timeNow,
      timeElapsedBeforePause: 0
    });
  });
});

describe('TIMER_STOP', () => {
  test('pauses timer correctly', () => {
    const timeNow = 123456;
    const action: IAction = generateAction(TIMER_STOP, { timeNow });
    const result = reducer(defaultWorkspaceManager.sourcereel, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcereel,
      recordingStatus: RecordingStatus.finished,
      timeResumed: 0,
      timeElapsedBeforePause: 0
    });
  });
});
