import { mount } from 'enzyme';
import React from 'react';

import EditableAchievementGoal from '../EditableAchievementGoal';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';

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
