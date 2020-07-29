import { mount } from 'enzyme';
import React from 'react';

import { mockAchievements } from '../../../../../mocks/AchievementMocks';
import AchievementInferencer from '../../../../utils/AchievementInferencer';
import PrerequisiteAdder from '../PrerequisiteAdder';

const mockProps = {
  editableAchievement: mockAchievements[0],
  setEditableAchievement: () => {},
  inferencer: new AchievementInferencer(mockAchievements),
  saveChanges: () => {}
};

test('PrerequisiteAdder component renders correctly', () => {
  const component = <PrerequisiteAdder {...mockProps} />;
  const tree = mount(component);
  expect(tree.debug()).toMatchSnapshot();
});
