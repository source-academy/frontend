import { mount } from 'enzyme';
import React from 'react';

import { mockAchievements } from '../../../../../mocks/AchievementMocks';
import AchievementInferencer from '../../../../utils/AchievementInferencer';
import PrerequisiteSwapper from '../PrerequisiteSwapper';

const mockProps = {
  prerequisiteIdDs: mockAchievements[0].prerequisiteIds,
  inferencer: new AchievementInferencer(mockAchievements, mockGoals),

  setDialogOpen: () => {},
  isDialogOpen: false,
  swapPrerequisitePositionAction: () => {},

  firstID: mockAchievements[0].prerequisiteIds[0],
  setFirstID: () => {},
  secondID: mockAchievements[0].prerequisiteIds[1],
  setSecondID: () => {}
};

test('PrerequisiteSwapper component renders correctly', () => {
  const component = <PrerequisiteSwapper {...mockProps} />;
  const tree = mount(component);
  expect(tree.debug()).toMatchSnapshot();
});
