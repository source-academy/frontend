import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { expect, test, vi } from 'vitest';

import SicpNavigationBar from './SicpNavigationBar';

vi.mock('react-router', async importActual => ({
  ...(await importActual()),
  useParams: vi.fn().mockReturnValue({ section: 'index' }),
  useNavigate: vi.fn().mockReturnValue(vi.fn()),
}));

test('Navbar renders correctly', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const navbar = (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SicpNavigationBar />
      </MemoryRouter>
    </QueryClientProvider>
  );
  const tree = render(navbar);
  expect(tree.asFragment()).toMatchSnapshot();
});
