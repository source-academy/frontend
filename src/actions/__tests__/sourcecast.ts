import {
  ICodeDelta,
  Input,
  IPlaybackData,
  ISourcecastData,
  PlaybackStatus
} from '../../components/sourcecast/sourcecastShape';
import * as actionTypes from '../actionTypes';
import {
  fetchSourcecastIndex,
  setCodeDeltasToApply,
  setInputToApply,
  setSourcecastData,
  setSourcecastDuration,
  setSourcecastStatus,
  updateSourcecastIndex
} from '../sourcecast';
import { WorkspaceLocation, WorkspaceLocations } from '../workspaces';

const sourcecastWorkspace: WorkspaceLocation = WorkspaceLocations.sourcecast;

test('fetchSourcecastIndex generates correct action object', () => {
  const action = fetchSourcecastIndex();
  expect(action).toEqual({
    type: actionTypes.FETCH_SOURCECAST_INDEX
  });
});

test('setCodeDeltasToApply generates correct action object', () => {
  const codeDeltas: ICodeDelta[] = [
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
    }
  ];
  const action = setCodeDeltasToApply(codeDeltas);
  expect(action).toEqual({
    type: actionTypes.SET_CODE_DELTAS_TO_APPLY,
    payload: {
      deltas: codeDeltas
    }
  });
});

test('setInputToApply generates correct action object', () => {
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
  const action = setInputToApply(sourcecastWorkspace, input);
  expect(action).toEqual({
    type: actionTypes.SET_INPUT_TO_APPLY,
    payload: {
      workspaceLocation: sourcecastWorkspace,
      inputToApply: input
    }
  });
});

test('setSourcecastData generates correct action object', () => {
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
  const action = setSourcecastData(
    'Test Title',
    'Test Description',
    'fakeAudioUrl.com/audio.mp3',
    playbackData
  );
  expect(action).toEqual({
    type: actionTypes.SET_SOURCECAST_DATA,
    payload: {
      title: 'Test Title',
      description: 'Test Description',
      audioUrl: 'fakeAudioUrl.com/audio.mp3',
      playbackData
    }
  });
});

test('setSourcecastDuration generates correct action object', () => {
  const duration = 5;
  const action = setSourcecastDuration(duration);
  expect(action).toEqual({
    type: actionTypes.SET_SOURCECAST_PLAYBACK_DURATION,
    payload: { duration }
  });
});

test('setSourcecastStatus generates correct action object', () => {
  const status = PlaybackStatus.notStarted;
  const action = setSourcecastStatus(status);
  expect(action).toEqual({
    type: actionTypes.SET_SOURCECAST_PLAYBACK_STATUS,
    payload: { playbackStatus: status }
  });
});

test('updateSourcecastIndex generates correct action object', () => {
  const sourcecastData: ISourcecastData = {
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
  };
  const action = updateSourcecastIndex([sourcecastData]);
  expect(action).toEqual({
    type: actionTypes.UPDATE_SOURCECAST_INDEX,
    payload: { index: [sourcecastData] }
  });
});
