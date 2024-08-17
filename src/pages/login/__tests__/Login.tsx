import { Store } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { Provider, useDispatch } from 'react-redux';
import * as ReactRouter from 'react-router';
import { createMemoryRouter, RouterProvider } from 'react-router';
import SessionActions from 'src/commons/application/actions/SessionActions';
import { OverallState } from 'src/commons/application/ApplicationTypes';

import { mockInitialStore } from '../../../commons/mocks/StoreMocks';
import Login from '../Login';
import LoginCallback from '../LoginCallback';
import LoginPage from '../LoginPage';

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
      otherAuthProviders: new Map([['luminus', { name: 'LumiNUS' }]]),
      defaultSourceChapter: 4,
      defaultSourceVariant: 'default'
    }
  };
});

const createTestComponent = (mockStore: Store<OverallState>, location: string) => {
  const router = createMemoryRouter(
    [
      {
        path: 'login',
        element: <Login />,
        children: [
          { path: '', element: <LoginPage /> },
          { path: 'callback', element: <LoginCallback /> }
        ]
      }
    ],
    { initialEntries: [location] }
  );
  return (
    <Provider store={mockStore}>
      <RouterProvider router={router} />
    </Provider>
  );
};

describe('Login', () => {
  beforeEach(() => {
    useDispatchMock.mockReturnValue(dispatchMock);
    dispatchMock.mockClear();
  });

  test('Login renders correctly', async () => {
    const store = mockInitialStore();
    const app = createTestComponent(store, '/login');
    const tree = render(app);
    expect(await tree.findByText('Log in with LumiNUS')).toBeTruthy();
  });

  test('Loading login renders correctly', async () => {
    const store = mockInitialStore();
    const app = createTestComponent(store, '/login/callback?code=abcde');
    const tree = render(app);
    expect(await tree.findByText('Logging In...')).toBeTruthy();
  });

  test('Dispatches fetchAuth when auth provider code is present and NOT logged in', () => {
    const providerId = 'luminus';
    const code = 'abcde';
    const store = mockInitialStore();
    const app = createTestComponent(store, `/login/callback?code=${code}&provider=${providerId}`);
    render(app);

    expect(dispatchMock).toHaveBeenCalledWith(SessionActions.fetchAuth(code, providerId));
  });

  test('Dispatches handleSamlRedirect when JWT cookies is present (from SAML redirect), and NOT logged in', () => {
    const jwtCookie = `{"access_token":"12345","refresh_token":"67890"}`;
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: `jwts=${jwtCookie}`
    });

    const store = mockInitialStore();
    const app = createTestComponent(store, `/login/callback`);
    render(app);

    expect(dispatchMock).toHaveBeenCalledWith(SessionActions.handleSamlRedirect(jwtCookie));
  });

  describe('When isLoggedIn and no course', () => {
    test('/login redirects to /welcome', () => {
      const navigateSpy = jest.fn();
      jest.spyOn(ReactRouter, 'useNavigate').mockReturnValue(navigateSpy);

      const store = mockInitialStore({
        session: {
          name: 'Bob'
        }
      });
      const app = createTestComponent(store, '/login');
      render(app);

      expect(navigateSpy).toHaveBeenCalledWith('/welcome');
    });

    test('/login/callback redirects to /welcome', () => {
      const navigateSpy = jest.fn();
      jest.spyOn(ReactRouter, 'useNavigate').mockReturnValue(navigateSpy);

      const store = mockInitialStore({
        session: {
          name: 'Bob'
        }
      });
      const app = createTestComponent(store, '/login/callback?code=abc');
      render(app);

      expect(navigateSpy).toHaveBeenCalledWith('/welcome');
    });
  });

  describe('When isLoggedIn and has course', () => {
    test('/login redirects to /courses/<courseId>', () => {
      const navigateSpy = jest.fn();
      jest.spyOn(ReactRouter, 'useNavigate').mockReturnValue(navigateSpy);

      const courseId = 2;
      const store = mockInitialStore({
        session: {
          name: 'Bob',
          courseId
        }
      });
      const app = createTestComponent(store, '/login');
      render(app);

      expect(navigateSpy).toHaveBeenCalledWith(`/courses/${courseId}`);
    });

    test('/login/callback redirects to /courses/<courseId>', () => {
      const navigateSpy = jest.fn();
      jest.spyOn(ReactRouter, 'useNavigate').mockReturnValue(navigateSpy);

      const courseId = 2;
      const store = mockInitialStore({
        session: {
          name: 'Bob',
          courseId
        }
      });
      const app = createTestComponent(store, '/login/callback');
      render(app);

      expect(navigateSpy).toHaveBeenCalledWith(`/courses/${courseId}`);
    });
  });

  test('/login/callback redirects to /login when not isLoggedIn, nor code/ticket nor SAML redirect', () => {
    const navigateSpy = jest.fn();
    jest.spyOn(ReactRouter, 'useNavigate').mockReturnValue(navigateSpy);

    const store = mockInitialStore();
    const app = createTestComponent(store, '/login/callback');
    render(app);

    expect(navigateSpy).toHaveBeenCalledWith('/login');
  });
});
