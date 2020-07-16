import { mount } from 'enzyme';
import React from 'react';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';

import Inferencer from '../../utils/Inferencer';
import AchievementCard from '../AchievementCard';

const mockProps = {
  id: 1,
  inferencer: new Inferencer(mockAchievements),
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
