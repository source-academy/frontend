import { createAction } from '@reduxjs/toolkit';
import { Chapter } from 'js-slang/dist/langs';
import { describe, expect, it } from 'vitest';

import { defaultWorkspaceManager } from 'src/commons/application/ApplicationTypes';
import { ExternalLibraryName } from 'src/commons/application/types/ExternalTypes';
import type { SourceActionType } from 'src/commons/utils/ActionsHelper';
import {
  RecordingStatus,
  type CodeDelta,
  type Input,
  type PlaybackData
} from '../../SourceRecorderTypes';
import SourcereelActions from '../SourcereelActions';
import { SourcereelReducer } from '../SourcereelReducer';

const generateAction = <T, S extends SourceActionType['type']>(type: S, payload: T) =>
  createAction(type, (payload: T) => ({ payload }))(payload);

describe(SourcereelActions.recordInit.type, () => {
  it('records editorInitValue correctly', () => {
    const initData: PlaybackData['init'] = {
      editorValue: 'test init value',
      chapter: Chapter.SOURCE_1,
      externalLibrary: ExternalLibraryName.NONE
    };
    const action = generateAction(SourcereelActions.recordInit.type, {
      initData,
      workspaceLocation: undefined!
    });
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

describe(SourcereelActions.recordInput.type, () => {
  it('records input correctly', () => {
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

    const action = generateAction(SourcereelActions.recordInput.type, {
      input,
      workspaceLocation: undefined!
    });
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

describe(SourcereelActions.timerPause.type, () => {
  it('pauses timer correctly', () => {
    const timeNow = 123456;
    const action = generateAction(SourcereelActions.timerPause.type, {
      timeNow,
      workspaceLocation: undefined!
    });
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

describe(SourcereelActions.timerReset.type, () => {
  it('pauses timer correctly', () => {
    const action = generateAction(SourcereelActions.timerReset.type, {
      workspaceLocation: undefined!
    });
    const result = SourcereelReducer(defaultWorkspaceManager.sourcereel, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcereel,
      recordingStatus: RecordingStatus.notStarted,
      timeElapsedBeforePause: 0,
      timeResumed: 0
    });
  });
});

describe(SourcereelActions.timerResume.type, () => {
  it('resumes timer correctly', () => {
    const timeNow = 123456;
    const action = generateAction(SourcereelActions.timerResume.type, {
      timeNow,
      workspaceLocation: undefined!,
      timeBefore: 0
    });
    const result = SourcereelReducer(defaultWorkspaceManager.sourcereel, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcereel,
      recordingStatus: RecordingStatus.recording,
      timeResumed: timeNow
    });
  });
});

describe(SourcereelActions.timerStart.type, () => {
  it('starts timer correctly', () => {
    const timeNow = 123456;
    const action = generateAction(SourcereelActions.timerStart.type, {
      timeNow,
      workspaceLocation: undefined!
    });
    const result = SourcereelReducer(defaultWorkspaceManager.sourcereel, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcereel,
      recordingStatus: RecordingStatus.recording,
      timeResumed: timeNow,
      timeElapsedBeforePause: 0
    });
  });
});

describe(SourcereelActions.timerStop.type, () => {
  it('stops timer correctly', () => {
    const timeNow = 123456;
    const action = generateAction(SourcereelActions.timerStop.type, {
      timeNow,
      workspaceLocation: undefined!
    });
    const result = SourcereelReducer(defaultWorkspaceManager.sourcereel, action);
    expect(result).toEqual({
      ...defaultWorkspaceManager.sourcereel,
      recordingStatus: RecordingStatus.finished,
      timeResumed: 0,
      timeElapsedBeforePause: 0
    });
  });
});
