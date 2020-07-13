import { mount } from 'enzyme';
import React from 'react';

import AchievementHints from '../AchievementHints';

const mockProps = {
  release: new Date()
};

test('AchievementExp component renders correctly', () => {
  const app = <AchievementHints {...mockProps} />;
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
});
