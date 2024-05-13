import { createAction } from '@reduxjs/toolkit';
import { Chapter } from 'js-slang/dist/types';
import { SourceActionType } from 'src/commons/utils/ActionsHelper';

import { defaultWorkspaceManager } from '../../../../commons/application/ApplicationTypes';
import { ExternalLibraryName } from '../../../../commons/application/types/ExternalTypes';
import {
  saveSourcecastData,
  setCodeDeltasToApply,
  setInputToApply,
  setSourcecastData,
  setSourcecastDuration,
  setSourcecastStatus
} from '../../SourceRecorderActions';
import {
  CodeDelta,
  Input,
  PlaybackData,
  PlaybackStatus,
  SourcecastData
} from '../../SourceRecorderTypes';
import { updateSourcecastIndex } from '../SourcecastActions';
import { SourcecastReducer } from '../SourcecastReducer';

const generateAction = <T, S extends SourceActionType['type']>(type: S, payload: T) =>
  createAction(type, (payload: T) => ({ payload }))(payload);

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

    const action = generateAction(saveSourcecastData.type, payload);
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
    const action = generateAction(setCodeDeltasToApply.type, {
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

    const action = generateAction(setInputToApply.type, {
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

    const action = generateAction(setSourcecastData.type, payload);

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
    const action = generateAction(setSourcecastDuration.type, {
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
    const action = generateAction(setSourcecastStatus.type, {
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

    const action = generateAction(updateSourcecastIndex.type, {
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
