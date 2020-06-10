import React from 'react';

import { IconName, Icon } from '@blueprintjs/core';
import { AchievementStatus } from 'src/commons/achievements/AchievementTypes';

type AchievementCategoryProps = {
  status: AchievementStatus;
  setFilteredStatus: any;
  icon: IconName;
  count: number;
};

function AchievementCategory(props: AchievementCategoryProps) {
  const { icon, status, setFilteredStatus, count } = props;

  const changeFIlterStatus = () => {
    setFilteredStatus(status);
  };

  return (
    <div>
      <div onClick={changeFIlterStatus}>
        <Icon color={'#ffffff'} iconSize={44} icon={icon} />
        <br />
        {status} ({count})
      </div>
    </div>
  );
}

export default AchievementCategory;
