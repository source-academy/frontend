import { mount } from 'enzyme';
import React from 'react';

import { mockAchievements } from '../../../../../mocks/AchievementMocks';
import AchievementInferencer from '../../../../utils/AchievementInferencer';
import PrerequisitePositionEditor from '../PrerequisitePositionEditor';

const mockProps = {
  editableAchievement: mockAchievements[0],
  inferencer: new AchievementInferencer(mockAchievements),
  saveChanges: () => {}
};

test('PrerequisitePositionEditor component renders correctly', () => {
  const component = <PrerequisitePositionEditor {...mockProps} />;
  const tree = mount(component);
  expect(tree.debug()).toMatchSnapshot();
});
