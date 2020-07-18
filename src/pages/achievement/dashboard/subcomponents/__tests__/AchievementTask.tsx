import { mount } from 'enzyme';
import React from 'react';
import { FilterStatus } from 'src/commons/achievement/AchievementTypes';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';

import AchievementTask from '../AchievementTask';
import AchievementInferencer from '../utils/AchievementInferencer';

const mockProps = {
  id: 1,
  inferencer: new AchievementInferencer(mockAchievements),
  filterStatus: FilterStatus.ALL,
  displayModal: () => {},
  handleGlow: () => {}
};

test('AchievementModal component renders correctly', () => {
  const sampleComponent = <AchievementTask {...mockProps} />;
  const tree = mount(sampleComponent);
  expect(tree.debug()).toMatchSnapshot();
});
