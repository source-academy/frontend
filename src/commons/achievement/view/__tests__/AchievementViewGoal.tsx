import { mount } from 'enzyme';
import React from 'react';

import AchievementViewGoal from '../AchievementViewGoal';
import { Role } from 'src/commons/application/ApplicationTypes';

const mockProps = {
  userToEdit: null, 
  role: Role.Student, 
  goals: [], 
  updateGoalProgress: () => {}, 
};

test('AchievementViewCompletion component renders correctly', () => {
  const sampleComponent = <AchievementViewGoal {...mockProps} />;
  const tree = mount(sampleComponent);
  expect(tree.debug()).toMatchSnapshot();
});
