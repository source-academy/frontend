import { mount } from 'enzyme';
import React from 'react';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';
import Inferencer from 'src/pages/achievements/subcomponents/utils/Inferencer';

import PrerequisiteSwapper from '../PrerequisiteSwapper';

const mockProps = {
  prerequisiteIdDs: mockAchievements[0].prerequisiteIds,
  inferencer: new Inferencer(mockAchievements),

  setDialogOpen: () => {},
  isDialogOpen: false,
  action: () => {},

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
