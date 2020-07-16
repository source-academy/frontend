import { mount } from 'enzyme';
import React from 'react';

import TaskUploader from '../TaskUploader';

const mockProps = {
  pendingUpload: false,
  uploadChanges: () => {}
};

test('TaskUploader component renders correctly', () => {
  const component = <TaskUploader {...mockProps} />;
  const tree = mount(component);
  expect(tree.debug()).toMatchSnapshot();
});
