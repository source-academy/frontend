import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { createStore } from 'src/pages/createStore';
import { getFullAcademyRouterConfig, playgroundOnlyRouterConfig } from 'src/routes/routerConfig';

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
});
