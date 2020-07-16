import { mount } from 'enzyme';
import React from 'react';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';
import Inferencer from 'src/pages/achievement/dashboard/subcomponents/utils/Inferencer';

import PrerequisiteAdder from '../PrerequisiteAdder';

const mockProps = {
  editableAchievement: mockAchievements[0],
  setEditableAchievement: () => {},
  inferencer: new Inferencer(mockAchievements),
  saveChanges: () => {}
};

test('PrerequisiteAdder component renders correctly', () => {
  const component = <PrerequisiteAdder {...mockProps} />;
  const tree = mount(component);
  expect(tree.debug()).toMatchSnapshot();
});
