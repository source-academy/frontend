import { mount } from 'enzyme';
import React from 'react';

import { mockAchievements } from '../../../../../../../commons/mocks/AchievementMocks';
import EditableAchievementView from '../EditableAchievementView';

const mockProps = {
  title: 'Sample Title',
  modal: mockAchievements[0].modal,
  changeView: () => {}
};

test('EditableAchievementView component renders correctly', () => {
  const modal = <EditableAchievementView {...mockProps} />;
  const tree = mount(modal);
  expect(tree.debug()).toMatchSnapshot();
});
