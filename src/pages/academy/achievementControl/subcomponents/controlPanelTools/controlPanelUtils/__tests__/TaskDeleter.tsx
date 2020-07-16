import { mount } from 'enzyme';
import React from 'react';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';
import Inferencer from 'src/pages/achievements/dashboard/subcomponents/utils/Inferencer';

import TaskDeleter from '../TaskDeleter';

const mockProps = {
  editableAchievement: mockAchievements[0],
  inferencer: new Inferencer(mockAchievements),
  saveChanges: () => {}
};

test('TaskDeleter component renders correctly', () => {
  const component = <TaskDeleter {...mockProps} />;
  const tree = mount(component);
  expect(tree.debug()).toMatchSnapshot();
});
