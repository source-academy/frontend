import { mount } from 'enzyme';

import SicpIndexPage from '../../subcomponents/SicpIndexPage';

test('Sicp index page', () => {
  const tree = mount(<SicpIndexPage />);
  expect(tree.debug()).toMatchSnapshot();
});
