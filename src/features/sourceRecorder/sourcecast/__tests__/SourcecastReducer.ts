import { Chapter } from 'js-slang/dist/types';
import { action as generateAction } from 'typesafe-actions';

import { defaultWorkspaceManager } from '../../../../commons/application/ApplicationTypes';
import { ExternalLibraryName } from '../../../../commons/application/types/ExternalTypes';
import {
  CodeDelta,
  Input,
  PlaybackData,
  PlaybackStatus,
  SAVE_SOURCECAST_DATA,
  SET_CODE_DELTAS_TO_APPLY,
  SET_INPUT_TO_APPLY,
  SET_SOURCECAST_DATA,
  SET_SOURCECAST_PLAYBACK_DURATION,
  SET_SOURCECAST_PLAYBACK_STATUS,
  SourcecastData
} from '../../SourceRecorderTypes';
import { SourcecastReducer } from '../SourcecastReducer';
import { UPDATE_SOURCECAST_INDEX } from '../SourcecastTypes';

describe('SAVE_SOURCECAST_DATA', () => {
  test('saves sourcecastData correctly', () => {
    const codeDelta: CodeDelta = {
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
    const playbackData: PlaybackData = {
      init: {
        chapter: Chapter.SOURCE_1,
        externalLibrary: ExternalLibraryName.NONE,
        editorValue: ''
      },
      inputs: [input]
    };

    const payload = {
      title: 'Test Title',
      description: 'Test Description',
      uid: 'unique_id',
      audioUrl: 'someUrl.com',
      playbackData,
      workspaceLocation: undefined!,
      audio: undefined!
    };

    const action = generateAction(SAVE_SOURCECAST_DATA, payload);
    const result = SourcecastReducer(defaultWorkspaceManager.sourcecast, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcecast,
      ...payload
    });
  });
});

describe('SET_CODE_DELTAS_TO_APPLY', () => {
  test('sets codeDeltasToApply correctly', () => {
    const deltas: CodeDelta[] = [
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
    const action = generateAction(SET_CODE_DELTAS_TO_APPLY, {
      deltas,
      workspaceLocation: undefined!
    });
    const result = SourcecastReducer(defaultWorkspaceManager.sourcecast, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcecast,
      codeDeltasToApply: deltas
    });
  });
});

describe('SET_INPUT_TO_APPLY', () => {
  test('sets inputToApply correctly', () => {
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

    const inputToApply: Input = {
      time: 0,
      type: 'codeDelta',
      data: delta
    };

    const action = generateAction(SET_INPUT_TO_APPLY, {
      inputToApply,
      workspaceLocation: undefined!
    });
    const result = SourcecastReducer(defaultWorkspaceManager.sourcecast, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcecast,
      inputToApply
    });
  });
});

describe('SET_SOURCECAST_DATA', () => {
  test('sets sourcecastData correctly', () => {
    const codeDelta: CodeDelta = {
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
    const playbackData: PlaybackData = {
      init: {
        chapter: Chapter.SOURCE_1,
        externalLibrary: ExternalLibraryName.NONE,
        editorValue: ''
      },
      inputs: [input]
    };

    const payload = {
      title: 'Test Title',
      description: 'Test Description',
      uid: 'unique_id',
      audioUrl: 'fakeAudioUrl.com/audio.mp3',
      playbackData,
      workspaceLocation: undefined!
    };

    const action = generateAction(SET_SOURCECAST_DATA, payload);

    const result = SourcecastReducer(defaultWorkspaceManager.sourcecast, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcecast,
      ...payload
    });
  });
});

describe('SET_SOURCECAST_PLAYBACK_DURATION', () => {
  test('sets sourcecastPlaybackDuration correctly', () => {
    const duration = 5;
    const action = generateAction(SET_SOURCECAST_PLAYBACK_DURATION, {
      duration,
      workspaceLocation: undefined!
    });

    const result = SourcecastReducer(defaultWorkspaceManager.sourcecast, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcecast,
      playbackDuration: duration
    });
  });
});

describe('SET_SOURCECAST_PLAYBACK_STATUS', () => {
  test('sets sourcecastPlaybackStatus correctly', () => {
    const playbackStatus = PlaybackStatus.paused;
    const action = generateAction(SET_SOURCECAST_PLAYBACK_STATUS, {
      playbackStatus,
      workspaceLocation: undefined!
    });

    const result = SourcecastReducer(defaultWorkspaceManager.sourcecast, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcecast,
      playbackStatus
    });
  });
});

describe('UPDATE_SOURCECAST_INDEX', () => {
  test('updates sourcecastIndex correctly', () => {
    const sourcecastData: SourcecastData[] = [
      {
        title: 'Test Title',
        description: 'Test Description',
        uid: 'unique_uid',
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

    const action = generateAction(UPDATE_SOURCECAST_INDEX, {
      index: sourcecastData,
      workspaceLocation: undefined!
    });

    const result = SourcecastReducer(defaultWorkspaceManager.sourcecast, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcecast,
      sourcecastIndex: sourcecastData
    });
  });
});
