import { act } from '@testing-library/react';
import { mount } from 'enzyme';
import moment from 'moment';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router';
import Constants from 'src/commons/utils/Constants';
import { createStore } from 'src/pages/createStore';
import {
  getDisabledRouterConfig,
  getFullAcademyRouterConfig,
  playgroundOnlyRouterConfig
} from 'src/routes/routerConfig';

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

  test('ApplicationWrapper renders NotFound on unknown routes (Full Academy)', () => {
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
    const tree = mount(app);
    expect(tree.find('.NoPage').length).toBe(1);
    expect(tree.find('.NavigationBar__link.pt-active').length).toBe(0);
  });

  test('ApplicationWrapper renders NotFound on unknown routes (Playground Only)', () => {
    const routerConfig = playgroundOnlyRouterConfig;

    const app = (
      <Provider store={store}>
        <RouterProvider
          router={createMemoryRouter(routerConfig, { initialEntries: ['/unknown'] })}
        />
      </Provider>
    );
    const tree = mount(app);
    expect(tree.find('.NoPage').length).toBe(1);
    expect(tree.find('.NavigationBar__link.pt-active').length).toBe(0);
  });

  test('ApplicationWrapper renders Disabled on unknown routes (Disabled)', () => {
    const store = createStore();
    const routerConfig = getDisabledRouterConfig('testing');

    const app = (
      <Provider store={store}>
        <RouterProvider
          router={createMemoryRouter(routerConfig, { initialEntries: ['/unknown'] })}
        />
      </Provider>
    );
    const tree = mount(app);
    expect(tree.find('.NoPage').length).toBe(1);
    expect(
      tree.text().includes('The Source Academy has been disabled for this reason: testing.')
    ).toBe(true);
    expect(tree.find('.NavigationBar__link.pt-active').length).toBe(0);
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
    const tree = mount(app);

    // Let react-router loader functions finish running
    await waitForComponentToPaint(tree);

    expect(tree.debug()).toMatchSnapshot();

    Constants.disablePeriods = origPeriods;
    Constants.playgroundOnly = origPlaygroundOnly;
  });
});

const waitForComponentToPaint = async (wrapper: any) => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve));
    wrapper.update();
  });
};
