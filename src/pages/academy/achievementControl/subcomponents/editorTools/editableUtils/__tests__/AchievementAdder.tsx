import { mount } from 'enzyme';
import React from 'react';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';
import Inferencer from 'src/pages/achievements/dashboard/subcomponents/utils/Inferencer';

import AchievementAdder from '../AchievementAdder';

const mockProps = {
  inferencer: new Inferencer(mockAchievements),
  adderId: 0,
  setAdderId: () => {}
};

test('AchievementAdder component renders correctly', () => {
  const goal = <AchievementAdder {...mockProps} />;
  const tree = mount(goal);
  expect(tree.debug()).toMatchSnapshot();
});
