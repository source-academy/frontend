import { mount } from 'enzyme';
import React from 'react';

import { mockAchievements } from '../../../../../../..//commons/mocks/AchievementMocks';
import AchievementInferencer from '../../../../../dashboard/subcomponents/utils/AchievementInferencer';
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
