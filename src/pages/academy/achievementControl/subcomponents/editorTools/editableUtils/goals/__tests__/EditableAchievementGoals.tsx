// EditableAchievementGoals

import { mount } from 'enzyme';
import React from 'react';

import EditableAchievementGoals from '../EditableAchievementGoals';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';

const noGoalProps = {
  goals: [],
  editGoals: () => {},
  removeGoalFromBackend: () => {}
};

const goalProps = {
  goals: mockAchievements[0].goals,
  editGoals: () => {},
  removeGoalFromBackend: () => {}
};

test('AchievementExp component renders correctly', () => {
  const noGoals = <EditableAchievementGoals {...noGoalProps} />;
  const tree = mount(noGoals);
  expect(tree.debug()).toMatchSnapshot();

  const goals = <EditableAchievementGoals {...goalProps} />;
  const tree_1 = mount(goals);
  expect(tree_1.debug()).toMatchSnapshot();
});
