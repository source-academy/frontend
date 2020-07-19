import { mount } from 'enzyme';
import React from 'react';
import { AchievementAbility } from 'src/features/achievement/AchievementTypes';

import EditableAchievementAbility from '../EditableAchievementAbility';

const mockProps = {
  ability: AchievementAbility.COMMUNITY,
  changeAbility: () => {}
};

test('EditableAchievementAbility component renders correctly', () => {
  const goal = <EditableAchievementAbility {...mockProps} />;
  const tree = mount(goal);
  expect(tree.debug()).toMatchSnapshot();
});
