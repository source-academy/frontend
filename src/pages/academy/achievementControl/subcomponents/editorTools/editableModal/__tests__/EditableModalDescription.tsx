import { mount } from 'enzyme';
import React from 'react';

import EditableModalDescription from '../EditableModalDescription';

const mockProps = {
  description: 'Sample Description',
  setDescription: () => {}
};

test('EditableModalDescription component renders correctly', () => {
  const description = <EditableModalDescription {...mockProps} />;
  const tree = mount(description);
  expect(tree.debug()).toMatchSnapshot();
});
