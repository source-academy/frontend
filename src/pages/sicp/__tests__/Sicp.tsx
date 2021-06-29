import { mount, shallow } from 'enzyme';
import { Provider } from 'react-redux';
import ReactRouter from 'react-router';
import { mockInitialStore } from 'src/commons/mocks/StoreMocks';

import Sicp from '../Sicp';
import SicpIndexPage from '../subcomponents/SicpIndexPage';

const routeComponentPropsMock = {
  history: {} as any,
  location: {} as any,
  match: {} as any
};

describe('Sicp renders', () => {
  test('correctly', () => {
    jest.spyOn(ReactRouter, 'useParams').mockReturnValue({ section: 'index' });

    const sicp = (
      <Provider store={mockInitialStore()}>
        <Sicp {...routeComponentPropsMock} />
      </Provider>
    );
    const tree = shallow(sicp);
    expect(tree.debug()).toMatchSnapshot();
  });

  test('index section correctly', () => {
    jest.spyOn(ReactRouter, 'useParams').mockReturnValue({ section: 'index' });
    window.HTMLElement.prototype.scrollIntoView = function () {};

    const sicp = (
      <Provider store={mockInitialStore()}>
        <Sicp {...routeComponentPropsMock} />
      </Provider>
    );
    const wrapper = mount(sicp);
    expect(wrapper.contains(<SicpIndexPage />)).toBeTruthy();
  });
});
