import { mount } from 'enzyme';
import React from 'react';

import AchievementViewCompletion from '../AchievementViewCompletion';

const mockProps = {
  awardedExp: 0,
  completionText: 'string'
};

test('AchievementViewCompletion component renders correctly', () => {
  const sampleComponent = <AchievementViewCompletion {...mockProps} />;
  const tree = mount(sampleComponent);
  expect(tree.debug()).toMatchSnapshot();
});
