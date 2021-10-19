import { mount } from 'enzyme';

import SicpToc from '../SicpToc';

test('Sicp toc renders correctly', () => {
  const props = {
    handleCloseToc: () => {}
  };

  const tree = mount(<SicpToc {...props} />);
  expect(tree.debug()).toMatchSnapshot();
});
