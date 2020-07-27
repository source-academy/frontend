import { mount } from 'enzyme';
import React from 'react';

import AchievementViewGoal from '../AchievementViewGoal';

const mockProps = {
  goals: []
};

test('AchievementViewCompletion component renders correctly', () => {
  const sampleComponent = <AchievementViewGoal {...mockProps} />;
  const tree = mount(sampleComponent);
  expect(tree.debug()).toMatchSnapshot();
});
