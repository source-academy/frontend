import { mount } from 'enzyme';
import React from 'react';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';

import AchievementModal from '../AchievementModal';
import AchievementInferencer from '../utils/AchievementInferencer';

const mockProps = {
  id: 1,
  inferencer: new AchievementInferencer(mockAchievements),
  handleGlow: () => {}
};

test('AchievementModal component renders correctly', () => {
  const sampleComponent = <AchievementModal {...mockProps} />;
  const tree = mount(sampleComponent);
  expect(tree.debug()).toMatchSnapshot();
});
