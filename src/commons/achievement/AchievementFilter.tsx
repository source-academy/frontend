import { Icon, IconName } from '@blueprintjs/core';
import React from 'react';
import { getFilterColor } from 'src/features/achievement/AchievementConstants';
import { FilterStatus } from 'src/features/achievement/AchievementTypes';

type AchievementFilterProps = {
  filterState: [FilterStatus, any];
  icon: IconName;
  ownStatus: FilterStatus;
};

const AchievementFilter: React.FC<AchievementFilterProps> = ({ filterState, icon, ownStatus }) => {
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
