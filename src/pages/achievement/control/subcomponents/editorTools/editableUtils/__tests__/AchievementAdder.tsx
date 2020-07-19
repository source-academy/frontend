import { mount } from 'enzyme';
import React from 'react';

import { mockAchievements } from '../../../../../../../commons/mocks/AchievementMocks';
import AchievementInferencer from '../../../../../dashboard/subcomponents/utils/AchievementInferencer';
import AchievementAdder from '../AchievementAdder';

const mockProps = {
  inferencer: new AchievementInferencer(mockAchievements),
  adderId: 0,
  setAdderId: () => {}
};

test('AchievementAdder component renders correctly', () => {
  const goal = <AchievementAdder {...mockProps} />;
  const tree = mount(goal);
  expect(tree.debug()).toMatchSnapshot();
});
