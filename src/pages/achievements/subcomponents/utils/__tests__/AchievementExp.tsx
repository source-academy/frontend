import { mount } from 'enzyme';
import React from 'react';

import AchievementExp from '../AchievementExp';

const mockProps = {
  exp: 0
};

test('AchievementExp component renders correctly', () => {
  const app = <AchievementExp {...mockProps} />;
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
});
