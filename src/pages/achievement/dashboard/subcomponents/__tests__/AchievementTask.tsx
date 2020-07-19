import { mount } from 'enzyme';
import React from 'react';

import { mockAchievements } from '../../../../../commons/mocks/AchievementMocks';
import { FilterStatus } from '../../../../../features/achievement/AchievementTypes';
import AchievementTask from '../AchievementTask';
import AchievementInferencer from '../utils/AchievementInferencer';

const mockProps = {
  id: 1,
  inferencer: new AchievementInferencer(mockAchievements),
  filterStatus: FilterStatus.ALL,
  displayModal: () => {},
  handleGlow: () => {}
};

test('AchievementView component renders correctly', () => {
  const sampleComponent = <AchievementTask {...mockProps} />;
  const tree = mount(sampleComponent);
  expect(tree.debug()).toMatchSnapshot();
});
