import { mount } from 'enzyme';
import React from 'react';

import { mockAchievements, mockGoals } from '../../../../../mocks/AchievementMocks';
import AchievementInferencer from '../../../../utils/AchievementInferencer';
import TaskPositionInserter from '../TaskPositionInserter';

const mockProps = {
  editableAchievement: mockAchievements[0],
  setEditableAchievement: () => {},
  inferencer: new AchievementInferencer(mockAchievements, mockGoals),
  saveChanges: () => {}
};

test('TaskPositionInserter component renders correctly', () => {
  const component = <TaskPositionInserter {...mockProps} />;
  const tree = mount(component);
  expect(tree.debug()).toMatchSnapshot();
});
