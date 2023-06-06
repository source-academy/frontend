import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router';

import SicpToc from '../SicpToc';

test('Sicp toc renders correctly', () => {
  const props = {
    handleCloseToc: () => {}
  };

  const tree = mount(
    <MemoryRouter>
      <SicpToc {...props} />
    </MemoryRouter>
  );
  expect(tree.debug()).toMatchSnapshot();
});
