import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';
import { renderTree } from 'src/commons/utils/TestUtils';
import { describe, expect, test, vi } from 'vitest';

import { Component as Sicp } from '../../new_routes/sicpjs/[section]';

vi.mock('react-router', async importActual => ({
  ...(await importActual()),
  useOutletContext: vi.fn().mockReturnValue({ data: 'test data' }),
  useParams: vi.fn().mockReturnValue({ section: 'index' }),
}));

describe('Sicp renders', () => {
  test('correctly', async () => {
    const sicp = (
      <Provider store={mockInitialStore()}>
        <RouterProvider router={createMemoryRouter([{ index: true, Component: Sicp }])} />
      </Provider>
    );
    const tree = await renderTree(sicp);
    expect(tree).toMatchSnapshot();
  });

  test('index section correctly', () => {
    const sicp = (
      <Provider store={mockInitialStore()}>
        <RouterProvider router={createMemoryRouter([{ index: true, Component: Sicp }])} />
      </Provider>
    );
    const { container } = render(sicp);
    expect(container.querySelector('.sicp-index-page')).toBeTruthy();
  });
});
