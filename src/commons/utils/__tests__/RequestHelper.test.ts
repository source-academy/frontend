import { postRefresh } from 'src/commons/sagas/RequestsSaga';
import { store } from 'src/pages/createStore';
import { Mock, vi } from 'vitest';

import { Tokens } from '../../application/types/SessionTypes';
import { actions } from '../ActionsHelper';
import Constants from '../Constants';
import { showWarningMessage } from '../notifications/NotificationsHelper';
import {
  autoLogoutMessage,
  generateApiCallHeadersAndFetchOptions,
  getResponseErrorMessage,
  networkErrorMessage,
  networkErrorNotificationKey,
  promptReloginMessage,
  request,
  RequestMethod,
  userSessionExpiredNotificationKey
} from '../RequestHelper';

global.fetch = vi.fn();
const fetchMock = fetch as Mock;

vi.mock('../../utils/notifications/NotificationsHelper', () => ({
  showWarningMessage: vi.fn()
}));
const showWarningMessageSpy = showWarningMessage as Mock<typeof showWarningMessage>;
vi.mock('../../sagas/RequestsSaga');
const postRefreshSpy = postRefresh as Mock<typeof postRefresh>;
vi.mock('../../../pages/createStore', () => ({
  store: {
    dispatch: vi.fn()
  }
}));
const storeDispatchSpy = store.dispatch as unknown as Mock<typeof store.dispatch>;

const tokens: Tokens = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken'
};
const refreshedTokens: Tokens = {
  accessToken: 'refreshedAccessToken',
  refreshToken: 'refreshedRefreshToken'
};

export type MockResponse = {
  ok: boolean;
  status: number;
  statusText: string;
};

const OK_RESP: MockResponse = {
  ok: true,
  status: 200,
  statusText: 'OK'
};
const UNAUTHORIZED_401_ERROR_RESP: MockResponse = {
  ok: false,
  status: 401,
  statusText: 'Unauthorized'
};
const NON_UNAUTHORIZED_401_ERROR_RESP: MockResponse = {
  ok: false,
  status: 400,
  statusText: 'Bad Request'
};

const apiPath = 'api_path';
const fullApiUrl = `${Constants.backendUrl}/v2/${apiPath}`;
const GET_METHOD = 'GET';
const fetchOptions = { ...tokens };
const refreshFetchOptions = { ...refreshedTokens };

const mockOkResponseOnce = () => fetchMock.mockImplementationOnce(() => Promise.resolve(OK_RESP));
const mockNon401ErrorResponseOnce = () =>
  fetchMock.mockImplementationOnce(() => Promise.resolve(NON_UNAUTHORIZED_401_ERROR_RESP));
const mock401ErrorResponseOnce = () =>
  fetchMock.mockImplementationOnce(() => Promise.resolve(UNAUTHORIZED_401_ERROR_RESP));
const mockPostRefresh = (success: boolean) =>
  postRefreshSpy.mockImplementation(
    () => new Promise(resolve => setTimeout(() => resolve(success ? refreshedTokens : null), 500))
  );

const mockNetworkErrorOnce = () => fetchMock.mockImplementationOnce(() => Promise.reject());

// Make `Headers` return a singleton for easier comparison in tests
const originalHeaders = global.Headers;
const singleton = new originalHeaders();
vi.spyOn(global, 'Headers').mockImplementation(function (init?: HeadersInit) {
  return singleton;
});

const makeRequest = (method: RequestMethod = GET_METHOD) => request(apiPath, method, fetchOptions);
const expectFetchToBeCalledWithCorrectParams = () =>
  expect(fetchMock).toBeCalledWith(
    fullApiUrl,
    generateApiCallHeadersAndFetchOptions(GET_METHOD, fetchOptions)
  );
const expectRefreshFlowFetchesToBeCalledWithCorrectParams = () => {
  expect(fetchMock).toBeCalledTimes(2);
  expect(fetchMock).toHaveBeenNthCalledWith(
    1,
    fullApiUrl,
    expect.objectContaining(generateApiCallHeadersAndFetchOptions(GET_METHOD, fetchOptions))
  );
  expect(fetchMock).toHaveBeenNthCalledWith(
    2,
    fullApiUrl,
    expect.objectContaining(generateApiCallHeadersAndFetchOptions(GET_METHOD, refreshFetchOptions))
  );
  // expect(fetchMock).toHaveBeenNthCalledWith(
  //   1,
  //   fullApiUrl,
  //   expect.objectContaining(generateApiCallHeadersAndFetchOptions(GET_METHOD, fetchOptions))
  // );
  // expect(fetchMock).toHaveBeenNthCalledWith(
  //   2,
  //   fullApiUrl,
  //   expect.objectContaining(generateApiCallHeadersAndFetchOptions(GET_METHOD, refreshFetchOptions))
  // );
};
const expectPostRefreshToBeCalled = (called: boolean) =>
  called ? expect(postRefreshSpy).toBeCalledTimes(1) : expect(postRefreshSpy).not.toBeCalled();
