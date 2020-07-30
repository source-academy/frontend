import { mount } from 'enzyme';
import React from 'react';

import { mockAchievements } from '../../../../../mocks/AchievementMocks';
import AchievementInferencer from '../../../../utils/AchievementInferencer';
import TaskAdder from '../TaskAdder';

const mockProps = {
  inferencer: new AchievementInferencer(mockAchievements),
  saveChanges: () => {}
};

test('TaskAdder component renders correctly', () => {
  const component = <TaskAdder {...mockProps} />;
  const tree = mount(component);
  expect(tree.debug()).toMatchSnapshot();
});
