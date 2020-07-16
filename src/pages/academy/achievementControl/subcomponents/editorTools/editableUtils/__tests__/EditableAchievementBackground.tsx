import { mount } from 'enzyme';
import React from 'react';

import EditableAchievementBackground from '../EditableAchievementBackground';

const mockProps = {
  backgroundImageUrl: '',
  setBackgroundImageUrl: () => {}
};

test('EditableAchievementBackground component renders correctly', () => {
  const goal = <EditableAchievementBackground {...mockProps} />;
  const tree = mount(goal);
  expect(tree.debug()).toMatchSnapshot();
});
