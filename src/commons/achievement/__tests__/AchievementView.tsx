import { mount } from 'enzyme';
import React from 'react';

import { Role } from '../../application/ApplicationTypes';
import { mockAchievements, mockGoals } from '../../mocks/AchievementMocks';
import AchievementView from '../AchievementView';
import AchievementInferencer from '../utils/AchievementInferencer';

const mockProps = {
  id: 1,
  role: Role.Student,
  inferencer: new AchievementInferencer(mockAchievements, mockGoals),
  handleGlow: () => {},
  updateGoalProgress: () => {}
};

test('AchievementView component renders correctly', () => {
  const sampleComponent = <AchievementView {...mockProps} />;
  const tree = mount(sampleComponent);
  expect(tree.debug()).toMatchSnapshot();
});
