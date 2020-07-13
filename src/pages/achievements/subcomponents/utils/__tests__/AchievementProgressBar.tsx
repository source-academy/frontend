import { mount } from 'enzyme';
import React from 'react';

import AchievementProgressBar from '../AchievementProgressBar';

const mockProps = {
  progressFrac: 0,
  shouldAnimate: false
};

test('AchievementExp component renders correctly', () => {
  const app = <AchievementProgressBar {...mockProps} />;
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
});
