import { IconNames } from '@blueprintjs/icons';
import { mount } from 'enzyme';
import React from 'react';
import { FilterStatus } from 'src/commons/achievements/AchievementTypes';

import AchievementFilter from '../AchievementFilter';

test('AchievementFilter component renders correctly', () => {
  const sampleComponent = (
    <AchievementFilter
      filterStatus={FilterStatus.ACTIVE}
      setFilterStatus={() => {}}
      icon={IconNames.LOCATE}
      count={0}
    />
  );
  const tree = mount(sampleComponent);
  expect(tree.debug()).toMatchSnapshot();
});
