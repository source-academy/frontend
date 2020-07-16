import { mount } from 'enzyme';
import React from 'react';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';
import Inferencer from 'src/pages/achievement/dashboard/subcomponents/utils/Inferencer';

import EditableAchievementTask from '../EditableAchievementTask';

const mockProps = {
  achievement: mockAchievements[0],
  inferencer: new Inferencer(mockAchievements),
  saveChanges: () => {}
};

test('EditableAchievementTask component renders correctly', () => {
  const component = <EditableAchievementTask {...mockProps} />;
  const tree = mount(component);
  expect(tree.debug()).toMatchSnapshot();
});
