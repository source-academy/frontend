import { Variant } from 'js-slang/dist/types';
import { compressToEncodedURIComponent } from 'lz-string';
import * as qs from 'query-string';
import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';

import { changeQueryString, updateShortURL } from '../../../features/playground/PlaygroundActions';
import { GENERATE_LZ_STRING, SHORTEN_URL } from '../../../features/playground/PlaygroundTypes';
import {
  createDefaultWorkspace,
  defaultState,
  defaultWorkspaceManager,
  OverallState
} from '../../application/ApplicationTypes';
import { ExternalLibraryName } from '../../application/types/ExternalTypes';
import { showSuccessMessage, showWarningMessage } from '../../utils/NotificationsHelper';
import PlaygroundSaga, { shortenURLRequest } from '../PlaygroundSaga';

describe('Playground saga tests', () => {
  const errMsg = 'Something went wrong trying to create the link.';

  test('puts changeQueryString action with undefined argument when passed the default value', () => {
    return expectSaga(PlaygroundSaga)
      .withState(defaultState)
      .put(changeQueryString(''))
      .dispatch({
        type: GENERATE_LZ_STRING
      })
      .silentRun();
  });

  test('puts changeQueryString action with undefined argument when passed an empty string', () => {
    const dummyEditorValue: string = '';
    const dummyState: OverallState = {
      ...defaultState,
      workspaces: {
        ...defaultWorkspaceManager,
        playground: {
          ...createDefaultWorkspace('playground'),
          externalLibrary: ExternalLibraryName.NONE,
          editorValue: dummyEditorValue,
          usingSubst: false
        }
      }
    };
    return expectSaga(PlaygroundSaga)
      .withState(dummyState)
      .put(changeQueryString(''))
      .dispatch({
        type: GENERATE_LZ_STRING
      })
      .silentRun();
  });

  test('puts changeQueryString action with correct string argument when passed a dummy string', () => {
    const dummyEditorValue: string = '1 + 1;';
    const dummyState: OverallState = {
      ...defaultState,
      workspaces: {
        ...defaultWorkspaceManager,
        playground: {
          ...createDefaultWorkspace('playground'),
          externalLibrary: ExternalLibraryName.NONE,
          editorValue: dummyEditorValue,
          usingSubst: false
        }
      }
    };
    const expectedString: string = createQueryString(dummyEditorValue, dummyState);
    return expectSaga(PlaygroundSaga)
      .withState(dummyState)
      .put(changeQueryString(expectedString))
      .dispatch({
        type: GENERATE_LZ_STRING
      })
      .silentRun();
  });

  test('puts updateShortURL with correct params when shorten request is succesful', () => {
    const dummyEditorValue: string = '1 + 1;';
    const dummyState: OverallState = {
      ...defaultState,
      workspaces: {
        ...defaultWorkspaceManager,
        playground: {
          ...createDefaultWorkspace('playground'),
          externalLibrary: ExternalLibraryName.NONE,
          editorValue: dummyEditorValue,
          usingSubst: false
        }
      }
    };
    const queryString = createQueryString(dummyEditorValue, dummyState);
    const nxState: OverallState = {
      ...dummyState,
      playground: {
        queryString,
        ...dummyState.playground
      }
    };

    // a fake response that looks like the real one
    const mockResp = {
      url: {
        keyword: 't',
        url: 'https://www.google.com',
        title: 'Google',
        date: '2020-05-21 10:51:59',
        ip: '11.11.11.11'
      },
      status: 'success',
      message: 'https://www.google.com added to database',
      title: 'Google',
      shorturl: 'http://url-shortener.com/t',
      statusCode: 200
    };

    return expectSaga(PlaygroundSaga)
      .withState(nxState)
      .dispatch({
        type: SHORTEN_URL,
        payload: ''
      })
      .provide([[call(shortenURLRequest, queryString, ''), mockResp]])
      .not.call(showWarningMessage, errMsg)
      .not.call(showSuccessMessage, mockResp.message)
      .put(updateShortURL(mockResp.shorturl))
      .silentRun();
  });

  test('puts updateShortURL with correct params when shorten request with keyword is succesful', () => {
    const dummyEditorValue: string = '1 + 1;';
    const dummyState: OverallState = {
      ...defaultState,
      workspaces: {
        ...defaultWorkspaceManager,
        playground: {
          ...createDefaultWorkspace('playground'),
          externalLibrary: ExternalLibraryName.NONE,
          editorValue: dummyEditorValue,
          usingSubst: false
        }
      }
    };
    const queryString = createQueryString(dummyEditorValue, dummyState);
    const nxState: OverallState = {
      ...dummyState,
      playground: {
        queryString,
        ...dummyState.playground
      }
    };

    // a fake response that looks like the real one
    const mockResp = {
      url: {
        keyword: 't',
        url: 'https://www.google.com',
        title: 'Google',
        date: '2020-05-21 10:51:59',
        ip: '11.11.11.11'
      },
      status: 'success',
      message: 'https://www.google.com added to database',
      title: 'Google',
      shorturl: 'http://url-shortener.com/t',
      statusCode: 200
    };

    return expectSaga(PlaygroundSaga)
      .withState(nxState)
      .dispatch({
        type: SHORTEN_URL,
        payload: 'tester'
      })
      .provide([[call(shortenURLRequest, queryString, 'tester'), mockResp]])
      .not.call(showWarningMessage, errMsg)
      .not.call(showSuccessMessage, mockResp.message)
      .put(updateShortURL(mockResp.shorturl))
      .silentRun();
  });

  test('shows warning message when shorten request failed', () => {
    const dummyEditorValue: string = '1 + 1;';
    const dummyState: OverallState = {
      ...defaultState,
      workspaces: {
        ...defaultWorkspaceManager,
        playground: {
          ...createDefaultWorkspace('playground'),
          externalLibrary: ExternalLibraryName.NONE,
          editorValue: dummyEditorValue,
          usingSubst: false
        }
      }
    };
    const queryString = createQueryString(dummyEditorValue, dummyState);
    const nxState: OverallState = {
      ...dummyState,
      playground: {
        queryString,
        ...dummyState.playground
      }
    };

    return expectSaga(PlaygroundSaga)
      .withState(nxState)
      .dispatch({
        type: SHORTEN_URL,
        payload: ''
      })
      .provide([[call(shortenURLRequest, queryString, ''), null]])
      .call(showWarningMessage, errMsg)
      .put(updateShortURL('ERROR'))
      .silentRun();
  });

  test('shows message and gives url when shorten request returns duplicate error', () => {
    const dummyEditorValue: string = '1 + 1;';
    const dummyState: OverallState = {
      ...defaultState,
      workspaces: {
        ...defaultWorkspaceManager,
        playground: {
          ...createDefaultWorkspace('playground'),
          externalLibrary: ExternalLibraryName.NONE,
          editorValue: dummyEditorValue,
          usingSubst: false
        }
      }
    };
    const queryString = createQueryString(dummyEditorValue, dummyState);
    const nxState: OverallState = {
      ...dummyState,
      playground: {
        queryString,
        ...dummyState.playground
      }
    };

    // a fake response that looks like the real one
    const mockResp = {
      status: 'fail',
      code: 'error:url',
      url: {
        keyword: 't',
        url: 'https://www.google.com',
        title: 'Google',
        date: '2020-05-21 10:51:59',
        ip: '11.11.11.11',
        clicks: '0'
      },
      message: 'https://www.google.com already exists in database',
      title: 'Google',
      shorturl: 'http://url-shortener.com/t',
      statusCode: 200
    };

    return expectSaga(PlaygroundSaga)
      .withState(nxState)
      .dispatch({
        type: SHORTEN_URL,
        payload: ''
      })
      .provide([[call(shortenURLRequest, queryString, ''), mockResp]])
      .call(showSuccessMessage, mockResp.message)
      .not.call(showWarningMessage, errMsg)
      .put(updateShortURL(mockResp.shorturl))
      .silentRun();
  });

  test('shows warning when shorten request returns some error without url', () => {
    const dummyEditorValue: string = '1 + 1;';
    const dummyState: OverallState = {
      ...defaultState,
      workspaces: {
        ...defaultWorkspaceManager,
        playground: {
          ...createDefaultWorkspace('playground'),
          externalLibrary: ExternalLibraryName.NONE,
          editorValue: dummyEditorValue,
          usingSubst: false
        }
      }
    };
    const queryString = createQueryString(dummyEditorValue, dummyState);
    const nxState: OverallState = {
      ...dummyState,
      playground: {
        queryString,
        ...dummyState.playground
      }
    };

    // a fake response that looks like the real one
    const mockResp = {
      status: 'fail',
      code: 'error:keyword',
      message: 'Short URL t already exists in database or is reserved',
      statusCode: 200
    };

    return expectSaga(PlaygroundSaga)
      .withState(nxState)
      .dispatch({
        type: SHORTEN_URL,
        payload: ''
      })
      .provide([[call(shortenURLRequest, queryString, ''), mockResp]])
      .call(showWarningMessage, mockResp.message)
      .put(updateShortURL('ERROR'))
      .silentRun();
  });

  test('returns errMsg when API call timesout', () => {
    const dummyEditorValue: string = '1 + 1;';
    const dummyState: OverallState = {
      ...defaultState,
      workspaces: {
        ...defaultWorkspaceManager,
        playground: {
          ...createDefaultWorkspace('playground'),
          externalLibrary: ExternalLibraryName.NONE,
          editorValue: dummyEditorValue,
          usingSubst: false
        }
      }
    };
    const queryString = createQueryString(dummyEditorValue, dummyState);
    const nxState: OverallState = {
      ...dummyState,
      playground: {
        queryString,
        ...dummyState.playground
      }
    };

    return expectSaga(PlaygroundSaga)
      .withState(nxState)
      .dispatch({
        type: SHORTEN_URL,
        payload: ''
      })
      .provide({
        race: () => ({
          resp: undefined,
          timeout: true
        })
      })
      .call(showWarningMessage, errMsg)
      .put(updateShortURL('ERROR'))
      .silentRun();
  });
});

function createQueryString(code: string, state: OverallState): string {
  const chapter: number = state.workspaces.playground.context.chapter;
  const variant: Variant = state.workspaces.playground.context.variant;
  const external: ExternalLibraryName = state.workspaces.playground.externalLibrary;
  const execTime: number = state.workspaces.playground.execTime;
  const newQueryString: string = qs.stringify({
    prgrm: compressToEncodedURIComponent(code),
    chap: chapter,
    variant,
    ext: external,
    exec: execTime
  });
  return newQueryString;
}
