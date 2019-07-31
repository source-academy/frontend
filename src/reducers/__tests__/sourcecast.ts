import {
  IAction,
  SAVE_SOURCECAST_DATA,
  SET_CODE_DELTAS_TO_APPLY,
  SET_INPUT_TO_APPLY,
  SET_SOURCECAST_DATA,
  SET_SOURCECAST_PLAYBACK_DURATION,
  SET_SOURCECAST_PLAYBACK_STATUS,
  UPDATE_SOURCECAST_INDEX
} from '../../actions/actionTypes';
import {
  ICodeDelta,
  Input,
  IPlaybackData,
  ISourcecastData,
  PlaybackStatus
} from '../../components/sourcecast/sourcecastShape';
import { reducer } from '../sourcecast';
import { defaultWorkspaceManager } from '../states';

function generateAction(type: string, payload: any = {}): IAction {
  return {
    type,
    payload
  };
}

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
    const result = reducer(defaultWorkspaceManager.sourcecast, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcereel,
      ...payload
    });
  });
});

describe('SET_CODE_DELTAS_TO_APPLY', () => {
  test('sets codeDeltasToApply correctly', () => {
    const deltas: ICodeDelta[] = [
      {
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
      },
      {
        start: {
          row: 0,
          column: 2
        },
        end: {
          row: 0,
          column: 3
        },
        action: 'insert',
        lines: ['b']
      }
    ];
    const action: IAction = generateAction(SET_CODE_DELTAS_TO_APPLY, { deltas });
    const result = reducer(defaultWorkspaceManager.sourcecast, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcecast,
      codeDeltasToApply: deltas
    });
  });
});

describe('SET_INPUT_TO_APPLY', () => {
  test('sets inputToApply correctly', () => {
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

    const inputToApply: Input = {
      time: 0,
      type: 'codeDelta',
      data: delta
    };

    const action: IAction = generateAction(SET_INPUT_TO_APPLY, { inputToApply });
    const result = reducer(defaultWorkspaceManager.sourcecast, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcecast,
      inputToApply
    });
  });
});

describe('SET_SOURCECAST_DATA', () => {
  test('sets sourcecastData correctly', () => {
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
      audioUrl: 'fakeAudioUrl.com/audio.mp3',
      playbackData
    };

    const action: IAction = generateAction(SET_SOURCECAST_DATA, payload);

    const result = reducer(defaultWorkspaceManager.sourcecast, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcecast,
      ...payload
    });
  });
});

describe('SET_SOURCECAST_PLAYBACK_DURATION', () => {
  test('sets sourcecastPlaybackDuration correctly', () => {
    const duration = 5;
    const action: IAction = generateAction(SET_SOURCECAST_PLAYBACK_DURATION, { duration });

    const result = reducer(defaultWorkspaceManager.sourcecast, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcecast,
      playbackDuration: duration
    });
  });
});

describe('SET_SOURCECAST_PLAYBACK_STATUS', () => {
  test('sets sourcecastPlaybackStatus correctly', () => {
    const playbackStatus = PlaybackStatus.paused;
    const action: IAction = generateAction(SET_SOURCECAST_PLAYBACK_STATUS, { playbackStatus });

    const result = reducer(defaultWorkspaceManager.sourcecast, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcecast,
      playbackStatus
    });
  });
});

describe('UPDATE_SOURCECAST_INDEX', () => {
  test('updates sourcecastIndex correctly', () => {
    const sourcecastData: ISourcecastData[] = [
      {
        title: 'Test Title',
        description: 'Test Description',
        inserted_at: '2019-07-17T15:54:57',
        updated_at: '2019-07-17T15:54:57',
        playbackData: '{}',
        id: 1,
        uploader: {
          id: 2,
          name: 'Tester'
        },
        url: 'testurl.com'
      }
    ];

    const action: IAction = generateAction(UPDATE_SOURCECAST_INDEX, {
      index: sourcecastData
    });

    const result = reducer(defaultWorkspaceManager.sourcecast, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcecast,
      sourcecastIndex: sourcecastData
    });
  });
});
