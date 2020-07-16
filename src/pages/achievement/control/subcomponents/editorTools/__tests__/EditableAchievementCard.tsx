import { mount } from 'enzyme';
import React from 'react';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';
import Inferencer from 'src/pages/achievement/dashboard/subcomponents/utils/Inferencer';

import EditableAchievementCard from '../EditableAchievementCard';

const mockProps = {
  achievement: mockAchievements[0],
  inferencer: new Inferencer(mockAchievements),
  updateAchievements: () => {},
  editAchievement: () => {},
  forceRender: () => {},
  adderId: mockAchievements[0].id,
  setAdderId: () => {},
  addUnsavedChange: () => {},
  removeUnsavedChange: () => {},
  removeGoal: () => {},
  removeAchievement: () => {}
};

test('EditableAchievementCard component renders correctly', () => {
  const component = <EditableAchievementCard {...mockProps} />;
  const tree = mount(component);
  expect(tree.debug()).toMatchSnapshot();
});
