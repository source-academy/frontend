import { Icon, IconName } from '@blueprintjs/core';
import React from 'react';

import { getFilterColor } from '../../features/achievement/AchievementConstants';
import { FilterStatus } from '../../features/achievement/AchievementTypes';

type Props = {
  filterState: [FilterStatus, any];
  icon: IconName;
  ownStatus: FilterStatus;
};

const AchievementFilter: React.FC<Props> = ({ filterState, icon, ownStatus }) => {
  const [globalStatus, setGlobalStatus] = filterState;

  return (
    <div
      className="filter"
      onClick={() => setGlobalStatus(ownStatus)}
      style={{ color: getFilterColor(globalStatus, ownStatus) }}
    >
      <Icon icon={icon} iconSize={30} />
      <p>{ownStatus}</p>
    </div>
  );
};

export default AchievementFilter;
