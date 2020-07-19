import { mount } from 'enzyme';
import React from 'react';

import { mockAchievements } from '../../../../../../commons/mocks/AchievementMocks';
import AchievementInferencer from '../../../../dashboard/subcomponents/utils/AchievementInferencer';
import AchievementControlPanelTools from '../AchievementControlPanelTools';

const mockProps = {
  editableAchievement: mockAchievements[0],
  setEditableAchievement: () => {},
  inferencer: new AchievementInferencer(mockAchievements),
  saveChanges: () => {}
};

test('AchievementControlPanelTools component renders correctly', () => {
  const component = <AchievementControlPanelTools {...mockProps} />;
  const tree = mount(component);
  expect(tree.debug()).toMatchSnapshot();
});
