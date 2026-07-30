import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, type RouteObject, RouterProvider } from 'react-router';
import LanguageDirectoryActions from 'src/features/directory/LanguageDirectoryActions';
import { store } from 'src/pages/createStore';
import { beforeAll, describe, expect, test } from 'vitest';

import { selectTextbookLanguageMiddleware } from './routerConfig';

// The middleware dispatches to the singleton `store` (the same instance the app's root <Provider>
// uses), so these tests observe that store rather than a fresh createStore().
const routes: RouteObject[] = [
  {
    path: 'sicpjs',
    middleware: [selectTextbookLanguageMiddleware('source1')],
    children: [{ path: ':section', Component: () => null }],
  },
  {
    path: 'sicpy',
    middleware: [selectTextbookLanguageMiddleware('python1')],
    children: [{ path: ':section', Component: () => null }],
  },
];

const renderAtPath = (path: string) =>
  render(
    <Provider store={store}>
      <RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />
    </Provider>,
  );

describe('textbook route language middleware', () => {
  beforeAll(async () => {
    // Let the init saga finish auto-selecting the default language, so its one-time
    // `setLanguages` -> `setSelectedLanguage` dispatch can't race with the middleware under test.
    await waitFor(() =>
      expect(store.getState().languageDirectory.languages.length).toBeGreaterThan(0),
    );
  });

  test('switches the selected language to Python when visiting the SICPy textbook', async () => {
    store.dispatch(LanguageDirectoryActions.setSelectedLanguage('source1'));

    renderAtPath('/sicpy/index');

    await waitFor(() =>
      expect(store.getState().languageDirectory.selectedLanguageId).toBe('python1'),
    );
  });

  test('switches the selected language to Source when visiting the SICP JS textbook', async () => {
    store.dispatch(LanguageDirectoryActions.setSelectedLanguage('python1'));

    renderAtPath('/sicpjs/index');

    await waitFor(() =>
      expect(store.getState().languageDirectory.selectedLanguageId).toBe('source1'),
    );
  });
});
