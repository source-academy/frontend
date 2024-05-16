import { Chapter } from 'js-slang/dist/types';

import { ExternalLibraryName } from '../../../../commons/application/types/ExternalTypes';
import { WorkspaceLocation } from '../../../../commons/workspace/WorkspaceTypes';
import { CodeDelta, Input, PlaybackData } from '../../SourceRecorderTypes';
import SourcereelActions from '../SourcereelActions';

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
  const action = SourcereelActions.recordInit(initData, sourcereelWorkspace);
  expect(action).toEqual({
    type: SourcereelActions.recordInit.type,
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
  const action = SourcereelActions.recordInput(input, sourcereelWorkspace);
  expect(action).toEqual({
    type: SourcereelActions.recordInput.type,
    payload: {
      input,
      workspaceLocation: sourcereelWorkspace
    }
  });
});

test('timerPause generates correct action object', () => {
  const currentTime = Date.now();
  const action = SourcereelActions.timerPause(sourcereelWorkspace);
  expect(action.type).toEqual(SourcereelActions.timerPause.type);
  expect(action.payload.workspaceLocation).toEqual(sourcereelWorkspace);
  expect(dateIsCloseEnough(currentTime, action.payload.timeNow)).toBeTruthy();
});

test('timerReset generates correct action object', () => {
  const action = SourcereelActions.timerReset(sourcereelWorkspace);
  expect(action).toEqual({
    type: SourcereelActions.timerReset.type,
    payload: { workspaceLocation: sourcereelWorkspace }
  });
});

test('timerResume generates correct action object', () => {
  const currentTime = Date.now();
  const action = SourcereelActions.timerResume(1000, sourcereelWorkspace);
  expect(action.type).toEqual(SourcereelActions.timerResume.type);
  expect(action.payload.workspaceLocation).toEqual(sourcereelWorkspace);
  expect(dateIsCloseEnough(currentTime, action.payload.timeNow)).toBeTruthy();
});

test('timerStart generates correct action object', () => {
  const currentTime = Date.now();
  const action = SourcereelActions.timerStart(sourcereelWorkspace);
  expect(action.type).toEqual(SourcereelActions.timerStart.type);
  expect(action.payload.workspaceLocation).toEqual(sourcereelWorkspace);
  expect(dateIsCloseEnough(currentTime, action.payload.timeNow)).toBeTruthy();
});

test('timerStop generates correct action object', () => {
  const currentTime = Date.now();
  const action = SourcereelActions.timerStop(sourcereelWorkspace);
  expect(action.type).toEqual(SourcereelActions.timerStop.type);
  expect(action.payload.workspaceLocation).toEqual(sourcereelWorkspace);
  expect(dateIsCloseEnough(currentTime, action.payload.timeNow)).toBeTruthy();
});
