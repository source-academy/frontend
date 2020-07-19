import { mount } from 'enzyme';
import React from 'react';

import { mockAchievements } from '../../../../../../../commons/mocks/AchievementMocks';
import EditableAchievementView from '../EditableAchievementView';

const mockProps = {
  title: 'Sample Title',
  view: mockAchievements[0].view,
  changeView: () => {}
};

test('EditableAchievementView component renders correctly', () => {
  const view = <EditableAchievementView {...mockProps} />;
  const tree = mount(view);
  expect(tree.debug()).toMatchSnapshot();
});
