import { mount } from 'enzyme';
import React from 'react';

import AchievementExp from '../AchievementExp';

const basicProps = {
  exp: 0,
  isBonus: false
};

const isBonusProps = {
  exp: 100,
  isBonus: true
};

test('AchievementExp component renders correctly', () => {
  const basicExp = <AchievementExp {...basicProps} />;
  const tree = mount(basicExp);
  expect(tree.debug()).toMatchSnapshot();

  const bonusExp = <AchievementExp {...isBonusProps} />;
  const tree_1 = mount(bonusExp);
  expect(tree_1.debug()).toMatchSnapshot();
});
