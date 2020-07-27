import { mount } from 'enzyme';
import React from 'react';

import { mockAchievements } from '../../../../../mocks/AchievementMocks';
import AchievementInferencer from '../../../../utils/AchievementInferencer';
import TaskDeleter from '../TaskDeleter';

const mockProps = {
  editableAchievement: mockAchievements[0],
  inferencer: new AchievementInferencer(mockAchievements),
  saveChanges: () => {}
};

test('TaskDeleter component renders correctly', () => {
  const component = <TaskDeleter {...mockProps} />;
  const tree = mount(component);
  expect(tree.debug()).toMatchSnapshot();
});
