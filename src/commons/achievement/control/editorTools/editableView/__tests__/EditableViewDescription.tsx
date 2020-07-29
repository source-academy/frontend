import { mount } from 'enzyme';
import React from 'react';

import EditableViewDescription from '../EditableViewDescription';

const mockProps = {
  description: 'Sample Description',
  setDescription: () => {}
};

test('EditableViewDescription component renders correctly', () => {
  const description = <EditableViewDescription {...mockProps} />;
  const tree = mount(description);
  expect(tree.debug()).toMatchSnapshot();
});
