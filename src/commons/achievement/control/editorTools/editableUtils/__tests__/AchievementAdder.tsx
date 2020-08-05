import { mount } from 'enzyme';
import React from 'react';

import { mockAchievements } from '../../../../../mocks/AchievementMocks';
import AchievementInferencer from '../../../../utils/AchievementInferencer';
import AchievementAdder from '../AchievementAdder';

const mockProps = {
  inferencer: new AchievementInferencer(mockAchievements, mockGoals),
  adderId: 0,
  setAdderId: () => {}
};

test('AchievementAdder component renders correctly', () => {
  const goal = <AchievementAdder {...mockProps} />;
  const tree = mount(goal);
  expect(tree.debug()).toMatchSnapshot();
});
