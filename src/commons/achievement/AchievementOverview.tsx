import React from 'react';

import { UserSimpleState } from '../../commons/application/ApplicationTypes';
import { Role } from '../application/ApplicationTypes';
import AchievementGroupFilter from './AchievementGroupFilter';
import AchievementNameFilter from './AchievementNameFilter';
import AchievementInferencer from './utils/AchievementInferencer';
import AchievementLevel from './utils/AchievementLevel';

type AchievementOverviewProps = {
  name: string;
  role?: Role;
  studio: string;
  inferencer: AchievementInferencer;
  users: UserSimpleState[];

  filteredUserName: string;
  setFilteredUserName: any;
  filteredUserGroup: string;
  setFileredUserGroup: any;
};

function AchievementOverview(props: AchievementOverviewProps) {
  const {
    name,
    studio,
    inferencer,
    users,
    filteredUserName,
    setFilteredUserName,
    filteredUserGroup,
    setFileredUserGroup
  } = props;

  const studentExp = inferencer.getTotalExp();

  return (
    <div className="achievement-overview">
      <AchievementLevel studentExp={studentExp} />
      <AchievementNameFilter
        filteredUserName={filteredUserName}
        setFilteredUserName={setFilteredUserName}
        filteredUserGroup={filteredUserGroup}
        shouldFilter={true}
        name={name}
        studio={studio}
        users={users}
      />
      <AchievementGroupFilter
        setFileredUserGroup={setFileredUserGroup}
        filteredUserGroup={filteredUserGroup}
        shouldFilter={true}
        studio={studio}
        users={users}
      />
    </div>
  );
}

export default AchievementOverview;
