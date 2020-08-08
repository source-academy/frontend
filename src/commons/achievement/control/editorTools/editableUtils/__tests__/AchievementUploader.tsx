import { mount } from 'enzyme';
import React from 'react';

import AchievementUploader from '../AchievementUploader';

const mockProps = {
  hasChanges: false,
  saveChanges: () => {},
  discardChanges: () => {},
  pendingUpload: false,
  uploadChanges: () => {}
};

test('AchievementUploader component renders correctly', () => {
  const goal = <AchievementUploader {...mockProps} />;
  const tree = mount(goal);
  expect(tree.debug()).toMatchSnapshot();
});