const expectStoreToDispatchRefreshedTokens = (dispatchOccurs: boolean) =>
  dispatchOccurs
    ? expect(storeDispatchSpy).toBeCalledWith(actions.setTokens(refreshedTokens))
    : expect(storeDispatchSpy).not.toBeCalledWith(actions.setTokens(refreshedTokens));
const expectStoreToDispatchLogout = (dispatchOccurs: boolean) =>
  dispatchOccurs
    ? expect(storeDispatchSpy).toBeCalledWith(actions.logOut())
    : expect(storeDispatchSpy).not.toBeCalledWith(actions.logOut());

describe('request', () => {
  // Mock location object as jsdom can't navigate
  Object.defineProperty(window, 'location', {
    value: new URL('http://sourceacademy.nus.edu.sg')
  });

  beforeEach(() => {
    fetchMock.mockClear();
    showWarningMessageSpy.mockClear();
    postRefreshSpy.mockClear();
    storeDispatchSpy.mockClear();
  });

  test('OK response -> returns response', async () => {
    mockOkResponseOnce();
    const resp = await makeRequest();

    expectFetchToBeCalledWithCorrectParams();
    expect(showWarningMessageSpy).not.toBeCalled();
    expectPostRefreshToBeCalled(false);
    expect(resp).toEqual(OK_RESP);
  });

  test('Non-401 unauthorized error response -> shows warning and returns null', async () => {
    mockNon401ErrorResponseOnce();
    const resp = await makeRequest();

    expectFetchToBeCalledWithCorrectParams();
    expect(showWarningMessageSpy).toBeCalledWith(
      getResponseErrorMessage(NON_UNAUTHORIZED_401_ERROR_RESP)
    );
    expectPostRefreshToBeCalled(false);
    expect(resp).toBeNull();
  });

  test('401 unauthorized -> refresh token flow succeeds -> OK response -> returns response', async () => {
    mock401ErrorResponseOnce();
    mockPostRefresh(true);
    mockOkResponseOnce();
    const resp = await makeRequest();

    expectPostRefreshToBeCalled(true);
    expectStoreToDispatchRefreshedTokens(true);
    expectRefreshFlowFetchesToBeCalledWithCorrectParams();
    expect(showWarningMessageSpy).not.toBeCalled();
    expectStoreToDispatchLogout(false);
    expect(resp).toEqual(OK_RESP);
  });

  test('401 unauthorized -> refresh token flow succeeds -> non-401 unauthorized error response -> shows warning and returns null', async () => {
    mock401ErrorResponseOnce();
    mockPostRefresh(true);
    mockNon401ErrorResponseOnce();
    const resp = await makeRequest();

    expectPostRefreshToBeCalled(true);
    expectStoreToDispatchRefreshedTokens(true);
    expectRefreshFlowFetchesToBeCalledWithCorrectParams();
    expect(showWarningMessageSpy).toBeCalledWith(
      getResponseErrorMessage(NON_UNAUTHORIZED_401_ERROR_RESP)
    );
    expectStoreToDispatchLogout(false);
    expect(resp).toBeNull();
  });

  test('401 unauthorized -> refresh token flow succeeds -> 401 unauthorized response -> shows warning and logs out in non-assessment page', async () => {
    window.location.pathname = '/';
    mock401ErrorResponseOnce();
    mockPostRefresh(true);
    mock401ErrorResponseOnce();
    const resp = await makeRequest();

    expectPostRefreshToBeCalled(true);
    expectStoreToDispatchRefreshedTokens(true);
    expectRefreshFlowFetchesToBeCalledWithCorrectParams();
    expect(showWarningMessageSpy).toBeCalledWith(
      autoLogoutMessage,
      undefined,
      userSessionExpiredNotificationKey
    );
    expectStoreToDispatchLogout(true);
    expect(resp).toBeNull();
  });

  test('401 unauthorized -> refresh token flow succeeds -> 401 unauthorized response -> shows warning and does not logout in assessment page', async () => {
    window.location.pathname = '/courses/3/missions/1/0';
    mock401ErrorResponseOnce();
    mockPostRefresh(true);
    mock401ErrorResponseOnce();
    const resp = await makeRequest();

    expectPostRefreshToBeCalled(true);
    expectStoreToDispatchRefreshedTokens(true);
    expectRefreshFlowFetchesToBeCalledWithCorrectParams();
    expect(showWarningMessageSpy).toBeCalledWith(
      promptReloginMessage,
      -1,
      userSessionExpiredNotificationKey
    );
    expectStoreToDispatchLogout(false);
    expect(resp).toBeNull();
  });

  test('401 unauthorized -> refresh token flow fails -> shows warning and logs out in non-assessment page', async () => {
    window.location.pathname = '/';
    mock401ErrorResponseOnce();
    mockPostRefresh(false);
    mock401ErrorResponseOnce();
    const resp = await makeRequest();

    expectFetchToBeCalledWithCorrectParams();
    expectPostRefreshToBeCalled(true);
    expectStoreToDispatchRefreshedTokens(false);
    expect(showWarningMessageSpy).toBeCalledWith(
      autoLogoutMessage,
      undefined,
      userSessionExpiredNotificationKey
    );
    expectStoreToDispatchLogout(true);
    expect(resp).toBeNull();
  });

  test('401 unauthorized -> refresh token flow fails -> shows warning and does not logout in assessment page', async () => {
    window.location.pathname = '/courses/3/missions/1/1';
    mock401ErrorResponseOnce();
    mockPostRefresh(false);
    mock401ErrorResponseOnce();
    const resp = await makeRequest();

    expectFetchToBeCalledWithCorrectParams();
    expectPostRefreshToBeCalled(true);
    expectStoreToDispatchRefreshedTokens(false);
    expect(showWarningMessageSpy).toBeCalledWith(
      promptReloginMessage,
      -1,
      userSessionExpiredNotificationKey
    );
    expectStoreToDispatchLogout(false);
    expect(resp).toBeNull();
  });

  test('multiple 401 unauthorized requests -> triggers a SINGLE refresh token flow (success) -> refires original multiple API calls with refreshed access token', async () => {
    // Mock 3 parallel requests
    const numRequests = 3;
    for (let i = 0; i < numRequests; i++) {
      mock401ErrorResponseOnce();
    }
    mockPostRefresh(true);

    const requests = [makeRequest('GET'), makeRequest('POST'), makeRequest('DELETE')];
    expect(requests).toHaveLength(numRequests);

    // Fire requests off in parallel
    await Promise.all(requests);

    expectPostRefreshToBeCalled(true);
    expect(fetchMock).toBeCalledTimes(numRequests * 2);
    expect(fetchMock.mock.calls).toEqual(
      expect.arrayContaining(
        [fetchOptions, refreshFetchOptions].flatMap(opts =>
          (['GET', 'POST', 'DELETE'] as RequestMethod[]).map(method => [
            fullApiUrl,
            generateApiCallHeadersAndFetchOptions(method, opts)
          ])
        )
      )
    );
  });

  test('multiple 401 unauthorized requests -> triggers a SINGLE refresh token flow (fails) -> does not refire API requests', async () => {
    // Mock 3 parallel requests
    const numRequests = 3;
    for (let i = 0; i < numRequests; i++) {
      mock401ErrorResponseOnce();
    }
    mockPostRefresh(false);

    const requests = [makeRequest('GET'), makeRequest('POST'), makeRequest('DELETE')];
    expect(requests).toHaveLength(numRequests);

    // Fire requests off in parallel
    await Promise.all(requests);

    expectPostRefreshToBeCalled(true);
    expect(fetchMock).toBeCalledTimes(numRequests);
  });

  test('fetch throws network error -> shows warning and does not logout', async () => {
    mockNetworkErrorOnce();
    const resp = await makeRequest();

    expectFetchToBeCalledWithCorrectParams();
    expectPostRefreshToBeCalled(false);
    expect(showWarningMessageSpy).toBeCalledWith(
      networkErrorMessage,
      undefined,
      networkErrorNotificationKey
    );
    expectStoreToDispatchLogout(false);
    expect(resp).toBeNull();
  });
});
