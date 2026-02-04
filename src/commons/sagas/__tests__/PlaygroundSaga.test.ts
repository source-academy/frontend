import { Chapter, Variant } from 'js-slang/dist/types';
import { compressToEncodedURIComponent } from 'lz-string';
import qs from 'query-string';
import { call } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';

import PlaygroundActions from '../../../features/playground/PlaygroundActions';
import {
  createDefaultWorkspace,
  defaultState,
  defaultWorkspaceManager,
  getDefaultFilePath,
  OverallState
} from '../../application/ApplicationTypes';
import { ExternalLibraryName } from '../../application/types/ExternalTypes';
import Constants from '../../utils/Constants';
import {
  showSuccessMessage,
  showWarningMessage
} from '../../utils/notifications/NotificationsHelper';
import PlaygroundSaga, { shortenURLRequest } from '../PlaygroundSaga';

describe('Playground saga tests', () => {
  Constants.urlShortenerBase = 'http://url-shortener.com/';
  const errMsg = 'Something went wrong trying to create the link.';
  const defaultPlaygroundFilePath = getDefaultFilePath('playground');

  // This test relies on BrowserFS which works in browser environments and not Node.js.
  // FIXME: Uncomment this test if BrowserFS adds support for running in Node.js.
  // test('puts changeQueryString action with correct string argument when passed a dummy program', () => {
  //   const dummyFiles: Record<string, string> = {
  //     [defaultPlaygroundFilePath]: '1 + 1;'
  //   };
  //   const defaultPlaygroundState = createDefaultWorkspace('playground');
  //   const dummyState: OverallState = {
  //     ...defaultState,
  //     workspaces: {
  //       ...defaultWorkspaceManager,
  //       playground: {
  //         ...defaultPlaygroundState,
  //         externalLibrary: ExternalLibraryName.NONE,
  //         editorTabs: [
  //           {
  //             filePath: defaultPlaygroundFilePath,
  //             value: dummyFiles[defaultPlaygroundFilePath],
  //             breakpoints: [],
  //             highlightedLines: []
  //           }
  //         ],
  //         usingSubst: false
  //       }
  //     }
  //   };
  //   const expectedString: string = createQueryString(dummyFiles, dummyState);
  //   return expectSaga(PlaygroundSaga)
  //     .withState(dummyState)
  //     .put(changeQueryString(expectedString))
  //     .dispatch({
  //       type: GENERATE_LZ_STRING
  //     })
  //     .silentRun();
  // });

  test('puts updateShortURL with correct params when shorten request is successful', () => {
    const dummyFiles: Record<string, string> = {
      [defaultPlaygroundFilePath]: '1 + 1;'
    };
    const defaultPlaygroundState = createDefaultWorkspace('playground');
    const dummyState: OverallState = {
      ...defaultState,
      workspaces: {
        ...defaultWorkspaceManager,
        playground: {
          ...defaultPlaygroundState,
          externalLibrary: ExternalLibraryName.NONE,
          editorTabs: [
            {
              filePath: defaultPlaygroundFilePath,
              value: dummyFiles[defaultPlaygroundFilePath],
              breakpoints: [],
              highlightedLines: []
            }
          ],
          usingSubst: false,
          usingCse: false,
          updateCse: true,
          usingUpload: false,
          currentStep: -1,
          stepsTotal: 0,
          breakpointSteps: [],
          changepointSteps: []
        }
      }
    };
    const queryString = createQueryString(dummyFiles, dummyState);
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
        type: PlaygroundActions.shortenURL.type,
        payload: ''
      })
      .provide([[call(shortenURLRequest, queryString, ''), mockResp]])
      .not.call(showWarningMessage, errMsg)
      .not.call(showSuccessMessage, mockResp.message)
      .put(PlaygroundActions.updateShortURL(mockResp.shorturl))
      .silentRun();
  });

  test('puts updateShortURL with correct params when shorten request with keyword is successful', () => {
    const dummyFiles: Record<string, string> = {
      [defaultPlaygroundFilePath]: '1 + 1;'
    };
    const defaultPlaygroundState = createDefaultWorkspace('playground');
    const dummyState: OverallState = {
      ...defaultState,
      workspaces: {
        ...defaultWorkspaceManager,
        playground: {
          ...defaultPlaygroundState,
          externalLibrary: ExternalLibraryName.NONE,
          editorTabs: [
            {
              filePath: defaultPlaygroundFilePath,
              value: dummyFiles[defaultPlaygroundFilePath],
              breakpoints: [],
              highlightedLines: []
            }
          ],
          usingSubst: false,
          usingCse: false,
          updateCse: true,
          usingUpload: false,
          currentStep: -1,
          stepsTotal: 0,
          breakpointSteps: [],
          changepointSteps: []
        }
      }
    };
    const queryString = createQueryString(dummyFiles, dummyState);
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
        type: PlaygroundActions.shortenURL.type,
        payload: 'tester'
      })
      .provide([[call(shortenURLRequest, queryString, 'tester'), mockResp]])
      .not.call(showWarningMessage, errMsg)
      .not.call(showSuccessMessage, mockResp.message)
      .put(PlaygroundActions.updateShortURL(mockResp.shorturl))
      .silentRun();
  });

  test('shows warning message when shorten request failed', () => {
    const dummyFiles: Record<string, string> = {
      [defaultPlaygroundFilePath]: '1 + 1;'
    };
    const defaultPlaygroundState = createDefaultWorkspace('playground');
    const dummyState: OverallState = {
      ...defaultState,
      workspaces: {
        ...defaultWorkspaceManager,
        playground: {
          ...defaultPlaygroundState,
          externalLibrary: ExternalLibraryName.NONE,
          editorTabs: [
            {
              filePath: defaultPlaygroundFilePath,
              value: dummyFiles[defaultPlaygroundFilePath],
              breakpoints: [],
              highlightedLines: []
            }
          ],
          usingSubst: false,
          usingCse: false,
          updateCse: true,
          usingUpload: false,
          currentStep: -1,
          stepsTotal: 0,
          breakpointSteps: [],
          changepointSteps: []
        }
      }
    };
    const queryString = createQueryString(dummyFiles, dummyState);
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
        type: PlaygroundActions.shortenURL.type,
        payload: ''
      })
      .provide([[call(shortenURLRequest, queryString, ''), null]])
      .call(showWarningMessage, errMsg)
      .put(PlaygroundActions.updateShortURL('ERROR'))
      .silentRun();
  });

  test('shows message and gives url when shorten request returns duplicate error', () => {
    const dummyFiles: Record<string, string> = {
      [defaultPlaygroundFilePath]: '1 + 1;'
    };
    const defaultPlaygroundState = createDefaultWorkspace('playground');
    const dummyState: OverallState = {
      ...defaultState,
      workspaces: {
        ...defaultWorkspaceManager,
        playground: {
          ...defaultPlaygroundState,
          externalLibrary: ExternalLibraryName.NONE,
          editorTabs: [
            {
              filePath: defaultPlaygroundFilePath,
              value: dummyFiles[defaultPlaygroundFilePath],
              breakpoints: [],
              highlightedLines: []
            }
          ],
          usingSubst: false,
          usingCse: false,
          usingUpload: false,
          updateCse: true,
          currentStep: -1,
          stepsTotal: 0,
          breakpointSteps: [],
          changepointSteps: []
        }
      }
    };
    const queryString = createQueryString(dummyFiles, dummyState);
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
        type: PlaygroundActions.shortenURL.type,
        payload: ''
      })
      .provide([[call(shortenURLRequest, queryString, ''), mockResp]])
      .call(showSuccessMessage, mockResp.message)
      .not.call(showWarningMessage, errMsg)
      .put(PlaygroundActions.updateShortURL(mockResp.shorturl))
      .silentRun();
  });

  test('shows warning when shorten request returns some error without url', () => {
    const dummyFiles: Record<string, string> = {
      [defaultPlaygroundFilePath]: '1 + 1;'
    };
    const defaultPlaygroundState = createDefaultWorkspace('playground');
    const dummyState: OverallState = {
      ...defaultState,
      workspaces: {
        ...defaultWorkspaceManager,
        playground: {
          ...defaultPlaygroundState,
          externalLibrary: ExternalLibraryName.NONE,
          editorTabs: [
            {
              filePath: defaultPlaygroundFilePath,
              value: dummyFiles[defaultPlaygroundFilePath],
              breakpoints: [],
              highlightedLines: []
            }
          ],
          usingSubst: false,
          usingCse: false,
          updateCse: true,
          usingUpload: false,
          currentStep: -1,
          stepsTotal: 0,
          breakpointSteps: [],
          changepointSteps: []
        }
      }
    };
    const queryString = createQueryString(dummyFiles, dummyState);
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
        type: PlaygroundActions.shortenURL.type,
        payload: ''
      })
      .provide([[call(shortenURLRequest, queryString, ''), mockResp]])
      .call(showWarningMessage, mockResp.message)
      .put(PlaygroundActions.updateShortURL('ERROR'))
      .silentRun();
  });

  test('returns errMsg when API call timesout', () => {
    const dummyFiles: Record<string, string> = {
      [defaultPlaygroundFilePath]: '1 + 1;'
    };
    const defaultPlaygroundState = createDefaultWorkspace('playground');
    const dummyState: OverallState = {
      ...defaultState,
      workspaces: {
        ...defaultWorkspaceManager,
        playground: {
          ...defaultPlaygroundState,
          externalLibrary: ExternalLibraryName.NONE,
          editorTabs: [
            {
              filePath: defaultPlaygroundFilePath,
              value: dummyFiles[defaultPlaygroundFilePath],
              breakpoints: [],
              highlightedLines: []
            }
          ],
          usingSubst: false,
          usingCse: false,
          updateCse: true,
          usingUpload: false,
          currentStep: -1,
          stepsTotal: 0,
          breakpointSteps: [],
          changepointSteps: []
        }
      }
    };
    const queryString = createQueryString(dummyFiles, dummyState);
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
        type: PlaygroundActions.shortenURL.type,
        payload: ''
      })
      .provide({
        race: () => ({
          result: undefined,
          hasTimedOut: true
        })
      })
      .call(showWarningMessage, errMsg)
      .put(PlaygroundActions.updateShortURL('ERROR'))
      .silentRun();
  });
});

function createQueryString(files: Record<string, string>, state: OverallState): string {
  const isFolderModeEnabled: boolean = state.workspaces.playground.isFolderModeEnabled;
  const editorTabFilePaths: string[] = state.workspaces.playground.editorTabs
    .map(editorTab => editorTab.filePath)
    .filter((filePath): filePath is string => filePath !== undefined);
  const activeEditorTabIndex: number | null = state.workspaces.playground.activeEditorTabIndex;
  const chapter: Chapter = state.workspaces.playground.context.chapter;
  const variant: Variant = state.workspaces.playground.context.variant;
  const external: ExternalLibraryName = state.workspaces.playground.externalLibrary;
  const execTime: number = state.workspaces.playground.execTime;
  const newQueryString: string = qs.stringify({
    isFolder: isFolderModeEnabled,
    files: compressToEncodedURIComponent(qs.stringify(files)),
    tabs: editorTabFilePaths.map(compressToEncodedURIComponent),
    tabIdx: activeEditorTabIndex,
    chap: chapter,
    variant,
    ext: external,
    exec: execTime
  });
  return newQueryString;
}
