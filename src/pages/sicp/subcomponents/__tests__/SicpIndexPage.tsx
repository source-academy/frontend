import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router';

import SicpIndexPage from '../../subcomponents/SicpIndexPage';

test('Sicp index page', () => {
  const tree = mount(
    <MemoryRouter>
      <SicpIndexPage />
    </MemoryRouter>
  );
  expect(tree.debug()).toMatchSnapshot();
});
