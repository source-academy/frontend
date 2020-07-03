import { ExternalLibraryNames } from '../../components/assessment/assessmentShape';
import { ICodeDelta, Input, IPlaybackData } from '../../components/sourcecast/sourcecastShape';
import * as actionTypes from '../actionTypes';
import {
  recordInit,
  recordInput,
  saveSourcecastData,
  timerPause,
  timerReset,
  timerResume,
  timerStart,
  timerStop
} from '../sourcereel';
import { WorkspaceLocation, WorkspaceLocations } from '../workspaces';

const sourcereelWorkspace: WorkspaceLocation = WorkspaceLocations.sourcereel;

function dateIsCloseEnough(dateA: number, dateB: number) {
  return Math.abs(dateA - dateB) <= 1000;
}

test('recordInit generates correct action object', () => {
  const initData: IPlaybackData['init'] = {
    editorValue: 'Init Value',
    chapter: 1,
    externalLibrary: ExternalLibraryNames.NONE
  };
  const action = recordInit(initData, sourcereelWorkspace);
  expect(action).toEqual({
    type: actionTypes.RECORD_INIT,
    payload: {
      initData,
      workspaceLocation: sourcereelWorkspace
    }
  });
});

test('recordInput generates correct action object', () => {
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
  const action = recordInput(input, sourcereelWorkspace);
  expect(action).toEqual({
    type: actionTypes.RECORD_INPUT,
    payload: {
      input,
      workspaceLocation: sourcereelWorkspace
    }
  });
});

test('saveSourcecastData generates correct action object', () => {
  const fakeUrl = 'someFakeAudioUrl.com';
  const noOp = () => fakeUrl;
  window.URL.createObjectURL = noOp;
  const title = 'Test Title';
  const description = 'Test Description';
  const audio = new Blob();
  const playbackData: IPlaybackData = {
    init: {
      editorValue: 'Editor Init Value',
      chapter: 1,
      externalLibrary: ExternalLibraryNames.NONE
    },
    inputs: []
  };
  const action = saveSourcecastData(title, description, audio, playbackData, sourcereelWorkspace);
  expect(action).toEqual({
    type: actionTypes.SAVE_SOURCECAST_DATA,
    payload: {
      title,
      description,
      audio,
      audioUrl: fakeUrl,
      playbackData,
      workspaceLocation: sourcereelWorkspace
    }
  });
});

test('timerPause generates correct action object', () => {
  const currentTime = Date.now();
  const action = timerPause(sourcereelWorkspace);
  expect(action.type).toEqual(actionTypes.TIMER_PAUSE);
  expect(action.payload.workspaceLocation).toEqual(sourcereelWorkspace);
  expect(dateIsCloseEnough(currentTime, action.payload.timeNow)).toBeTruthy();
});

test('timerReset generates correct action object', () => {
  const action = timerReset(sourcereelWorkspace);
  expect(action).toEqual({
    type: actionTypes.TIMER_RESET,
    payload: { workspaceLocation: sourcereelWorkspace }
  });
});

test('timerResume generates correct action object', () => {
  const currentTime = Date.now();
  const action = timerResume(1000, sourcereelWorkspace);
  expect(action.type).toEqual(actionTypes.TIMER_RESUME);
  expect(action.payload.workspaceLocation).toEqual(sourcereelWorkspace);
  expect(dateIsCloseEnough(currentTime, action.payload.timeNow)).toBeTruthy();
});

test('timerStart generates correct action object', () => {
  const currentTime = Date.now();
  const action = timerStart(sourcereelWorkspace);
  expect(action.type).toEqual(actionTypes.TIMER_START);
  expect(action.payload.workspaceLocation).toEqual(sourcereelWorkspace);
  expect(dateIsCloseEnough(currentTime, action.payload.timeNow)).toBeTruthy();
});

test('timerStop generates correct action object', () => {
  const currentTime = Date.now();
  const action = timerStop(sourcereelWorkspace);
  expect(action.type).toEqual(actionTypes.TIMER_STOP);
  expect(action.payload.workspaceLocation).toEqual(sourcereelWorkspace);
  expect(dateIsCloseEnough(currentTime, action.payload.timeNow)).toBeTruthy();
});
