import { mount } from 'enzyme';
import React from 'react';

import { mockAchievements } from '../../../../../commons/mocks/AchievementMocks';
import AchievementCard from '../AchievementCard';
import AchievementInferencer from '../utils/AchievementInferencer';

const mockProps = {
  id: 1,
  inferencer: new AchievementInferencer(mockAchievements),
  shouldPartiallyRender: true,
  isDropdownOpen: true,
  toggleDropdown: () => {},
  displayView: () => {},
  handleGlow: () => {}
};

test('AchievementCard component renders correctly', () => {
  const sampleComponent = <AchievementCard {...mockProps} />;
  const tree = mount(sampleComponent);
  expect(tree.debug()).toMatchSnapshot();
});
