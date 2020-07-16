import { mount } from 'enzyme';
import React from 'react';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';

import EditableAchievementGoal from '../EditableAchievementGoal';

const mockProps = {
  goal: mockAchievements[0].goals[0],
  editGoal: () => {},
  removeGoal: () => {}
};

test('AchievementExp component renders correctly', () => {
  const goal = <EditableAchievementGoal {...mockProps} />;
  const tree = mount(goal);
  expect(tree.debug()).toMatchSnapshot();
});
