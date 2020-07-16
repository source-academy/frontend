import { mount } from 'enzyme';
import React from 'react';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';
import Inferencer from 'src/pages/achievements/dashboard/subcomponents/utils/Inferencer';

import TaskAdder from '../TaskAdder';

const mockProps = {
  inferencer: new Inferencer(mockAchievements),
  saveChanges: () => {}
};

test('TaskAdder component renders correctly', () => {
  const component = <TaskAdder {...mockProps} />;
  const tree = mount(component);
  expect(tree.debug()).toMatchSnapshot();
});
