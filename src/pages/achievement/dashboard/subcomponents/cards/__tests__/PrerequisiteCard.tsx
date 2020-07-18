import { mount } from 'enzyme';
import React from 'react';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';

import AchievementInferencer from '../../utils/AchievementInferencer';
import PrerequisiteCard from '../PrerequisiteCard';

const mockProps = {
  id: 1,
  inferencer: new AchievementInferencer(mockAchievements),
  shouldPartiallyRender: true,
  isDropdownOpen: true,
  isLast: false,
  displayModal: () => {},
  handleGlow: () => {}
};

test('PrerequisiteCard component renders correctly', () => {
  const sampleComponent = <PrerequisiteCard {...mockProps} />;
  const tree = mount(sampleComponent);
  expect(tree.debug()).toMatchSnapshot();
});
