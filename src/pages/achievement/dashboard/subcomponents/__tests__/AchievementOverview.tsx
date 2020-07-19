import { mount } from 'enzyme';
import React from 'react';

import { mockAchievements } from '../../../../../commons/mocks/AchievementMocks';
import AchievementOverview from '../AchievementOverview';
import AchievementInferencer from '../utils/AchievementInferencer';

const mockProps = {
  name: 'Sample Name',
  studio: '08A',
  inferencer: new AchievementInferencer(mockAchievements)
};

test('AchievementView component renders correctly', () => {
  const sampleComponent = <AchievementOverview {...mockProps} />;
  const tree = mount(sampleComponent);
  expect(tree.debug()).toMatchSnapshot();
});
