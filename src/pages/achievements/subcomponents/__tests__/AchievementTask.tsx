import { mount } from 'enzyme';
import React from 'react';
import { FilterStatus } from 'src/commons/achievements/AchievementTypes';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';

import AchievementTask from '../AchievementTask';
import Inferencer from '../utils/Inferencer';

const mockProps = {
  id: 1,
  inferencer: new Inferencer(mockAchievements),
  filterStatus: FilterStatus.ALL,
  displayModal: () => {},
  handleGlow: () => {}
};

test('AchievementModal component renders correctly', () => {
  const sampleComponent = <AchievementTask {...mockProps} />;
  const tree = mount(sampleComponent);
  expect(tree.debug()).toMatchSnapshot();
});
