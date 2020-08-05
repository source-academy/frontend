import { mount } from 'enzyme';
import React from 'react';

import { mockAchievements, mockGoals } from '../../mocks/AchievementMocks';
import AchievementView from '../AchievementView';
import AchievementInferencer from '../utils/AchievementInferencer';

const mockProps = {
  id: 1,
  inferencer: new AchievementInferencer(mockAchievements, mockGoals),
  handleGlow: () => {}
};

test('AchievementView component renders correctly', () => {
  const sampleComponent = <AchievementView {...mockProps} />;
  const tree = mount(sampleComponent);
  expect(tree.debug()).toMatchSnapshot();
});
