import { act, render, screen } from '@testing-library/react';

import * as GitHubUtils from '../../../features/github/GitHubUtils';
import GitHubCallback from '../GitHubCallback';

test('Application Client ID not deployed renders correctly', async () => {
  const getClientIdMock = jest.spyOn(GitHubUtils, 'getClientId');
  getClientIdMock.mockImplementation(returnEmptyString);

  const grabAccessCodeFromURLMock = jest.spyOn(GitHubUtils, 'grabAccessCodeFromURL');
  grabAccessCodeFromURLMock.mockImplementation(returnLegitimateCode);

  const exchangeAccessCodeMock = jest.spyOn(
    GitHubUtils,
    'exchangeAccessCodeForAuthTokenContainingObject'
  );
  exchangeAccessCodeMock.mockImplementation(connectBackendSimulateSuccess);

  act(() => {
    render(<GitHubCallback />);
  });

  expect(getClientIdMock).toBeCalledTimes(1);
  expect(grabAccessCodeFromURLMock).toBeCalledTimes(1);
  expect(exchangeAccessCodeMock).toBeCalledTimes(0);

  await screen.findByText(
    'Client ID not included with deployment. Please try again or contact the website administrator.'
  );

  getClientIdMock.mockRestore();
  grabAccessCodeFromURLMock.mockRestore();
  exchangeAccessCodeMock.mockRestore();
});

test('Access code not found in return url renders correctly', async () => {
  const getClientIdMock = jest.spyOn(GitHubUtils, 'getClientId');
  getClientIdMock.mockImplementation(returnLegitimateCode);

  const grabAccessCodeFromURLMock = jest.spyOn(GitHubUtils, 'grabAccessCodeFromURL');
  grabAccessCodeFromURLMock.mockImplementation(returnEmptyString);

  const exchangeAccessCodeMock = jest.spyOn(
    GitHubUtils,
    'exchangeAccessCodeForAuthTokenContainingObject'
  );
  exchangeAccessCodeMock.mockImplementation(connectBackendSimulateSuccess);

  act(() => {
    render(<GitHubCallback />);
  });

  expect(getClientIdMock).toBeCalledTimes(1);
  expect(grabAccessCodeFromURLMock).toBeCalledTimes(1);
  expect(exchangeAccessCodeMock).toBeCalledTimes(0);

  await screen.findByText(
    'Access code not found in callback URL. Please try again or contact the website administrator.'
  );

  getClientIdMock.mockRestore();
  grabAccessCodeFromURLMock.mockRestore();
  exchangeAccessCodeMock.mockRestore();
});

test('Cannot connect to server renders correctly', async () => {
  const getClientIdMock = jest.spyOn(GitHubUtils, 'getClientId');
  getClientIdMock.mockImplementation(returnLegitimateCode);

  const grabAccessCodeFromURLMock = jest.spyOn(GitHubUtils, 'grabAccessCodeFromURL');
  grabAccessCodeFromURLMock.mockImplementation(returnLegitimateCode);

  const exchangeAccessCodeMock = jest.spyOn(
    GitHubUtils,
    'exchangeAccessCodeForAuthTokenContainingObject'
  );
  exchangeAccessCodeMock.mockImplementation(connectBackendSimulateFailure);

  act(() => {
    render(<GitHubCallback />);
  });

  expect(getClientIdMock).toBeCalledTimes(1);
  expect(grabAccessCodeFromURLMock).toBeCalledTimes(1);
  expect(exchangeAccessCodeMock).toBeCalledTimes(1);

  await screen.findByText(
    'Connection with server was denied, or incorrect payload received. Please try again or contact the website administrator.'
  );

  getClientIdMock.mockRestore();
  grabAccessCodeFromURLMock.mockRestore();
  exchangeAccessCodeMock.mockRestore();
});

test('Successful retrieval of auth token renders correctly', async () => {
  const getClientIdMock = jest.spyOn(GitHubUtils, 'getClientId');
  getClientIdMock.mockImplementation(returnLegitimateCode);

  const grabAccessCodeFromURLMock = jest.spyOn(GitHubUtils, 'grabAccessCodeFromURL');
  grabAccessCodeFromURLMock.mockImplementation(returnLegitimateCode);

  const exchangeAccessCodeMock = jest.spyOn(
    GitHubUtils,
    'exchangeAccessCodeForAuthTokenContainingObject'
  );
  exchangeAccessCodeMock.mockImplementation(connectBackendSimulateSuccess);

  const closeWindowMock = jest.spyOn(window, 'close');
  closeWindowMock.mockImplementation(() => {});

  act(() => {
    render(<GitHubCallback />);
  });

  expect(getClientIdMock).toBeCalledTimes(1);
  expect(grabAccessCodeFromURLMock).toBeCalledTimes(1);
  expect(exchangeAccessCodeMock).toBeCalledTimes(1);
  expect(closeWindowMock).toBeCalledTimes(1);

  getClientIdMock.mockRestore();
  grabAccessCodeFromURLMock.mockRestore();
  exchangeAccessCodeMock.mockRestore();
  closeWindowMock.mockRestore();
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
  return new Promise((resolve, reject) => {
    resolve(new Response(JSON.stringify({ access_token: 12345 })));
  });
}

async function connectBackendSimulateFailure(
  messageBody: string,
  backendLink: string
): Promise<Response> {
  return new Promise((resolve, reject) => {
    resolve(new Response());
  });
}
