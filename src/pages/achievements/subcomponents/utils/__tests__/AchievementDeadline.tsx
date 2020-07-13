import { mount } from 'enzyme';
import React from 'react';

import AchievementDeadline from '../AchievementDeadline';

const mockProps = {
  deadline: new Date()
};

test('AchievementDeadline component renders correctly', () => {
  const app = <AchievementDeadline {...mockProps} />;
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
});
