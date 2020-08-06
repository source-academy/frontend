import { mount } from 'enzyme';
import React from 'react';

import { Role } from '../../../application/ApplicationTypes';
import AchievementViewGoal from '../AchievementViewGoal';

const mockProps = {
  userToEdit: null,
  role: Role.Student,
  goals: [],
  updateGoalProgress: () => {}
};

test('AchievementViewCompletion component renders correctly', () => {
  const sampleComponent = <AchievementViewGoal {...mockProps} />;
  const tree = mount(sampleComponent);
  expect(tree.debug()).toMatchSnapshot();
});
