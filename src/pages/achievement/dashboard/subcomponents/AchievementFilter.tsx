import { Icon, IconName } from '@blueprintjs/core';
import React from 'react';

import { FilterStatus } from '../../../../commons/achievement/AchievementTypes';

type AchievementFilterProps = {
  filterStatus: FilterStatus;
  setFilterStatus: any;
  icon: IconName;
  count: number;
  handleFilterColor: any;
};

function AchievementFilter(props: AchievementFilterProps) {
  const { filterStatus, setFilterStatus, icon, count, handleFilterColor } = props;

  /**
   * Changes the filter status for the achievement page.
   */
  const changeFilterStatus = () => {
    setFilterStatus(filterStatus);
  };

  const filterColor = handleFilterColor(filterStatus);

  return (
    <div className="filter-button" onClick={changeFilterStatus}>
      <Icon iconSize={40} icon={icon} color={filterColor} />
      <br />
      <span style={{ color: filterColor }}>
        {filterStatus} [{count}]
      </span>
    </div>
  );
}

export default AchievementFilter;
