import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { Location } from 'react-router';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';
import { shallowRender } from 'src/commons/utils/TestUtils';
import { vi } from 'vitest';

import Sicp from '../Sicp';

vi.mock('react-router', () => ({
  useParams: vi.fn().mockReturnValue({ section: 'index' }),
  useNavigate: vi.fn().mockReturnValue(vi.fn()),
  useLocation: vi.fn().mockReturnValue({} as Location)
}));

describe('Sicp renders', () => {
  test('correctly', () => {
    const sicp = (
      <Provider store={mockInitialStore()}>
        <Sicp />
      </Provider>
    );
    const tree = shallowRender(sicp);
    expect(tree).toMatchSnapshot();
  });

  test('index section correctly', () => {
    const sicp = (
      <Provider store={mockInitialStore()}>
        <Sicp />
      </Provider>
    );
    const { container } = render(sicp);
    expect(container.querySelector('.sicp-index-page')).toBeTruthy();
  });
});
