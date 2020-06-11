import React from 'react';

import { IconName, Icon } from '@blueprintjs/core';
import { FilterStatus } from 'src/commons/achievements/AchievementTypes';

type AchievementFilterProps = {
  status: FilterStatus;
  setFilteredStatus: any;
  icon: IconName;
  count: number;
};

function AchievementFilter(props: AchievementFilterProps) {
  const { icon, status, setFilteredStatus, count } = props;

  /**
   * Changes the filter status for the main achievement page.
   */
  const changeFilterStatus = () => {
    setFilteredStatus(status);
  };

  return (
    <div>
      <div onClick={changeFilterStatus}>
        <Icon color={'#ffffff'} iconSize={44} icon={icon} />
        <br />
        {status} ({count})
      </div>
    </div>
  );
}

export default AchievementFilter;
