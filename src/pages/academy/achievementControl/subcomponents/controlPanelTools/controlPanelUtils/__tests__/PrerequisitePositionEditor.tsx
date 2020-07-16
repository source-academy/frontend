import { mount } from 'enzyme';
import React from 'react';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';
import Inferencer from 'src/pages/achievements/subcomponents/utils/Inferencer';

import PrerequisitePositionEditor from '../PrerequisitePositionEditor';

const mockProps = {
  editableAchievement: mockAchievements[0],
  inferencer: new Inferencer(mockAchievements),
  saveChanges: () => {}
};

test('PrerequisitePositionEditor component renders correctly', () => {
  const component = <PrerequisitePositionEditor {...mockProps} />;
  const tree = mount(component);
  expect(tree.debug()).toMatchSnapshot();
});
