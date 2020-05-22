import { Variant } from 'js-slang/dist/types';
import { compressToEncodedURIComponent } from 'lz-string';
import * as qs from 'query-string';
import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';
import * as actions from '../../actions';
import * as actionTypes from '../../actions/actionTypes';
import { WorkspaceLocations } from '../../actions/workspaces';
import {
  ExternalLibraryName,
  ExternalLibraryNames
} from '../../components/assessment/assessmentShape';
import {
  createDefaultWorkspace,
  defaultState,
  defaultWorkspaceManager,
  IState
} from '../../reducers/states';
import { showSuccessMessage, showWarningMessage } from '../../utils/notification';
import playgroundSaga from '../playground';
import { shortenURLRequest } from '../playground';

describe('Playground saga tests', () => {
  test('puts changeQueryString action with undefined argument when passed the default value', () => {
    return expectSaga(playgroundSaga)
      .withState(defaultState)
      .put(actions.changeQueryString(''))
      .dispatch({
        type: actionTypes.GENERATE_LZ_STRING
      })
      .silentRun();
  });

  test('puts changeQueryString action with undefined argument when passed an empty string', () => {
    const dummyEditorValue: string = '';
    const dummyState: IState = {
      ...defaultState,
      workspaces: {
        ...defaultWorkspaceManager,
        playground: {
          ...createDefaultWorkspace(WorkspaceLocations.playground),
          externalLibrary: ExternalLibraryNames.NONE,
          editorValue: dummyEditorValue,
          usingSubst: false
        }
      }
    };
    return expectSaga(playgroundSaga)
      .withState(dummyState)
      .put(actions.changeQueryString(''))
      .dispatch({
        type: actionTypes.GENERATE_LZ_STRING
      })
      .silentRun();
  });

  test('puts changeQueryString action with correct string argument when passed a dummy string', () => {
    const dummyEditorValue: string = '1 + 1;';
    const dummyState: IState = {
      ...defaultState,
      workspaces: {
        ...defaultWorkspaceManager,
        playground: {
          ...createDefaultWorkspace(WorkspaceLocations.playground),
          externalLibrary: ExternalLibraryNames.NONE,
          editorValue: dummyEditorValue,
          usingSubst: false
        }
      }
    };
    const expectedString: string = createQueryString(dummyEditorValue, dummyState);
    return expectSaga(playgroundSaga)
      .withState(dummyState)
      .put(actions.changeQueryString(expectedString))
      .dispatch({
        type: actionTypes.GENERATE_LZ_STRING
      })
      .silentRun();
  });

  test('puts updateShortURL with correct params when shorten request is succesful', () => {
    const dummyEditorValue: string = '1 + 1;';
    const dummyState: IState = {
      ...defaultState,
      workspaces: {
        ...defaultWorkspaceManager,
        playground: {
          ...createDefaultWorkspace(WorkspaceLocations.playground),
          externalLibrary: ExternalLibraryNames.NONE,
          editorValue: dummyEditorValue,
          usingSubst: false
        }
      }
    };
    const queryString = createQueryString(dummyEditorValue, dummyState);
    const nxState: IState = {
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

    return expectSaga(playgroundSaga)
      .withState(nxState)
      .dispatch({
        type: actionTypes.SHORTEN_URL,
        payload: ''
      })
      .provide([[call(shortenURLRequest, queryString, ''), mockResp]])
      .not.call(
        showWarningMessage,
        'Something went wrong trying to shorten the url. Please try again'
      )
      .not.call(showSuccessMessage, mockResp.message)
      .put(actions.updateShortURL(mockResp.shorturl))
      .silentRun();
  });

  test('puts updateShortURL with correct params when shorten request with keyword is succesful', () => {
    const dummyEditorValue: string = '1 + 1;';
    const dummyState: IState = {
      ...defaultState,
      workspaces: {
        ...defaultWorkspaceManager,
        playground: {
          ...createDefaultWorkspace(WorkspaceLocations.playground),
          externalLibrary: ExternalLibraryNames.NONE,
          editorValue: dummyEditorValue,
          usingSubst: false
        }
      }
    };
    const queryString = createQueryString(dummyEditorValue, dummyState);
    const nxState: IState = {
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

    return expectSaga(playgroundSaga)
      .withState(nxState)
      .dispatch({
        type: actionTypes.SHORTEN_URL,
        payload: 'tester'
      })
      .provide([[call(shortenURLRequest, queryString, 'tester'), mockResp]])
      .not.call(
        showWarningMessage,
        'Something went wrong trying to shorten the url. Please try again'
      )
      .not.call(showSuccessMessage, mockResp.message)
      .put(actions.updateShortURL(mockResp.shorturl))
      .silentRun();
  });

  test('shows warning message when shorten request failed', () => {
    const dummyEditorValue: string = '1 + 1;';
    const dummyState: IState = {
      ...defaultState,
      workspaces: {
        ...defaultWorkspaceManager,
        playground: {
          ...createDefaultWorkspace(WorkspaceLocations.playground),
          externalLibrary: ExternalLibraryNames.NONE,
          editorValue: dummyEditorValue,
          usingSubst: false
        }
      }
    };
    const queryString = createQueryString(dummyEditorValue, dummyState);
    const nxState: IState = {
      ...dummyState,
      playground: {
        queryString,
        ...dummyState.playground
      }
    };

    return expectSaga(playgroundSaga)
      .withState(nxState)
      .dispatch({
        type: actionTypes.SHORTEN_URL,
        payload: ''
      })
      .provide([[call(shortenURLRequest, queryString, ''), null]])
      .call(showWarningMessage, 'Something went wrong trying to shorten the url. Please try again')
      .put(actions.updateShortURL('ERROR'))
      .silentRun();
  });

  test('shows message and gives url when shorten request returns duplicate error', () => {
    const dummyEditorValue: string = '1 + 1;';
    const dummyState: IState = {
      ...defaultState,
      workspaces: {
        ...defaultWorkspaceManager,
        playground: {
          ...createDefaultWorkspace(WorkspaceLocations.playground),
          externalLibrary: ExternalLibraryNames.NONE,
          editorValue: dummyEditorValue,
          usingSubst: false
        }
      }
    };
    const queryString = createQueryString(dummyEditorValue, dummyState);
    const nxState: IState = {
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

    return expectSaga(playgroundSaga)
      .withState(nxState)
      .dispatch({
        type: actionTypes.SHORTEN_URL,
        payload: ''
      })
      .provide([[call(shortenURLRequest, queryString, ''), mockResp]])
      .call(showSuccessMessage, mockResp.message)
      .not.call(
        showWarningMessage,
        'Something went wrong trying to shorten the url. Please try again'
      )
      .put(actions.updateShortURL(mockResp.shorturl))
      .silentRun();
  });

  test('shows warning when shorten request returns some error without url', () => {
    const dummyEditorValue: string = '1 + 1;';
    const dummyState: IState = {
      ...defaultState,
      workspaces: {
        ...defaultWorkspaceManager,
        playground: {
          ...createDefaultWorkspace(WorkspaceLocations.playground),
          externalLibrary: ExternalLibraryNames.NONE,
          editorValue: dummyEditorValue,
          usingSubst: false
        }
      }
    };
    const queryString = createQueryString(dummyEditorValue, dummyState);
    const nxState: IState = {
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

    return expectSaga(playgroundSaga)
      .withState(nxState)
      .dispatch({
        type: actionTypes.SHORTEN_URL,
        payload: ''
      })
      .provide([[call(shortenURLRequest, queryString, ''), mockResp]])
      .call(showWarningMessage, mockResp.message)
      .put(actions.updateShortURL('ERROR'))
      .silentRun();
  });
});

function createQueryString(code: string, state: IState): string {
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
