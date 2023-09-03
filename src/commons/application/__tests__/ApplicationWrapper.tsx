import { render, screen, waitFor } from '@testing-library/react';
import moment from 'moment';
import { Provider } from 'react-redux';
import { createMemoryRouter,RouterProvider } from 'react-router';
import Constants from 'src/commons/utils/Constants';
import { createStore } from 'src/pages/createStore';
import { getFullAcademyRouterConfig, playgroundOnlyRouterConfig } from 'src/routes/routerConfig';

import { Role } from '../ApplicationTypes';
import ApplicationWrapper from '../ApplicationWrapper';

// JSDOM does not implement window.matchMedia, so we have to mock it.
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {}
    };
  };

describe('ApplicationWrapper', () => {
  let store = createStore();
  beforeEach(() => {
    store = createStore();
  });

  test('ApplicationWrapper renders NotFound on unknown routes (Full Academy)', async () => {
    const routerConfig = getFullAcademyRouterConfig({
      name: 'Bob',
      role: Role.Student,
      isLoggedIn: false,
      courseId: 1
    });

    const app = (
      <Provider store={store}>
        <RouterProvider
          router={createMemoryRouter(routerConfig, { initialEntries: ['/unknown'] })}
        />
      </Provider>
    );
    render(app);
    const element = await waitFor(() => screen.getByTestId('NotFound-Component'));
    expect(element).toBeTruthy();
  });

  test('ApplicationWrapper renders NotFound on unknown routes (Playground Only)', async () => {
    const routerConfig = playgroundOnlyRouterConfig;

    const app = (
      <Provider store={store}>
        <RouterProvider
          router={createMemoryRouter(routerConfig, { initialEntries: ['/unknown'] })}
        />
      </Provider>
    );
    render(app);
    const element = await waitFor(() => screen.getByTestId('NotFound-Component'));
    expect(element).toBeTruthy();
  });

  test('Application shows disabled when in disabled period', async () => {
    const origPeriods = Constants.disablePeriods;
    const origPlaygroundOnly = Constants.playgroundOnly;
    const now = moment();
    Constants.disablePeriods = [
      {
        start: now.clone().subtract(1, 'minute'),
        end: now.clone().add(1, 'minute'),
        reason: 'Testing'
      }
    ];
    Constants.playgroundOnly = true;

    const app = (
      <Provider store={store}>
        <ApplicationWrapper />
      </Provider>
    );

    render(app);
    const element = await waitFor(() => screen.getByTestId('Disabled-Component'));
    expect(element).toBeTruthy();
    expect(element).toHaveTextContent(
      'The Source Academy has been disabled for this reason: Testing.'
    );

    Constants.disablePeriods = origPeriods;
    Constants.playgroundOnly = origPlaygroundOnly;
  });
});
