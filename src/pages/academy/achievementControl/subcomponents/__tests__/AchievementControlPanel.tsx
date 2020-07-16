import { mount } from 'enzyme';
import React from 'react';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';
import Inferencer from 'src/pages/achievements/subcomponents/utils/Inferencer';

import AchievementControlPanel from '../AchievementControlPanel';

const mockProps = {
  inferencer: new Inferencer(mockAchievements),
  updateAchievements: () => {},
  forceRender: () => {},
  isDisabled: false,

  pendingUpload: () => {},
  setPendingUpload: () => {},
  saveAchievementsToFrontEnd: () => {}
};

test('AchievementControlPanel component renders correctly', () => {
  const component = <AchievementControlPanel {...mockProps} />;
  const tree = mount(component);
  expect(tree.debug()).toMatchSnapshot();
});
