import { mount } from 'enzyme';
import React from 'react';

import AchievementProgressBar from '../AchievementProgressBar';

const incompleteProgressProps = {
  progressFrac: 0,
  shouldAnimate: false
};

const completeProgressProps = {
  progressFrac: 1,
  shouldAnimate: false
};

test('AchievementProgressBar component renders correctly', () => {
  const incompleteProgress = <AchievementProgressBar {...incompleteProgressProps} />;
  const tree = mount(incompleteProgress);
  expect(tree.debug()).toMatchSnapshot();

  const completeProgress = <AchievementProgressBar {...completeProgressProps} />;
  const tree_1 = mount(completeProgress);
  expect(tree_1.debug()).toMatchSnapshot();
});
