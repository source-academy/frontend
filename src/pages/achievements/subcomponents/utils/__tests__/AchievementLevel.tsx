import { mount } from 'enzyme';
import React from 'react';

import AchievementLevel from '../AchievementLevel';

const mockProps = {
  studentExp: 0
};

test('AchievementLevel component renders correctly', () => {
  const app = <AchievementLevel {...mockProps} />;
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
});
