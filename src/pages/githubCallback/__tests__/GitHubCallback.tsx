import { shallow } from 'enzyme';

import GitHubCallback from '../GitHubCallback';

test('Access code not found in return url renders correctly', () => {
  const props = {
    clientID: '12345',
    exchangeAccessCodeForAuthTokenContainingObject: stubExchangeAccessCodeForAuthTokenSimulateSuccess,
    grabAccessCodeFromURL: stubGrabAccessCodeFromURLReturnsEmptyString
  };

  const app = <GitHubCallback {...props} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('Application Client ID not deployed renders correctly', () => {
  const props = {
    clientID: '',
    exchangeAccessCodeForAuthTokenContainingObject: stubExchangeAccessCodeForAuthTokenSimulateSuccess,
    grabAccessCodeFromURL: stubGrabAccessCodeFromURLReturnsProperly
  };

  const app = <GitHubCallback {...props} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('Cannot connect to server renders correctly', () => {
  const props = {
    clientID: '12345',
    exchangeAccessCodeForAuthTokenContainingObject: stubExchangeAccessCodeForAuthTokenSimulateFailure,
    grabAccessCodeFromURL: stubGrabAccessCodeFromURLReturnsProperly
  };

  const app = <GitHubCallback {...props} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('Successful retrieval of auth token renders correctly', () => {
  const props = {
    clientID: '12345',
    exchangeAccessCodeForAuthTokenContainingObject: stubExchangeAccessCodeForAuthTokenSimulateSuccess,
    grabAccessCodeFromURL: stubGrabAccessCodeFromURLReturnsProperly
  };

  const app = <GitHubCallback {...props} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});

function stubGrabAccessCodeFromURLReturnsEmptyString(currentURLAddress: string): string {
  return '';
}

function stubGrabAccessCodeFromURLReturnsProperly(currentURLAddress: string): string {
  return 'SauceAcademy123456';
}

async function stubExchangeAccessCodeForAuthTokenSimulateFailure(
  backendLink: string,
  messageBody: string
): Promise<Response> {
  return new Promise(() => {
    return new Response();
  });
}

async function stubExchangeAccessCodeForAuthTokenSimulateSuccess(
  backendLink: string,
  messageBody: string
): Promise<Response> {
  return new Promise(() => {
    const res = new Response(JSON.stringify({ access_token: '123456' }));
    return res;
  });
}
