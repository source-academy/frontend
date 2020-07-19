import { mount } from 'enzyme';
import React from 'react';

import { mockAchievements } from '../../../../../commons/mocks/AchievementMocks';
import AchievementInferencer from '../../../dashboard/subcomponents/utils/AchievementInferencer';
import AchievementEditor from '../AchievementEditor';

const mockProps = {
  inferencer: new AchievementInferencer(mockAchievements),
  updateAchievements: () => {},
  editAchievement: () => {},
  forceRender: () => {},
  addUnsavedChange: () => {},
  removeUnsavedChange: () => {},
  removeGoal: () => {},
  removeAchievement: () => {}
};

test('AchievementEditor component renders correctly', () => {
  const component = <AchievementEditor {...mockProps} />;
  const tree = mount(component);
  expect(tree.debug()).toMatchSnapshot();
});
