import { mount } from 'enzyme';
import React from 'react';

import EditableAchievementTitle from '../EditableAchievementTitle';

const mockProps = {
  title: '',
  changeTitle: () => {}
};

test('EditableAchievementTitle component renders correctly', () => {
  const goal = <EditableAchievementTitle {...mockProps} />;
  const tree = mount(goal);
  expect(tree.debug()).toMatchSnapshot();
});
