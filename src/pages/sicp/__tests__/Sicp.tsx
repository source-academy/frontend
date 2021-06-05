import { mount, shallow } from 'enzyme';
import ReactRouter from 'react-router';
import ContentDisplay from 'src/commons/ContentDisplay';

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

    const navbar = <Sicp {...routeComponentPropsMock} />;
    const tree = shallow(navbar);
    expect(tree.debug()).toMatchSnapshot();
  });

  test('index section correctly', () => {
    jest.spyOn(ReactRouter, 'useParams').mockReturnValue({ section: 'index' });
    window.HTMLElement.prototype.scrollIntoView = function () {};

    const navbar = <Sicp {...routeComponentPropsMock} />;
    const wrapper = mount(navbar);
    const display = wrapper.find(ContentDisplay);
    expect(display.prop('display')).toEqual(<SicpIndexPage />);
  });
});
