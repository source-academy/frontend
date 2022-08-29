import { Chapter } from 'js-slang/dist/types';

import { ExternalLibraryName } from '../../../commons/application/types/ExternalTypes';
import { WorkspaceLocation } from '../../../commons/workspace/WorkspaceTypes';
import {
  saveSourcecastData,
  setCodeDeltasToApply,
  setInputToApply,
  setSourcecastData,
  setSourcecastDuration,
  setSourcecastStatus
} from '../SourceRecorderActions';
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
  SET_SOURCECAST_PLAYBACK_STATUS
} from '../SourceRecorderTypes';

const sourcecastWorkspace: WorkspaceLocation = 'sourcecast';
const sourcereelWorkspace: WorkspaceLocation = 'sourcereel';

test('saveSourcecastData generates correct action object', () => {
  const fakeUrl = 'someFakeAudioUrl.com';
  const noOp = () => fakeUrl;
  window.URL.createObjectURL = noOp;
  const title = 'Test Title';
  const description = 'Test Description';
  const uid = 'unique_id';
  const audio = new Blob();
  const playbackData: PlaybackData = {
    init: {
      editorValue: 'Editor Init Value',
      chapter: Chapter.SOURCE_1,
      externalLibrary: ExternalLibraryName.NONE
    },
    inputs: []
  };
  const action = saveSourcecastData(
    title,
    description,
    uid,
    audio,
    playbackData,
    sourcereelWorkspace
  );
  expect(action).toEqual({
    type: SAVE_SOURCECAST_DATA,
    payload: {
      title,
      description,
      uid,
      audio,
      audioUrl: fakeUrl,
      playbackData,
      workspaceLocation: sourcereelWorkspace
    }
  });
});

test('setCodeDeltasToApply generates correct action object', () => {
  const codeDeltas: CodeDelta[] = [
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
  const action = setCodeDeltasToApply(codeDeltas, sourcecastWorkspace);
  expect(action).toEqual({
    type: SET_CODE_DELTAS_TO_APPLY,
    payload: {
      deltas: codeDeltas,
      workspaceLocation: sourcecastWorkspace
    }
  });
});

test('setInputToApply generates correct action object', () => {
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
  const action = setInputToApply(input, sourcecastWorkspace);
  expect(action).toEqual({
    type: SET_INPUT_TO_APPLY,
    payload: {
      inputToApply: input,
      workspaceLocation: sourcecastWorkspace
    }
  });
});

test('setSourcecastData generates correct action object', () => {
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
  const action = setSourcecastData(
    'Test Title',
    'Test Description',
    'unique_id',
    'fakeAudioUrl.com/audio.mp3',
    playbackData,
    sourcecastWorkspace
  );
  expect(action).toEqual({
    type: SET_SOURCECAST_DATA,
    payload: {
      title: 'Test Title',
      description: 'Test Description',
      uid: 'unique_id',
      audioUrl: 'fakeAudioUrl.com/audio.mp3',
      playbackData,
      workspaceLocation: sourcecastWorkspace
    }
  });
});

test('setSourcecastDuration generates correct action object', () => {
  const duration = 5;
  const action = setSourcecastDuration(duration, sourcecastWorkspace);
  expect(action).toEqual({
    type: SET_SOURCECAST_PLAYBACK_DURATION,
    payload: { duration, workspaceLocation: sourcecastWorkspace }
  });
});

test('setSourcecastStatus generates correct action object', () => {
  const status = PlaybackStatus.paused;
  const action = setSourcecastStatus(status, sourcecastWorkspace);
  expect(action).toEqual({
    type: SET_SOURCECAST_PLAYBACK_STATUS,
    payload: { playbackStatus: status, workspaceLocation: sourcecastWorkspace }
  });
});
