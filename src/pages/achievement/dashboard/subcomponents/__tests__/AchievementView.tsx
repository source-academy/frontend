import { mount } from 'enzyme';
import React from 'react';

import { mockAchievements } from '../../../../../commons/mocks/AchievementMocks';
import AchievementView from '../AchievementView';
import AchievementInferencer from '../utils/AchievementInferencer';

const mockProps = {
  id: 1,
  inferencer: new AchievementInferencer(mockAchievements),
  handleGlow: () => {}
};

test('AchievementView component renders correctly', () => {
  const sampleComponent = <AchievementView {...mockProps} />;
  const tree = mount(sampleComponent);
  expect(tree.debug()).toMatchSnapshot();
});
