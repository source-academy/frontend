import { mount } from 'enzyme';
import React from 'react';

import { mockAchievements } from '../../../../../../commons/mocks/AchievementMocks';
import AchievementInferencer from '../../utils/AchievementInferencer';
import AchievementCard from '../AchievementCard';

const mockProps = {
  id: 1,
  inferencer: new AchievementInferencer(mockAchievements),
  shouldPartiallyRender: true,
  isDropdownOpen: true,
  toggleDropdown: () => {},
  displayModal: () => {},
  handleGlow: () => {}
};

test('AchievementCard component renders correctly', () => {
  const sampleComponent = <AchievementCard {...mockProps} />;
  const tree = mount(sampleComponent);
  expect(tree.debug()).toMatchSnapshot();
});
