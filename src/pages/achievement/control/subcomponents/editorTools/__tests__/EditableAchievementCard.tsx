import { mount } from 'enzyme';
import React from 'react';

import { mockAchievements } from '../../../../../../commons/mocks/AchievementMocks';
import AchievementInferencer from '../../../../dashboard/subcomponents/utils/AchievementInferencer';
import EditableAchievementCard from '../EditableAchievementCard';

const mockProps = {
  achievement: mockAchievements[0],
  inferencer: new AchievementInferencer(mockAchievements),
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
