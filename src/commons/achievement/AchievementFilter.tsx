import { Icon, IconName } from '@blueprintjs/core';
import React from 'react';

import { getFilterColor } from '../../features/achievement/AchievementConstants';
import { FilterStatus } from '../../features/achievement/AchievementTypes';

type AchievementFilterProps = {
  ownStatus: FilterStatus;
  icon: IconName;
  filterState: [FilterStatus, any];
};

function AchievementFilter(props: AchievementFilterProps) {
  const { ownStatus, icon, filterState } = props;

  const [globalStatus, setGlobalStatus] = filterState;

  return (
    <div
      className="filter"
      onClick={() => setGlobalStatus(ownStatus)}
      style={{ color: getFilterColor(globalStatus, ownStatus) }}
    >
      <Icon iconSize={30} icon={icon} />
      <p>{ownStatus}</p>
    </div>
  );
}

export default AchievementFilter;
