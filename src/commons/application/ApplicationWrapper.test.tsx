import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { createStore } from 'src/pages/createStore';
import { getFullAcademyRouterConfig, playgroundOnlyRouterConfig } from 'src/routes/routerConfig';
import { describe, expect, test } from 'vitest';

import { mockInitialStore } from '../mocks/StoreMocks';

// JSDOM does not implement window.matchMedia, so we have to mock it.
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

describe('ApplicationWrapper', () => {
  test('ApplicationWrapper renders NotFound on unknown routes (Full Academy)', async () => {
    const routerConfig = getFullAcademyRouterConfig();

    const app = (
      <Provider
        store={mockInitialStore({
          session: { name: 'Bob', courseId: 1 },
        })}
      >
        <RouterProvider
          router={createMemoryRouter(routerConfig, { initialEntries: ['/unknown'] })}
        />
      </Provider>
    );
    render(app);
    const element = await screen.findByTestId('NotFound-Component', {}, { timeout: 5000 });
    expect(element).toBeTruthy();
  });

  test('ApplicationWrapper renders NotFound on unknown routes (Playground Only)', async () => {
    const routerConfig = playgroundOnlyRouterConfig;

    const app = (
      <Provider store={createStore()}>
        <RouterProvider
          router={createMemoryRouter(routerConfig, { initialEntries: ['/unknown'] })}
        />
      </Provider>
    );
    render(app);
    const element = await screen.findByTestId('NotFound-Component', {}, { timeout: 5000 });
    expect(element).toBeTruthy();
  });
});
