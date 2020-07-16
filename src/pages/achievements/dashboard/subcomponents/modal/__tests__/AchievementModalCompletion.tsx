import { mount } from 'enzyme';
import React from 'react';

import AchievementModalCompletion from '../AchievementModalCompletion';

const mockProps = {
  awardedExp: 0,
  completionText: 'string'
};

test('AchievementModalCompletion component renders correctly', () => {
  const sampleComponent = <AchievementModalCompletion {...mockProps} />;
  const tree = mount(sampleComponent);
  expect(tree.debug()).toMatchSnapshot();
});
