import { mount } from 'enzyme';
import React from 'react';

import EditableAchievementGoal from '../EditableAchievementGoal';
import { defaultMockAchievements } from 'src/commons/mocks/AchievementMocks';

const moakcProps = {
  goal: defaultMockAchievements[0].goals[0],
  editGoal: () => {},
  removeGoal: () => {}
};

test('AchievementExp component renders correctly', () => {
  const goal = <EditableAchievementGoal {...moakcProps} />;
  const tree = mount(goal);
  expect(tree.debug()).toMatchSnapshot();
});
