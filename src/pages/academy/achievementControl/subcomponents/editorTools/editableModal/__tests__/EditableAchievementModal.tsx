import { mount } from 'enzyme';
import React from 'react';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';

import EditableAchievementModal from '../EditableAchievementModal';

const mockProps = {
  title: 'Sample Title',
  modal: mockAchievements[0].modal,
  changeModal: () => {}
};

test('EditableAchievementModal component renders correctly', () => {
  const modal = <EditableAchievementModal {...mockProps} />;
  const tree = mount(modal);
  expect(tree.debug()).toMatchSnapshot();
});
