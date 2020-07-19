import { mount } from 'enzyme';
import React from 'react';

import { mockAchievements } from '../../../../../../..//commons/mocks/AchievementMocks';
import AchievementInferencer from '../../../../../dashboard/subcomponents/utils/AchievementInferencer';
import PrerequisiteDeleter from '../PrerequisiteDeleter';

const mockProps = {
  editableAchievement: mockAchievements[0],
  setEditableAchievement: () => {},
  inferencer: new AchievementInferencer(mockAchievements),
  saveChanges: () => {}
};

test('PrerequisiteDeleter component renders correctly', () => {
  const component = <PrerequisiteDeleter {...mockProps} />;
  const tree = mount(component);
  expect(tree.debug()).toMatchSnapshot();
});
