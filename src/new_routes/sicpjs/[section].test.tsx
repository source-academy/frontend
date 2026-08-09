import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';
import { renderTree } from 'src/commons/utils/TestUtils';
import { describe, expect, test, vi } from 'vitest';

import { Component as Sicp } from './[section]';

vi.mock('react-router', async importActual => ({
  ...(await importActual()),
  useOutletContext: vi.fn().mockReturnValue({ data: 'test data' }),
  useParams: vi.fn().mockReturnValue({ section: 'index' }),
}));

describe('Sicp renders', () => {
  test('correctly', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const sicp = (
      <QueryClientProvider client={queryClient}>
        <Provider store={mockInitialStore()}>
          <RouterProvider router={createMemoryRouter([{ index: true, Component: Sicp }])} />
        </Provider>
      </QueryClientProvider>
    );
    const tree = await renderTree(sicp);
    expect(tree).toMatchSnapshot();
  });

  test('index section correctly', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const sicp = (
      <QueryClientProvider client={queryClient}>
        <Provider store={mockInitialStore()}>
          <RouterProvider router={createMemoryRouter([{ index: true, Component: Sicp }])} />
        </Provider>
      </QueryClientProvider>
    );
    const { container } = render(sicp);
    expect(container.querySelector('.sicp-index-page')).toBeTruthy();
  });
});
