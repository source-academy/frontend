import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { expect, test, vi } from 'vitest';

import { emptySearchData } from './autocomplete/query';
import SicpNavigationBar from './SicpNavigationBar';
import SicpTextbookNavigationBar from './SicpTextbookNavigationBar';

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

test('Navbar supports controlled navigation when embedded', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const handleNavigate = vi.fn();

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SicpTextbookNavigationBar
          routePrefix="/sicpjs"
          section="1.1"
          onNavigate={handleNavigate}
          getPrev={() => 'index'}
          getNext={() => '1.1.1'}
          queryKey="controlledSicpSearchData"
          fetchSearchData={async () => emptySearchData}
          toc={[]}
        />
      </MemoryRouter>
    </QueryClientProvider>,
  );

  fireEvent.click(screen.getByText('Next'));
  expect(handleNavigate).toHaveBeenCalledWith('1.1.1');
});
