import { mount } from 'enzyme';
import React from 'react';

import EditableViewText from '../EditableViewText';

const mockProps = {
  goalText: 'Goal Text',
  setGoalText: () => {}
};

test('EditableViewlImage component renders correctly', () => {
  const text = <EditableViewText {...mockProps} />;
  const tree = mount(text);
  expect(tree.debug()).toMatchSnapshot();
});
