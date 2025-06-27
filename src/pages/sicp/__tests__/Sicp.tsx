import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { Location } from 'react-router';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';
import { shallowRender } from 'src/commons/utils/TestUtils';

import Sicp from '../Sicp';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: jest.fn().mockReturnValue({ section: 'index' }),
  useNavigate: jest.fn().mockReturnValue(jest.fn()),
  useLocation: jest.fn().mockReturnValue({} as Location)
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
    window.HTMLElement.prototype.scrollIntoView = function () {};

    const sicp = (
      <Provider store={mockInitialStore()}>
        <Sicp />
      </Provider>
    );
    const { container } = render(sicp);
    expect(container.querySelector('.sicp-index-page')).toBeTruthy();
  });
});
