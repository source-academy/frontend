import { mount } from 'enzyme';
import React from 'react';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';
import Inferencer from 'src/pages/achievement/dashboard/subcomponents/utils/Inferencer';

import AchievementControlPanelTools from '../AchievementControlPanelTools';

const mockProps = {
  editableAchievement: mockAchievements[0],
  setEditableAchievement: () => {},
  inferencer: new Inferencer(mockAchievements),
  saveChanges: () => {}
};

test('AchievementControlPanelTools component renders correctly', () => {
  const component = <AchievementControlPanelTools {...mockProps} />;
  const tree = mount(component);
  expect(tree.debug()).toMatchSnapshot();
});
