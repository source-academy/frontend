import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import * as ReactRouter from 'react-router';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';
import { shallowRender } from 'src/commons/utils/TestUtils';

import Sicp from '../Sicp';

describe('Sicp renders', () => {
  test('correctly', () => {
    jest.spyOn(ReactRouter, 'useParams').mockReturnValue({ section: 'index' });

    const sicp = (
      <Provider store={mockInitialStore()}>
        <Sicp />
      </Provider>
    );
    const tree = shallowRender(sicp);
    expect(tree).toMatchSnapshot();
  });

  test('index section correctly', () => {
    jest.spyOn(ReactRouter, 'useParams').mockReturnValue({ section: 'index' });
    jest.spyOn(ReactRouter, 'useNavigate').mockReturnValue(jest.fn());
    jest.spyOn(ReactRouter, 'useLocation').mockReturnValue({} as ReactRouter.Location);
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
