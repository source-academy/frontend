import { mount } from 'enzyme';
import React from 'react';

import EditableAchievementBackground from '../EditableAchievementBackground';

const mockProps = {
  cardTileUrl: '',
  setcardTileUrl: () => {}
};

test('EditableAchievementBackground component renders correctly', () => {
  const goal = <EditableAchievementBackground {...mockProps} />;
  const tree = mount(goal);
  expect(tree.debug()).toMatchSnapshot();
});
