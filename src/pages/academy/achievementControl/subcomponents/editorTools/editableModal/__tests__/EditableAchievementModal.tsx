import { mount } from 'enzyme';
import React from 'react';

import EditableAchievementModal from '../EditableAchievementModal';
import { defaultMockAchievements } from 'src/commons/mocks/AchievementMocks';

const mockProps = {
  title: 'Sample Title',
  modal: defaultMockAchievements[0].modal,
  changeModal: () => {}
};

test('EditableAchievementModal component renders correctly', () => {
  const modal = <EditableAchievementModal {...mockProps} />;
  const tree = mount(modal);
  expect(tree.debug()).toMatchSnapshot();
});
