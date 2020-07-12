import React from 'react';

import { IconName, Icon } from '@blueprintjs/core';
import { FilterStatus } from '../../../commons/achievements/AchievementTypes';

type AchievementFilterProps = {
  filterStatus: FilterStatus;
  setFilterStatus: any;
  icon: IconName;
  count: number;
};

function AchievementFilter(props: AchievementFilterProps) {
  const { filterStatus, setFilterStatus, icon, count } = props;

  /**
   * Changes the filter status for the achievement page.
   */
  const changeFilterStatus = () => {
    setFilterStatus(filterStatus);
  };

  return (
    <div className="filter-button" onClick={changeFilterStatus}>
      <Icon color={'#ffffff'} iconSize={40} icon={icon} />
      <br />
      {filterStatus} [{count}]
    </div>
  );
}

export default AchievementFilter;
