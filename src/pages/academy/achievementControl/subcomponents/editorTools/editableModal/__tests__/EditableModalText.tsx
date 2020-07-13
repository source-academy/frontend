import { mount } from 'enzyme';
import React from 'react';

import EditableModalText from '../EditableModalText';

const mockProps = {
  goalText: 'Goal Text',
  setGoalText: () => {}
};

test('EditableModalImage component renders correctly', () => {
  const text = <EditableModalText {...mockProps} />;
  const tree = mount(text);
  expect(tree.debug()).toMatchSnapshot();
});
