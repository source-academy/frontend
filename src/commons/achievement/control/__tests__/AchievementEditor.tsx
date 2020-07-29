import { mount } from 'enzyme';
import React from 'react';

import { mockAchievements } from '../../../mocks/AchievementMocks';
import AchievementInferencer from '../../utils/AchievementInferencer';
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
