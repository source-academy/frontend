import { mount, shallow } from 'enzyme';
import { Provider } from 'react-redux';
import * as ReactRouter from 'react-router';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';

import Sicp from '../Sicp';
import SicpIndexPage from '../subcomponents/SicpIndexPage';

describe('Sicp renders', () => {
  test('correctly', () => {
    jest.spyOn(ReactRouter, 'useParams').mockReturnValue({ section: 'index' });

    const sicp = (
      <Provider store={mockInitialStore()}>
        <Sicp />
      </Provider>
    );
    const tree = shallow(sicp);
    expect(tree.debug()).toMatchSnapshot();
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
    const wrapper = mount(sicp);
    expect(wrapper.contains(<SicpIndexPage />)).toBeTruthy();
  });
});
