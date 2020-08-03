import { mount } from 'enzyme';
import React from 'react';

import AchievementExp from '../AchievementExp';

const expProps = {
  exp: 0,
  isBonus: false
};

const undefinedExpProps = {
  exp: undefined,
  isBonus: false
};

test('AchievementExp component renders correctly', () => {
  const expPresent = <AchievementExp {...expProps} />;
  const tree = mount(expPresent);
  expect(tree.debug()).toMatchSnapshot();

  const expAbsent = <AchievementExp {...undefinedExpProps} />;
  const tree_1 = mount(expAbsent);
  expect(tree_1.debug()).toMatchSnapshot();
});
