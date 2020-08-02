import { Icon, IconName } from '@blueprintjs/core';
import React from 'react';

import { FilterStatus } from '../../features/achievement/AchievementTypes';

type AchievementFilterProps = {
  filterStatus: FilterStatus;
  setFilterStatus: any;
  icon: IconName;
  count: number;
  getFilterColor: any;
};

function AchievementFilter(props: AchievementFilterProps) {
  const { filterStatus, setFilterStatus, icon, count, getFilterColor } = props;

  /**
   * Changes the filter status for the achievement page.
   */
  const changeFilterStatus = () => {
    setFilterStatus(filterStatus);
  };

  const filterColor = getFilterColor(filterStatus);

  return (
    <div className="filter" onClick={changeFilterStatus} style={{ color: filterColor }}>
      <Icon iconSize={30} icon={icon} />
      <p>
        {filterStatus} [{count}]
      </p>
    </div>
  );
}

export default AchievementFilter;
