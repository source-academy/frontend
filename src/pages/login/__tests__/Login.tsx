import { render } from '@testing-library/react';
import { Provider, useDispatch } from 'react-redux';
import * as ReactRouter from 'react-router';
import { StaticRouter } from 'react-router-dom/server';
import { fetchAuth } from 'src/commons/application/actions/SessionActions';

import { mockInitialStore } from '../../../commons/mocks/StoreMocks';
import Login from '../Login';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn()
}));
const useDispatchMock = useDispatch as jest.Mock;
const dispatchMock = jest.fn();

jest.mock('../../../commons/utils/Constants', () => {
  return {
    __esModule: true,
    default: {
      authProviders: new Map([['luminus', { name: 'LumiNUS' }]]),
      defaultSourceChapter: 4,
      defaultSourceVariant: 'default'
    }
  };
});

describe('Login', () => {
  beforeEach(() => {
    useDispatchMock.mockReturnValue(dispatchMock);
    dispatchMock.mockClear();
  });

  test('Login renders correctly', async () => {
    const store = mockInitialStore();
    const app = (
      <Provider store={store}>
        <StaticRouter location="/login">
          <Login />
        </StaticRouter>
      </Provider>
    );
    const tree = render(app);
    expect(await tree.findByText('Log in with LumiNUS')).toBeTruthy();
  });

  test('Loading login renders correctly', async () => {
    const store = mockInitialStore();
    const app = (
      <Provider store={store}>
        <StaticRouter location="/login?code=abcde">
          <Login />
        </StaticRouter>
      </Provider>
    );
    const tree = render(app);
    expect(await tree.findByText('Logging In...')).toBeTruthy();
  });

  test('Dispatches fetchAuth when auth provider code is present and NOT logged in', () => {
    const providerId = 'luminus';
    const code = 'abcde';
    const store = mockInitialStore();
    const app = (
      <Provider store={store}>
        <StaticRouter location={`/login?code=${code}&provider=${providerId}`}>
          <Login />
        </StaticRouter>
      </Provider>
    );
    render(app);

    expect(dispatchMock).toBeCalledWith(fetchAuth(code, providerId));
  });

  test('Redirects to /welcome when isLoggedIn and no course', () => {
    const navigateSpy = jest.fn();
    jest.spyOn(ReactRouter, 'useNavigate').mockReturnValue(navigateSpy);

    const store = mockInitialStore({
      session: {
        name: 'Bob'
      }
    });
    const app = (
      <Provider store={store}>
        <StaticRouter location="/login">
          <Login />
        </StaticRouter>
      </Provider>
    );
    render(app);

    expect(navigateSpy).toBeCalledWith('/welcome');
  });

  test('Redirects to /courses/:courseId when isLoggedIn and has course', () => {
    const navigateSpy = jest.fn();
    jest.spyOn(ReactRouter, 'useNavigate').mockReturnValue(navigateSpy);

    const courseId = 2;
    const store = mockInitialStore({
      session: {
        name: 'Bob',
        courseId
      }
    });
    const app = (
      <Provider store={store}>
        <StaticRouter location="/login">
          <Login />
        </StaticRouter>
      </Provider>
    );
    render(app);

    expect(navigateSpy).toBeCalledWith(`/courses/${courseId}`);
  });
});
