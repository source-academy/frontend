import { mount } from 'enzyme';
import React from 'react';

import { mockAchievements, mockGoals } from '../../../../../mocks/AchievementMocks';
import AchievementInferencer from '../../../../utils/AchievementInferencer';
import PrerequisiteDeleter from '../PrerequisiteDeleter';

const mockProps = {
  editableAchievement: mockAchievements[0],
  setEditableAchievement: () => {},
  inferencer: new AchievementInferencer(mockAchievements, mockGoals),
  saveChanges: () => {}
};

test('PrerequisiteDeleter component renders correctly', () => {
  const component = <PrerequisiteDeleter {...mockProps} />;
  const tree = mount(component);
  expect(tree.debug()).toMatchSnapshot();
});
