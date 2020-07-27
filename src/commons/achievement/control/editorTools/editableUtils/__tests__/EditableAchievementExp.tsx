import { mount } from 'enzyme';
import React from 'react';

import EditableAchievementExp from '../EditableAchievementExp';

const mockProps = {
  exp: 0,
  changeExp: () => {}
};

test('EditableAchievementExp component renders correctly', () => {
  const goal = <EditableAchievementExp {...mockProps} />;
  const tree = mount(goal);
  expect(tree.debug()).toMatchSnapshot();
});
