import { Chapter } from 'js-slang/dist/types';

import { ExternalLibraryName } from '../../../../commons/application/types/ExternalTypes';
import { WorkspaceLocation } from '../../../../commons/workspace/WorkspaceTypes';
import { CodeDelta, Input, PlaybackData } from '../../SourceRecorderTypes';
import {
  recordInit,
  recordInput,
  timerPause,
  timerReset,
  timerResume,
  timerStart,
  timerStop
} from '../SourcereelActions';
import {
  RECORD_INIT,
  RECORD_INPUT,
  TIMER_PAUSE,
  TIMER_RESET,
  TIMER_RESUME,
  TIMER_START,
  TIMER_STOP
} from '../SourcereelTypes';

const sourcereelWorkspace: WorkspaceLocation = 'sourcereel';

function dateIsCloseEnough(dateA: number, dateB: number) {
  return Math.abs(dateA - dateB) <= 1000;
}

test('recordInit generates correct action object', () => {
  const initData: PlaybackData['init'] = {
    editorValue: 'Init Value',
    chapter: Chapter.SOURCE_1,
    externalLibrary: ExternalLibraryName.NONE
  };
  const action = recordInit(initData, sourcereelWorkspace);
  expect(action).toEqual({
    type: RECORD_INIT,
    payload: {
      initData,
      workspaceLocation: sourcereelWorkspace
    }
  });
});

test('recordInput generates correct action object', () => {
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
  const action = recordInput(input, sourcereelWorkspace);
  expect(action).toEqual({
    type: RECORD_INPUT,
    payload: {
      input,
      workspaceLocation: sourcereelWorkspace
    }
  });
});

test('timerPause generates correct action object', () => {
  const currentTime = Date.now();
  const action = timerPause(sourcereelWorkspace);
  expect(action.type).toEqual(TIMER_PAUSE);
  expect(action.payload.workspaceLocation).toEqual(sourcereelWorkspace);
  expect(dateIsCloseEnough(currentTime, action.payload.timeNow)).toBeTruthy();
});

test('timerReset generates correct action object', () => {
  const action = timerReset(sourcereelWorkspace);
  expect(action).toEqual({
    type: TIMER_RESET,
    payload: { workspaceLocation: sourcereelWorkspace }
  });
});

test('timerResume generates correct action object', () => {
  const currentTime = Date.now();
  const action = timerResume(1000, sourcereelWorkspace);
  expect(action.type).toEqual(TIMER_RESUME);
  expect(action.payload.workspaceLocation).toEqual(sourcereelWorkspace);
  expect(dateIsCloseEnough(currentTime, action.payload.timeNow)).toBeTruthy();
});

test('timerStart generates correct action object', () => {
  const currentTime = Date.now();
  const action = timerStart(sourcereelWorkspace);
  expect(action.type).toEqual(TIMER_START);
  expect(action.payload.workspaceLocation).toEqual(sourcereelWorkspace);
  expect(dateIsCloseEnough(currentTime, action.payload.timeNow)).toBeTruthy();
});

test('timerStop generates correct action object', () => {
  const currentTime = Date.now();
  const action = timerStop(sourcereelWorkspace);
  expect(action.type).toEqual(TIMER_STOP);
  expect(action.payload.workspaceLocation).toEqual(sourcereelWorkspace);
  expect(dateIsCloseEnough(currentTime, action.payload.timeNow)).toBeTruthy();
});
