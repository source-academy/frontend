import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';

import SicpNavigationBar from '../SicpNavigationBar';

vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useParams: vi.fn().mockReturnValue({ section: 'index' }),
  useNavigate: vi.fn().mockReturnValue(vi.fn())
}));

test('Navbar renders correctly', () => {
  const navbar = (
    <MemoryRouter>
      <SicpNavigationBar />
    </MemoryRouter>
  );
  const tree = render(navbar);
  expect(tree.asFragment()).toMatchSnapshot();
});
