import { mount } from 'enzyme';
import React from 'react';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';
import AchievementInferencer from 'src/pages/achievement/dashboard/subcomponents/utils/AchievementInferencer';

import AchievementControlPanel from '../AchievementControlPanel';

const mockProps = {
  inferencer: new AchievementInferencer(mockAchievements),
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
