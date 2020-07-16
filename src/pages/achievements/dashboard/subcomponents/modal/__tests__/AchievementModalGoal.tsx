import { mount } from 'enzyme';
import React from 'react';

import AchievementModalGoal from '../AchievementModalGoal';

const mockProps = {
  goals: []
};

test('AchievementModalCompletion component renders correctly', () => {
  const sampleComponent = <AchievementModalGoal {...mockProps} />;
  const tree = mount(sampleComponent);
  expect(tree.debug()).toMatchSnapshot();
});
