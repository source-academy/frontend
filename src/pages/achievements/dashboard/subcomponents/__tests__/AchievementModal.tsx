import { mount } from 'enzyme';
import React from 'react';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';

import AchievementModal from '../AchievementModal';
import Inferencer from '../utils/Inferencer';

const mockProps = {
  id: 1,
  inferencer: new Inferencer(mockAchievements),
  handleGlow: () => {}
};

test('AchievementModal component renders correctly', () => {
  const sampleComponent = <AchievementModal {...mockProps} />;
  const tree = mount(sampleComponent);
  expect(tree.debug()).toMatchSnapshot();
});
