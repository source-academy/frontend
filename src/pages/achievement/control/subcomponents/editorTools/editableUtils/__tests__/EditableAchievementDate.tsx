import { mount } from 'enzyme';
import React from 'react';

import EditableAchievementDate from '../EditableAchievementDate';

const mockProps = {
  type: 'Deadline',
  deadline: new Date(),
  changeDeadline: () => {}
};

test('EditableAchievementDate component renders correctly', () => {
  const goal = <EditableAchievementDate {...mockProps} />;
  const tree = mount(goal);
  expect(tree.debug()).toMatchSnapshot();
});
