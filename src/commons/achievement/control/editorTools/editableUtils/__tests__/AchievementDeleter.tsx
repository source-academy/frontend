import { mount } from 'enzyme';
import React from 'react';

import AchievementDeleter from '../AchievementDeleter';

const mockProps = {
  deleteAchievement: () => {}
};

test('AchievementDeleter component renders correctly', () => {
  const goal = <AchievementDeleter {...mockProps} />;
  const tree = mount(goal);
  expect(tree.debug()).toMatchSnapshot();
});
