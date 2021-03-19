import renderer from 'react-test-renderer';

import * as GitHubUtils from '../../../features/github/GitHubUtils';
import GitHubCallback from '../GitHubCallback';

test('Application Client ID not deployed renders correctly', () => {
  const getClientIdMock = jest.spyOn(GitHubUtils, 'getClientId');
  getClientIdMock.mockImplementation(returnEmptyString);

  const grabAccessCodeFromURLMock = jest.spyOn(GitHubUtils, 'grabAccessCodeFromURL');
  grabAccessCodeFromURLMock.mockImplementation(returnLegitimateCode);

  const exchangeAccessCodeMock = jest.spyOn(
    GitHubUtils,
    'exchangeAccessCodeForAuthTokenContainingObject'
  );
  exchangeAccessCodeMock.mockImplementation(connectBackendSimulateSuccess);

  let component;

  renderer.act(() => {
    component = renderer.create(<GitHubCallback />);
  });

  expect(getClientIdMock).toBeCalledTimes(1);
  expect(grabAccessCodeFromURLMock).toBeCalledTimes(1);
  expect(exchangeAccessCodeMock).toBeCalledTimes(0);

  expect(component).toBeDefined();

  const tree = (component as any).toJSON();
  expect(tree).toMatchSnapshot();

  getClientIdMock.mockRestore();
  grabAccessCodeFromURLMock.mockRestore();
  exchangeAccessCodeMock.mockRestore();
});

test('Access code not found in return url renders correctly', () => {
  const getClientIdMock = jest.spyOn(GitHubUtils, 'getClientId');
  getClientIdMock.mockImplementation(returnLegitimateCode);

  const grabAccessCodeFromURLMock = jest.spyOn(GitHubUtils, 'grabAccessCodeFromURL');
  grabAccessCodeFromURLMock.mockImplementation(returnEmptyString);

  const exchangeAccessCodeMock = jest.spyOn(
    GitHubUtils,
    'exchangeAccessCodeForAuthTokenContainingObject'
  );
  exchangeAccessCodeMock.mockImplementation(connectBackendSimulateSuccess);

  let component;

  renderer.act(() => {
    component = renderer.create(<GitHubCallback />);
  });

  expect(getClientIdMock).toBeCalledTimes(1);
  expect(grabAccessCodeFromURLMock).toBeCalledTimes(1);
  expect(exchangeAccessCodeMock).toBeCalledTimes(0);

  expect(component).toBeDefined();

  const tree = (component as any).toJSON();
  expect(tree).toMatchSnapshot();

  getClientIdMock.mockRestore();
  grabAccessCodeFromURLMock.mockRestore();
  exchangeAccessCodeMock.mockRestore();
});

test('Cannot connect to server renders correctly', () => {
  const getClientIdMock = jest.spyOn(GitHubUtils, 'getClientId');
  getClientIdMock.mockImplementation(returnLegitimateCode);

  const grabAccessCodeFromURLMock = jest.spyOn(GitHubUtils, 'grabAccessCodeFromURL');
  grabAccessCodeFromURLMock.mockImplementation(returnLegitimateCode);

  const exchangeAccessCodeMock = jest.spyOn(
    GitHubUtils,
    'exchangeAccessCodeForAuthTokenContainingObject'
  );
  exchangeAccessCodeMock.mockImplementation(connectBackendSimulateFailure);

  let component;

  renderer.act(() => {
    component = renderer.create(<GitHubCallback />);
  });

  expect(getClientIdMock).toBeCalledTimes(1);
  expect(grabAccessCodeFromURLMock).toBeCalledTimes(1);
  expect(exchangeAccessCodeMock).toBeCalledTimes(1);

  expect(component).toBeDefined();

  const tree = (component as any).toJSON();
  expect(tree).toMatchSnapshot();

  getClientIdMock.mockRestore();
  grabAccessCodeFromURLMock.mockRestore();
  exchangeAccessCodeMock.mockRestore();
});

test('Successful retrieval of auth token renders correctly', () => {
  const getClientIdMock = jest.spyOn(GitHubUtils, 'getClientId');
  getClientIdMock.mockImplementation(returnLegitimateCode);

  const grabAccessCodeFromURLMock = jest.spyOn(GitHubUtils, 'grabAccessCodeFromURL');
  grabAccessCodeFromURLMock.mockImplementation(returnLegitimateCode);

  const exchangeAccessCodeMock = jest.spyOn(
    GitHubUtils,
    'exchangeAccessCodeForAuthTokenContainingObject'
  );
  exchangeAccessCodeMock.mockImplementation(connectBackendSimulateSuccess);

  let component;

  renderer.act(() => {
    component = renderer.create(<GitHubCallback />);
  });

  expect(getClientIdMock).toBeCalledTimes(1);
  expect(grabAccessCodeFromURLMock).toBeCalledTimes(1);
  expect(exchangeAccessCodeMock).toBeCalledTimes(1);

  expect(component).toBeDefined();

  const tree = (component as any).toJSON();
  expect(tree).toMatchSnapshot();

  getClientIdMock.mockRestore();
  grabAccessCodeFromURLMock.mockRestore();
  exchangeAccessCodeMock.mockRestore();
});

function returnLegitimateCode() {
  return '12345';
}

function returnEmptyString() {
  return '';
}

async function connectBackendSimulateSuccess(
  messageBody: string,
  backendLink: string
): Promise<Response> {
  return new Promise(() => {
    return new Response(JSON.stringify({ access_token: '12345' }));
  });
}

async function connectBackendSimulateFailure(
  messageBody: string,
  backendLink: string
): Promise<Response> {
  return new Promise(() => {
    return new Response();
  });
}
