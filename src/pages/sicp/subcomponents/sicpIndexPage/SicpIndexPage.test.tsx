import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { renderTreeJson } from 'src/commons/utils/TestUtils';
import { expect, test } from 'vitest';

import SicpIndexPage from './SicpIndexPage';

test('Sicp index page', async () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const tree = await renderTreeJson(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SicpIndexPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  expect(tree).toMatchSnapshot();
});
