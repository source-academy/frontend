import { defaultWorkspaceManager } from '../../../../commons/application/ApplicationTypes';
import { ExternalLibraryNames } from '../../../../commons/application/types/ExternalTypes';
import { CodeDelta, Input, PlaybackData, RecordingStatus } from '../../SourceRecorderTypes';
import { SourcereelReducer } from '../SourcereelReducer';
import {
  RECORD_INIT,
  RECORD_INPUT,
  TIMER_PAUSE,
  TIMER_RESET,
  TIMER_RESUME,
  TIMER_START,
  TIMER_STOP
} from '../SourcereelTypes';

function generateAction(type: string, payload: any = {}) {
  return {
    type,
    payload
  };
}

describe('RECORD_INIT', () => {
  test('records editorInitValue correctly', () => {
    const initData: PlaybackData['init'] = {
      editorValue: 'test init value',
      chapter: 1,
      externalLibrary: ExternalLibraryNames.NONE
    };
    const action = generateAction(RECORD_INIT, { initData });
    const result = SourcereelReducer(defaultWorkspaceManager.sourcereel, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcereel,
      playbackData: {
        ...defaultWorkspaceManager.sourcereel.playbackData,
        init: initData
      }
    });
  });
});

describe('RECORD_INPUT', () => {
  test('records input correctly', () => {
    const delta: CodeDelta = {
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

    const action = generateAction(RECORD_INPUT, { input });
    const result = SourcereelReducer(defaultWorkspaceManager.sourcereel, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcereel,
      playbackData: {
        ...defaultWorkspaceManager.sourcereel.playbackData,
        inputs: [...defaultWorkspaceManager.sourcereel.playbackData.inputs, input]
      }
    });
  });
});

describe('TIMER_PAUSE', () => {
  test('pauses timer correctly', () => {
    const timeNow = 123456;
    const action = generateAction(TIMER_PAUSE, { timeNow });
    const result = SourcereelReducer(defaultWorkspaceManager.sourcereel, action);
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
    const action = generateAction(TIMER_RESET, {});
    const result = SourcereelReducer(defaultWorkspaceManager.sourcereel, action);
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
    const action = generateAction(TIMER_RESUME, { timeNow });
    const result = SourcereelReducer(defaultWorkspaceManager.sourcereel, action);
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
    const action = generateAction(TIMER_START, { timeNow });
    const result = SourcereelReducer(defaultWorkspaceManager.sourcereel, action);
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
    const action = generateAction(TIMER_STOP, { timeNow });
    const result = SourcereelReducer(defaultWorkspaceManager.sourcereel, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcereel,
      recordingStatus: RecordingStatus.finished,
      timeResumed: 0,
      timeElapsedBeforePause: 0
    });
  });
});
