import { ICodeDelta, Input, IPlaybackData } from '../../components/sourcecast/sourcecastShape';
import * as actionTypes from '../actionTypes';
import {
  recordEditorInitValue,
  recordEditorInput,
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

test('recordEditorInitValue generates correct action object', () => {
  const editorValue = 'Init Value';
  const action = recordEditorInitValue(editorValue);
  expect(action).toEqual({
    type: actionTypes.RECORD_EDITOR_INIT_VALUE,
    payload: {
      editorValue
    }
  });
});

test('recordEditorInput generates correct action object', () => {
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
  const action = recordEditorInput(sourcereelWorkspace, input);
  expect(action).toEqual({
    type: actionTypes.RECORD_EDITOR_INPUT,
    payload: {
      location: sourcereelWorkspace,
      input
    }
  });
});

test('saveSourcecastData generates correct action object', () => {
  const title = 'Test Title';
  const description = 'Test Description';
  const audio = new Blob();
  const playbackData: IPlaybackData = {
    init: { editorValue: 'Editor Init Value' },
    inputs: []
  };
  const action = saveSourcecastData(title, description, audio, playbackData);
  expect(action).toEqual({
    type: actionTypes.SAVE_SOURCECAST_DATA,
    payload: {
      title,
      description,
      audio,
      playbackData
    }
  });
});

test('timerPause generates correct action object', () => {
  const currentTime = Date.now();
  const action = timerPause();
  expect(action.type).toEqual(actionTypes.TIMER_PAUSE);
  expect(dateIsCloseEnough(currentTime, action.payload.timeNow)).toBeTruthy();
});

test('timerReset generates correct action object', () => {
  const action = timerReset();
  expect(action).toEqual({
    type: actionTypes.TIMER_RESET
  });
});

test('timerResume generates correct action object', () => {
  const currentTime = Date.now();
  const action = timerResume();
  expect(action.type).toEqual(actionTypes.TIMER_RESUME);
  expect(dateIsCloseEnough(currentTime, action.payload.timeNow)).toBeTruthy();
});

test('timerStart generates correct action object', () => {
  const currentTime = Date.now();
  const action = timerStart();
  expect(action.type).toEqual(actionTypes.TIMER_START);
  expect(dateIsCloseEnough(currentTime, action.payload.timeNow)).toBeTruthy();
});

test('timerStop generates correct action object', () => {
  const currentTime = Date.now();
  const action = timerStop();
  expect(action.type).toEqual(actionTypes.TIMER_STOP);
  expect(dateIsCloseEnough(currentTime, action.payload.timeNow)).toBeTruthy();
});
